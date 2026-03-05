import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchGroupList,
  fetchUserRole,
  editGroup,
  getGroupInfo,
  joinGroup,
  fetchGroupMemberList,
  removeGroupMember,
  type GetGroupListRequest,
  type EditGroupRequest,
  type JoinGroupRequest,
  type RemoveGroupMemberRequest,
} from '../../api/group.api';

// Query: Get group list
export function useGroupList(params: GetGroupListRequest) {
  return useQuery({
    queryKey: ['groupList', params],
    queryFn: () => fetchGroupList(params),
    enabled: !!params.groupDemonTypeEnum,
  });
}

// Query: Get user role in group
export function useUserRole(groupId: number | undefined) {
  return useQuery<string | null, Error>({
    queryKey: ['userRole', groupId],
    queryFn: async () => {
      const response = await fetchUserRole(groupId!);
      return response.data ?? null; // Returns "ADMIN" or "MEMBER" or null
    },
    enabled: !!groupId,
  });
}

// Query: Get group info
export function useGroupInfo(groupId: number | undefined) {
  return useQuery({
    queryKey: ['groupInfo', groupId],
    queryFn: () => getGroupInfo(groupId!),
    enabled: !!groupId,
  });
}

// Mutation: Edit group
export function useEditGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: EditGroupRequest) => editGroup(data),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['groupInfo', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['groupList'] });
    },
  });
}

// Prefetch hook for group info
export function usePrefetchGroupInfo() {
  const queryClient = useQueryClient();
  
  return async (groupId: number) => {
    return queryClient.fetchQuery({
      queryKey: ['groupInfo', groupId],
      queryFn: () => getGroupInfo(groupId),
    });
  };
}

// Mutation: Join group
export function useJoinGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: JoinGroupRequest) => joinGroup(data),
    onSuccess: () => {
      // Invalidate room lists
      queryClient.invalidateQueries({ queryKey: ['sidebarRooms'] });
      queryClient.invalidateQueries({ queryKey: ['mainAreaRooms'] });
      queryClient.invalidateQueries({ queryKey: ['groupList'] });
    },
  });
}

// Query: Get group member list
export function useGroupMemberList(groupId: number | undefined) {
  return useQuery({
    queryKey: ['groupMembers', groupId],
    queryFn: () => fetchGroupMemberList(groupId!),
    enabled: !!groupId,
  });
}

// Mutation: Remove group member
export function useRemoveGroupMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: RemoveGroupMemberRequest) => removeGroupMember(data),
    onSuccess: (_, variables) => {
      // Invalidate group member list
      queryClient.invalidateQueries({ queryKey: ['groupMembers', variables.groupId] });
    },
  });
}
