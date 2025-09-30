// src/pages/PostEditPage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPostDetail } from '@/api/postApi';
import type { PostDetailDTO } from '@/types/Post';
import PostForm from '@/components/post/PostForm';

export default function PostEditPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<PostDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const data = await fetchPostDetail(Number(id));
        setPost(data);
      } catch (err) {
        console.error('게시글 로딩 실패', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) return <div>로딩중...</div>;
  if (!post) return <div>게시글을 불러올 수 없습니다.</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">게시글 수정</h1>
      {post && <PostForm mode="edit" initialData={post} />}
    </div>
  );
}
