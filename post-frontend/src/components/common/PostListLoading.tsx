//post 리스트 전용 로딩 오버레이
const PostListPageLoading = () => {
  return (
    <div className="space-y-4 py-8">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-16 w-full animate-pulse rounded-md bg-gray-100"
        />
      ))}
    </div>
  );
};

export default PostListPageLoading;
