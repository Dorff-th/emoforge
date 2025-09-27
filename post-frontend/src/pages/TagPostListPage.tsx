// src/pages/PostListPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from "@/store/hooks";
import { fetchPosts, fetchPostsByTag } from '@/api/postApi';
import type { PostDTO } from '@/types/Post';
import type { PageResponse } from '@/types/Common';
import Pagination from '@/components/common/Pagination';
import { withToast } from '@/utils/withToast';
import NewPostButton from '@/components/ui/NewPostButton';

export default function TagPostListPage() {
  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [pageInfo, setPageInfo] = useState<PageResponse<PostDTO> | null>(null);
  const [page, setPage] = useState(1);

  const navigate = useNavigate();
  const { tagName } = useParams<{ tagName?: string }>();

    const { status } = useAppSelector((state) => state.auth);
    const isAuthenticated = status === "authenticated";

  const loadPosts = async (pageNum: number) => {
    const data = await withToast(
      tagName
        ? fetchPostsByTag(tagName, pageNum, 10, 'createdAt', 'DESC')
        : fetchPosts(pageNum, 10, 'createdAt', 'DESC'),
      { error: '게시글 목록 로드 실패' },
    );

    if (data) {
      setPosts(data.dtoList);
      setPageInfo(data);
      setPage(pageNum);
    }
  };

  useEffect(() => {
    loadPosts(1);
  }, [tagName]);

  return (
    <div className="px-4 sm:px-8 py-8 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">
        {tagName ? (
          <>
            태그 검색 결과: <span className="text-blue-600">#{tagName}</span>
          </>
        ) : (
          '게시글 목록'
        )}
      </h2>

      {isAuthenticated && (
        <div className="mb-4 flex">
          <NewPostButton />
        </div>
      )}

      {/* 📌 게시글 카드 리스트 */}
      <div className="max-w-5xl mx-auto space-y-4 p-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post.id}
              data-id={post.id}
              className="post-card bg-white rounded-lg shadow-md p-4
                         hover:shadow-lg hover:-translate-y-1 hover:scale-[1.01]
                         transform transition duration-300 cursor-pointer"
              onClick={() => navigate(`/posts/${post.id}`)}
            >
              {/* 제목 */}
              <h3 className="text-base font-semibold text-gray-900 mb-2">{post.title}</h3>

              {/* 댓글/첨부 */}
              <div className="mb-2 space-x-3 text-sm">
                {post.commentCount > 0 && <span>💬 댓글 ({post.commentCount})</span>}
                {post.attachmentCount > 0 && <span>💾 첨부 ({post.attachmentCount})</span>}
              </div>

              {/* 카테고리 · 날짜 · 닉네임 */}
              <p className="text-sm text-gray-500">
                <span>{post.categoryName}</span>
                <span className="mx-1">·</span>
                <span>
                  {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </span>
                <span className="mx-1">·</span>
                <span>{post.nickname}</span>
              </p>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-8">게시글이 없습니다.</div>
        )}
      </div>

      {isAuthenticated && (
        <div className="mt-6 flex">
          <NewPostButton size="sm" />
        </div>
      )}

      {/* 📌 페이징 컴포넌트 */}
      {pageInfo && (
        <div className="mt-6">
          <Pagination
            page={page}
            startPage={pageInfo.startPage}
            endPage={pageInfo.endPage}
            prev={pageInfo.prev}
            next={pageInfo.next}
            onPageChange={loadPosts}
          />
        </div>
      )}
    </div>
  );
}
