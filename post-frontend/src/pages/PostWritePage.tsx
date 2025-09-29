import { useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import PostForm from '@/components/post/PostForm';

export default function PostWritePage() {
  const groupTempKey = useMemo(() => uuidv4(), []);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">게시글 작성</h1>
      <PostForm mode="write" groupTempKey={groupTempKey} />
    </div>
  );
}
