import { useEffect, useState } from 'react';
import { useAppSelector } from "@/store/hooks";
import { fetchCommentsByPostId, createComment, deleteComment } from '@/api/postApi';
import type { CommentResponse } from '@/types/Comment';
import Avatar from '@/components/common/Avatar';
import { Button } from '@/components/ui/button';
import { withToast } from '@/utils/withToast';
import ConfirmModal from '@/components/common/ConfirmModal';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

interface UserCommentProps {
  postId: number;
}

export default function UserComment({ postId }: UserCommentProps) {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [newComment, setNewComment] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<CommentResponse | null>(null);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [open, setOpen] = useState(false);

  // 댓글 목록 불러오기
  const loadComments = async () => {
    const data = await fetchCommentsByPostId(postId);
    setComments(data);
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  // 댓글 작성
  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    await withToast(createComment(postId, newComment), {
      success: '댓글이 등록되었습니다.',
      error: '댓글 등록 실패',
    });

    setNewComment('');
    await loadComments();
  };

  // 댓글 삭제
  const handleDelete = async (commentId: number) => {
    await withToast(deleteComment(postId, commentId), {
      success: '댓글이 삭제되었습니다.',
      error: '댓글 삭제 실패',
    });
    await loadComments();
  };

  const { status } = useAppSelector((state) => state.auth);
    
  const isAuthenticated = status === "authenticated";

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold mb-4">댓글</h3>

      {/* 입력창 */}
      {isAuthenticated && (
        <div className="flex gap-3 mb-4">
          <Avatar src={currentUser?.profileImageUrl} alt={currentUser?.nickname} size={40} />
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요..."
            className="flex-1 border rounded p-2 resize-none"
          />
          <Button onClick={handleSubmit}>등록</Button>
        </div>
      )}

      {/* 댓글 목록 */}
      <div className="space-y-3">
        {comments.length > 0 ? (
          comments.map((c) => (
            
            <div
              key={c.id}
              className="p-4 border rounded-md bg-white hover:shadow-md transition flex gap-3"
            >
              <Avatar src={c.profileImageUrl} alt={c.nickname} size={40} />

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-700">
                    {c.nickname} 
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-800 whitespace-pre-line">{c.content}</p>
              </div>

              {/* 본인 댓글일 때만 삭제 버튼 */}
              {currentUser?.uuid === c.memberUuid && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    setDeleteTarget(c);
                    setOpen(true); // ✅ 모달 열기
                  }}
                  className="self-start"
                >
                  삭제
                </Button>
              )}
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500 border rounded-md bg-gray-50">
            댓글이 없습니다.
          </div>
        )}
      </div>

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <ConfirmModal
          open={open}
          title="댓글 삭제"
          description={`정말 이 댓글을 삭제하시겠습니까?`}
          onConfirm={() => handleDelete(deleteTarget.id)} // ✅ 인자 없는 함수
          onCancel={() => setOpen(false)}
        />
      )}
    </div>
  );
}
