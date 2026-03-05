import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchTagGroups, 
  fetchAvailableGroupsForTag, 
  fetchGroupInfo,
  removeRoomsFromTag,
  addGroupToTag,
  type TagGroupsWithPagination,
  type AvailableGroup,
  type PaginationParams,
} from '../../api/tag.api';

// Query options are defined globally in src/lib/queryClient.ts
// This ensures consistent caching behavior across the application

// Query Key Convention (13.8)
// ["tagGroups", tagId, { pageNum, pageSize }]
export function useTagGroups(
  tagId: string | number | undefined, 
  pagination: PaginationParams
) {
  return useQuery<TagGroupsWithPagination, Error>({
    queryKey: ['tagGroups', tagId?.toString(), pagination],
    queryFn: () => fetchTagGroups(tagId!.toString(), pagination),
    enabled: !!tagId,
  });
}

// ["availableGroups", tagId, keyword]
export function useAvailableGroups(tagId: number, keyword: string) {
  return useQuery<AvailableGroup[], Error>({
    queryKey: ['availableGroups', tagId, keyword],
    queryFn: () => fetchAvailableGroupsForTag(tagId, keyword),
    enabled: !!tagId,
  });
}

// ["groupInfo", groupId]
export function useGroupInfo(groupId: number | undefined) {
  return useQuery({
    queryKey: ['groupInfo', groupId],
    queryFn: () => fetchGroupInfo(groupId!),
    enabled: !!groupId,

  });
}

// Fetch and cache group info (for preloading)
export function usePrefetchGroupInfo() {
  const queryClient = useQueryClient();
  
  return async (groupId: number) => {
    return queryClient.fetchQuery({
      queryKey: ['groupInfo', groupId],
      queryFn: () => fetchGroupInfo(groupId),
    });
  };
}

// Mutation: Remove rooms from tag
export function useRemoveRoomsFromTag() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { tagId: string; roomIds: number[] }>({
    mutationFn: ({ tagId, roomIds }) => removeRoomsFromTag(tagId, roomIds),
    onSuccess: () => {
      // Invalidate tag groups to refresh the list
      queryClient.invalidateQueries({ queryKey: ['tagGroups'] });
    },
  });
}

// Mutation: Add rooms to tag
export function useAddRoomsToTag() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { tagId: number; title: string; roomIds: number[] }>({
    mutationFn: ({ tagId, title, roomIds }) => addGroupToTag(tagId, title, roomIds),
    onSuccess: () => {
      // Invalidate tag groups to refresh the list
      queryClient.invalidateQueries({ queryKey: ['tagGroups'] });
    },
  });
}
