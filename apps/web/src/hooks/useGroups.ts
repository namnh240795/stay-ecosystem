import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchGroups, createGroup, joinGroup } from '../api/groups';

export function useGroups(params: {
  page?: number;
  limit?: number;
  status?: string;
  tourId?: string;
  search?: string;
} = {}) {
  return useQuery({
    queryKey: ['groups', params],
    queryFn: () => fetchGroups(params),
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useJoinGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: {
      id: string;
      data: {
        memberName: string;
        memberEmail: string;
        memberPhone?: string;
      };
    }) => joinGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}
