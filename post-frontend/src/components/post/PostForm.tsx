import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Editor } from '@toast-ui/react-editor';
import axiosPost from '@/api/axiosPost';
import axiosAttach from '@/api/axiosAttach';
import CategorySelect from './CategorySelect';
import PostTitleInput from './PostTitleInput';
import PostContentEditor from './PostContentEditor';
import PostTagInput from './PostTagInput';
import AttachmentUploader from './AttachmentUploader';
import FormActions from './FormActions';
import { addToast } from '@/store/slices/toastSlice';
import type { PostDetailDTO } from '@/types/Post';
import { fixContentForSave } from '@/utils/contentUrlHelper';
import type { PostRequest } from '@/types/PostRequest';
import { v4 as uuidv4 } from 'uuid';
import type { AttachmentItem } from '@/types/Attachment';

interface PostFormProps {
  mode: 'write' | 'edit';
  initialData?: PostDetailDTO;
  groupTempKey?: string;
}

export default function PostForm({ mode, initialData, groupTempKey }: PostFormProps) {
  const editorRef = useRef<Editor>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const attachmentGroupTempKeyRef = useRef(groupTempKey ?? uuidv4());
  const existingPostId = initialData?.id;

  const [formData, setFormData] = useState<PostRequest>({
    title: initialData?.title ?? '',
    categoryId: initialData?.categoryId ?? 0,
    content: initialData?.content ?? '',
    tags: [],
    deleteTagIds: [],
    attachmentIds: [],
  });

  // 신규+기존 첨부파일 관리
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [deleteAttachmentIds, setDeleteAttachmentIds] = useState<number[]>([]);

  // 수정 모드일 경우 기존 첨부 로드
  useEffect(() => {
    if (mode === 'edit' && existingPostId) {
      axiosAttach.get(`/attach/post/${existingPostId}`, { 
        params: { uploadType: 'ATTACHMENT' },
      }).then((res) => {
        setAttachments(res.data.map((a: any) => ({ ...a, isNew: false })));
      });
    }
  }, [mode, existingPostId]);

  const handleAttachmentChange = useCallback((items: AttachmentItem[]) => {
    setAttachments(items);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const editorInstance = editorRef.current?.getInstance();
    if (!editorInstance) return;

    let content = editorInstance.getMarkdown();
    content = fixContentForSave(content);

    const basePayload = {
      title: formData.title,
      categoryId: formData.categoryId,
      content,
      tags: formData.tags.map((t) => t.name).join(','),
    };

    const payload =
      mode === 'edit'
        ? {
            ...basePayload,
            id: existingPostId,
            authorUuid: initialData?.memberUuid,
            deleteTagIds: formData.deleteTagIds?.length
              ? formData.deleteTagIds.join(',')
              : undefined,
          }
        : basePayload;

    try {
      let res;
      if (mode === 'write') {
        res = await axiosPost.post('/posts', payload);
      } else {
        res = await axiosPost.put(`/posts/${existingPostId}`, payload);
      }
      const postId = res.data;

      if (!postId) throw new Error('postId 없음');

      // 1) 신규 첨부 확정
      if (attachmentGroupTempKeyRef.current) {
        await axiosAttach.post('/attach/confirm', {
          groupTempKey: attachmentGroupTempKeyRef.current,
          postId,
        });
      }

      // 2) 기존 첨부 일괄 삭제
      if (deleteAttachmentIds.length > 0) {
        await axiosAttach.post('/attach/delete/batch', {
          attachmentIds: deleteAttachmentIds,
        });
      }

      // 3) 에디터 이미지 정리
      const mdImgRegex = /!\[[^\]]*]\((?<url>[^)\s]+)(?:\s+"[^"]*")?\)/g;
      const fileUrls: string[] = [];
      for (const match of content.matchAll(mdImgRegex)) {
        const url = (match as RegExpMatchArray).groups?.url ?? (match as RegExpMatchArray)[1];
        if (url && !url.startsWith('blob:')) fileUrls.push(url);
      }
      await axiosAttach.post('/attach/cleanup/editor', {
        postId,
        fileUrls,
      });

      dispatch(
        addToast({
          text: mode === 'write' ? '게시글이 등록되었습니다.' : '게시글이 수정되었습니다.',
          type: 'success',
          duration: 4000,
        })
      );
      navigate(`/posts/${postId}`);
    } catch (error) {
      console.error('게시글 저장 실패', error);
      dispatch(
        addToast({
          text: mode === 'write' ? '게시글 등록 실패' : '게시글 수정 실패',
          type: 'error',
        })
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <CategorySelect
        value={formData.categoryId}
        onChange={(val) => setFormData((prev) => ({ ...prev, categoryId: val }))}
      />
      <PostTitleInput
        value={formData.title}
        onChange={(val) => setFormData((prev) => ({ ...prev, title: val }))}
      />
      <PostContentEditor
        ref={editorRef}
        value={formData.content}
        onChange={(val) => setFormData((prev) => ({ ...prev, content: val }))}
        groupTempKey={attachmentGroupTempKeyRef.current}
        postId={mode === 'edit' ? existingPostId : undefined}
      />
      <PostTagInput
        postId={mode === 'edit' ? existingPostId : undefined}
        value={formData.tags}
        onChange={(tags, deleteTagIds) =>
          setFormData((prev) => ({ ...prev, tags, deleteTagIds }))
        }
      />
      <AttachmentUploader
        groupTempKey={attachmentGroupTempKeyRef.current}
        items={attachments}
        setItems={setAttachments}
        deleteIds={deleteAttachmentIds}
        setDeleteIds={setDeleteAttachmentIds}
      />
      <FormActions />
    </form>
  );
}
