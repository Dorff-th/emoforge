import {
  useMembers,
  useToggleMemberStatus,
  useToggleMemberDeleted,
} from '@/hooks/queries/useMembers';

export default function AdminMemberPage() {
  const { data: members = [], isLoading } = useMembers();
  const toggleStatusMutation = useToggleMemberStatus();
  const toggleDeletedMutation = useToggleMemberDeleted();

  if (isLoading) {
    return <div className="p-4">회원 목록을 불러오는 중...</div>;
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">회원 관리</h2>
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="p-2 text-left">UUID</th>
            <th className="p-2 text-left">닉네임</th>
            <th className="p-2 text-left">상태</th>
            <th className="p-2 text-left">탈퇴여부</th>
            <th className="p-2 text-left">액션</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.uuid} className="border-b hover:bg-gray-50">
              <td className="p-2">{m.uuid}</td>
              <td className="p-2">{m.username}</td>
              <td className="p-2">{m.status}</td>
              <td className="p-2">{m.deleted ? 'Y' : 'N'}</td>
              <td className="p-2 space-x-2">
                <button
                  onClick={() =>
                    toggleStatusMutation.mutate({
                      uuid: m.uuid,
                      currentStatus: m.status,
                    })
                  }
                  disabled={toggleStatusMutation.isPending}
                  className="bg-blue-500 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  상태변경
                </button>
                <button
                  onClick={() =>
                    toggleDeletedMutation.mutate({
                      uuid: m.uuid,
                      currentDeleted: m.deleted,
                    })
                  }
                  disabled={toggleDeletedMutation.isPending}
                  className="bg-red-500 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  탈퇴토글
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
