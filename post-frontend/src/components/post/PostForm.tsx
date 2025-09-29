import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Editor } from '@toast-ui/react-editor';
import axiosPost from '@/api/axiosPost';
import CategorySelect from './CategorySelect';
import PostTitleInput from './PostTitleInput';
import PostContentEditor from './PostContentEditor';
import PostTagInput from './PostTagInput';
import AttachmentUploader from './AttachmentUploader';
import type { ExistingAttachment } from './AttachmentUploader';
import FormActions from './FormActions';
import { addToast } from '@/store/slices/toastSlice';
import type { PostDetailDTO } from '@/types/Post';
import { fixContentForSave } from '@/utils/contentUrlHelper';
import type { PostRequest } from '@/types/PostRequest';

interface PostFormProps {
  mode: 'write' | 'edit';
  initialData?: PostDetailDTO;
}

export default function PostForm({ mode, initialData }: PostFormProps) {
  const editorRef = useRef<Editor>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ 단일 상태 객체
  const [formData, setFormData] = useState<PostRequest>({
    title: initialData?.title ?? '',
    categoryId: initialData?.categoryId ?? 0,
    content: initialData?.content ?? '',
    tags: [],
    deleteTagIds: [],
    attachments: [],
  });

  // ✅ 수정 모드 전용: 기존 첨부파일 + 삭제대상
  const [existingAttachments] = useState<ExistingAttachment[]>(
    initialData?.attachments?.map((att) => ({
      id: att.id,
      originalName: att.originFileName,
    })) ?? [],
  );
  const [deleteIds, setDeleteIds] = useState<number[]>([]);

  // ✅ 최종 저장 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const editorInstance = editorRef.current?.getInstance();
    if (!editorInstance) return;

    let content = editorInstance.getMarkdown();

    // blob URL → 서버 업로드
    const blobRegex = /!\[.*?\]\((blob:[^)]+)\)/g;
    const matches = [...content.matchAll(blobRegex)];

    for (const match of matches) {
      const blobUrl = match[1];
      try {
        const blob = await fetch(blobUrl).then((r) => r.blob());
        const imgForm = new FormData();
        imgForm.append('image', blob, 'upload.png');

        const { data } = await axiosPost.post('/images/upload', imgForm, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (data?.url) {
          content = content.replace(blobUrl, data.url);
        }
      } catch (err) {
        console.error('이미지 업로드 중 오류:', err);
      }
    }

    content = fixContentForSave(content);

    // ✅ formData → FormData 변환
    const fd = new FormData();
    fd.append('title', formData.title);
    fd.append('categoryId', String(formData.categoryId));
    fd.append('content', content);
    fd.append('tags', formData.tags.map((t) => t.name).join(','));

    if (formData.deleteTagIds && formData.deleteTagIds.length > 0) {
      fd.append('deleteTagIds', formData.deleteTagIds.join(','));
    }

    if (deleteIds.length > 0) {
      fd.append('deleteIds', deleteIds.join(',')); // ✅ 기존 첨부 삭제대상
    }

    formData.attachments?.forEach((file) => {
      fd.append('attachments', file);
    });

    try {
      let res;
      if (mode === 'write') {
        res = await axiosPost.post('/posts', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        const postId = initialData?.id;
        res = await axiosPost.put(`/posts/${postId}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      const postId = res.data;
      if (postId) {
        dispatch(
          addToast({
            text:
              mode === 'write'
                ? '게시글이 성공적으로 등록되었습니다.'
                : '게시글이 성공적으로 수정되었습니다.',
            type: 'success',
            duration: 4000,
          }),
        );
        navigate(`/posts/${postId}`);
      } else {
        dispatch(
          addToast({
            text: '게시글 ID를 불러오지 못했습니다.',
            type: 'error',
          }),
        );
      }
    } catch (error) {
      console.error('게시글 저장 실패', error);
      dispatch(
        addToast({
          text: mode === 'write' ? '게시글 등록에 실패했습니다.' : '게시글 수정에 실패했습니다.',
          type: 'error',
        }),
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
      />
      <PostTagInput
        postId={mode === 'edit' ? initialData?.id : undefined}
        value={formData.tags}
        onChange={(tags, deleteTagIds) => setFormData((prev) => ({ ...prev, tags, deleteTagIds }))}
      />
      <AttachmentUploader
        files={formData.attachments || []}
        onChange={(files) => setFormData((prev) => ({ ...prev, attachments: files }))}
        existingAttachments={existingAttachments}
        deleteIds={deleteIds}
        onDeleteIdsChange={setDeleteIds}
      />
      <FormActions />
    </form>
  );
}
