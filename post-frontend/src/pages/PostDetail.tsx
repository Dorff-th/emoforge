import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@store/store';
import { fetchPostDetail, getPostTags, deletePost } from '@/api/postApi';
import { useAppSelector } from "@/store/hooks";
import type { PostDetailDTO } from '@/types/Post';
import { Viewer } from '@toast-ui/react-editor';
import { Button } from '@/components/ui/button';
import ConfirmModal from '@/components/common/ConfirmModal';
import { withToast } from '@/utils/withToast';
import UserComment from '@/components/user/UserComment';
import type { Tag } from '@/types/Tag';
import { backendBaseUrl } from '@/config/config';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<PostDetailDTO | null>(null);
  const [open, setOpen] = useState(false);
  const [_openConfirm, _setOpenConfirm] = useState(false);
  const navigate = useNavigate();

  const postId: number = Number(id);

  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    if (id) {
      fetchPostDetail(Number(id)).then(setPost).catch(console.error);
    }
  }, [id]);

  useEffect(() => {
    getPostTags(postId)
      .then(setTags)
      .catch(() => setTags([]));
  }, [postId]);

  const { status } = useAppSelector((state) => state.auth);
  const isAuthenticated = status === "authenticated";

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const isAuthor = isAuthenticated && currentUser?.memberUuid === post?.memberUuid;

  //todo 삭제 기능 구현
  const handleDelete = async (id: number) => {
    await withToast(
      deletePost(id).then(() => navigate(`/posts`)),
      { success: '삭제가 완료 되었습니다.' },
    );
  };

  const handleConfirm = (id: number) => {
    handleDelete(id); // ✅ 이제 여기서 실제 삭제 실행
    setOpen(false);
  };

  if (!post) return <div className="p-6">로딩중...</div>;

  return (
    <div className="p-6">
      {/* 제목 */}
      <h2 className="text-2xl font-bold mb-2">{post.title}</h2>

      {/* 작성자 + 작성일 */}
      <div className="text-sm text-gray-500 mb-4">
        {post.nickname} · {new Date(post.createdAt).toLocaleString('ko-KR')}
      </div>

      {/* 본문 */}
      <div className="border rounded-lg p-4 bg-white shadow mb-6">
        <Viewer initialValue={post.content.replace(/\/uploads\//g, `${backendBaseUrl}/uploads/`)} />
      </div>

      {/* ✅ 태그 리스트 */}
      {tags?.length ? (
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-full cursor-pointer hover:underline"
              onClick={() => navigate(`/posts/tags/${tag.name}`)}
            >
              #{tag.name}
            </span>
          ))}
        </div>
      ) : null}
      {/* ✅ 첨부파일 리스트 */}
      {post.attachments && post.attachments.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">첨부파일</h3>
          <ul className="space-y-1">
            {post.attachments.map((att) => (
              <li key={att.id}>
                <a
                  href={`${backendBaseUrl}/api/attach/download/${att.id}`}
                  className="text-blue-600 hover:underline transition-colors"
                >
                  {att.originFileName} ({att.fileSizeText})
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 버튼 영역 */}
      <div className="flex space-x-2">
        <button
          onClick={() => navigate('/posts')}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          To List
        </button>

        {isAuthor && (
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/posts/${post.id}/edit`)}
              className="px-4 py-2 rounded bg-blue-400 hover:bg-gray-300"
            >
              To Edit
            </button>
            <Button variant="destructive" onClick={() => setOpen(true)}>
              삭제
            </Button>
          </div>
        )}
        <ConfirmModal
          open={open}
          title="게시물 삭제"
          description={`정말로 "${post.title}" 게시물을 삭제하시겠습니까?`}
          onConfirm={() => handleConfirm(post.id)}
          onCancel={() => setOpen(false)}
        />
      </div>

      {/* 댓글 관리 섹션 */}
      <UserComment postId={postId} />
    </div>
  );
}
