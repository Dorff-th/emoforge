import { useCallback, useRef, useState } from 'react';
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

  const [formData, setFormData] = useState<PostRequest>({
    title: initialData?.title ?? '',
    categoryId: initialData?.categoryId ?? 0,
    content: initialData?.content ?? '',
    tags: [],
    deleteTagIds: [],
    attachmentIds: [],
  });

  const handleAttachmentChange = useCallback((attachmentIds: number[]) => {
    setFormData((prev) => ({ ...prev, attachmentIds }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const editorInstance = editorRef.current?.getInstance();
    if (!editorInstance) return;

    let content = editorInstance.getMarkdown();

    // const blobRegex = /!\[.*?\]\((blob:[^)]+)\)/g;
    // const matches = [...content.matchAll(blobRegex)];

    // for (const match of matches) {
    //   const blobUrl = match[1];
    //   try {
    //     const blob = await fetch(blobUrl).then((r) => r.blob());
    //     const imgForm = new FormData();
    //     imgForm.append('image', blob, 'upload.png');

    //     const { data } = await axiosPost.post('/images/upload', imgForm, {
    //       headers: { 'Content-Type': 'multipart/form-data' },
    //     });

    //     if (data?.url) {
    //       content = content.replace(blobUrl, data.url);
    //     }
    //   } catch (err) {
    //     console.error('이미지 업로드 실패:', err);
    //   }
    // }

    content = fixContentForSave(content);

    // const fd = new FormData();
    // fd.append('title', formData.title);
    // fd.append('categoryId', String(formData.categoryId));
    // fd.append('content', content);
    // fd.append(
    //   'tags',
    //   formData.tags.map((t) => t.name).join(','),
    // );

    // if (formData.deleteTagIds && formData.deleteTagIds.length > 0) {
    //   fd.append('deleteTagIds', formData.deleteTagIds.join(','));
    // }

    const payload = {
      title: formData.title,
      categoryId: formData.categoryId,
      content: content,
      //tags: formData.tags.map((t) => t.name), // 배열 그대로 보내는 게 더 일반적
      tags: formData.tags.map((t) => t.name).join(','),
      deleteTagIds: formData.deleteTagIds && formData.deleteTagIds.length > 0 
        ? formData.deleteTagIds 
      : []
    };

    try {
      let res;
      if (mode === 'write') {
        res = await axiosPost.post('/posts', payload, {
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        const postId = initialData?.id;
        res = await axiosPost.put(`/posts/${postId}`, payload, {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const postId = res.data;
      if (postId) {
        if (
          mode === 'write' &&
          attachmentGroupTempKeyRef.current &&
          (formData.attachmentIds?.length ?? 0) > 0
        ) {
          try {
            await axiosAttach.post('/attach/confirm', {
              groupTempKey: attachmentGroupTempKeyRef.current,
              postId,
            });
          } catch (error) {
            console.error('첨부파일 확정 실패', error);
            dispatch(
              addToast({
                text: '첨부파일을 확정하는 데 실패했습니다.',
                type: 'error',
              }),
            );
          }
        }

        dispatch(
          addToast({
            text:
              mode === 'write'
                ? '게시글이 정상적으로 등록되었습니다.'
                : '게시글이 정상적으로 수정되었습니다.',
            type: 'success',
            duration: 4000,
          }),
        );
        navigate(`/posts/${postId}`);
      } else {
        dispatch(
          addToast({
            text: '게시글 ID를 확인할 수 없습니다.',
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
        groupTempKey={attachmentGroupTempKeyRef.current}
      />
      <PostTagInput
        postId={mode === 'edit' ? initialData?.id : undefined}
        value={formData.tags}
        onChange={(tags, deleteTagIds) =>
          setFormData((prev) => ({ ...prev, tags, deleteTagIds }))
        }
      />
      <AttachmentUploader
        groupTempKey={attachmentGroupTempKeyRef.current}
        onChange={handleAttachmentChange}
      />
      <FormActions />
    </form>
  );
}
