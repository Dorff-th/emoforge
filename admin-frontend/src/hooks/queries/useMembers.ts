import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosAuthAdmin from '@/api/axiosAuthAdmin';
import { useToast } from '@/providers/ToastProvider';

export interface MemberDTO {
  uuid: string;
  username: string;
  status: string;
  deleted: boolean;
}

export const memberKeys = {
  all: ['members'] as const,
};

async function fetchMembers(): Promise<MemberDTO[]> {
  const res = await axiosAuthAdmin.get('/admin/members');
  return res.data;
}

async function updateMemberStatus(uuid: string, status: string): Promise<MemberDTO> {
  const res = await axiosAuthAdmin.patch(`/admin/members/${uuid}/status`, null, {
    params: { status },
  });
  return res.data;
}

async function updateMemberDeleted(uuid: string, deleted: boolean): Promise<MemberDTO> {
  const res = await axiosAuthAdmin.patch(`/admin/members/${uuid}/deleted`, null, {
    params: { deleted },
  });
  return res.data;
}

export function useMembers() {
  return useQuery({
    queryKey: memberKeys.all,
    queryFn: fetchMembers,
  });
}

export function useToggleMemberStatus() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ uuid, currentStatus }: { uuid: string; currentStatus: string }) => {
      const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      return updateMemberStatus(uuid, nextStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberKeys.all });
      addToast({ type: 'success', text: '회원 상태가 변경되었습니다.' });
    },
  });
}

export function useToggleMemberDeleted() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ uuid, currentDeleted }: { uuid: string; currentDeleted: boolean }) => {
      return updateMemberDeleted(uuid, !currentDeleted);
    },
    onSuccess: (updatedMember) => {
      queryClient.setQueryData<MemberDTO[]>(memberKeys.all, (old) =>
        old?.map((m) => (m.uuid === updatedMember.uuid ? updatedMember : m))
      );
      addToast({ type: 'success', text: '회원 탈퇴 상태가 변경되었습니다.' });
    },
  });
}
