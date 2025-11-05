import { useEffect, useState } from "react";
import axiosAdmin from "@/api/axiosAdmin";

interface MemberDTO {
  uuid: string;
  username: string;
  status: string;
  deleted: boolean;
}

export default function AdminMemberPage() {
  const [members, setMembers] = useState<MemberDTO[]>([]);

  const fetchMembers = async () => {
    const res = await axiosAdmin.get("/admin/members");
    setMembers(res.data);
  };

  const toggleStatus = async (uuid: string, current: string) => {
    const next = current === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await axiosAdmin.patch(`/admin/members/${uuid}/status`, null, {
      params: { status: next },
    });
    fetchMembers();
  };

  // ✅ 탈퇴 여부 토글 (백엔드: /{uuid}/deleted?deleted=true|false)
  const toggleDeleted = async (uuid: string, current: boolean) => {
    const res = await axiosAdmin.patch(`/admin/members/${uuid}/deleted`, null, {
      params: { deleted: !current },
    });

    const updated = res.data;
    setMembers((prev) =>
      prev.map((m) => (m.uuid === updated.uuid ? updated : m))
    );
  };

  useEffect(() => {
    fetchMembers();
  }, []);

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
          {members.map((m: any) => (
            <tr key={m.uuid} className="border-b hover:bg-gray-50">
              <td className="p-2">{m.uuid}</td>
              <td className="p-2">{m.username}</td>
              <td className="p-2">{m.status}</td>
              <td className="p-2">{m.deleted  ? "Y" : "N"}</td>
              <td className="p-2 space-x-2">
                <button
                  onClick={() => toggleStatus(m.uuid, m.status)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  상태변경
                </button>
                <button
                  onClick={() => toggleDeleted(m.uuid, m.deleted)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
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
