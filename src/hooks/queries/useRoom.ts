import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createRoom,
  fetchGroupList,
  type CreateRoomRequest,
  type GetGroupListRequest,
} from '../../api/room.api';
import { fetchTagList, type GetTagListRequest } from '../../api/tag.api';

// Query: Get sidebar rooms (JOINEDROOM)
export function useSidebarRooms(params: GetGroupListRequest & { enabled?: boolean }) {
  const { enabled, ...requestParams } = params;
  return useQuery({
    queryKey: ['sidebarRooms', requestParams],
    queryFn: () => fetchGroupList(requestParams),
    enabled: enabled !== false && !!requestParams.groupDemonTypeEnum,
  });
}

// Query: Get main area rooms (PUBLICROOM)
export function useMainAreaRooms(params: GetGroupListRequest & { enabled?: boolean }) {
  const { enabled, ...requestParams } = params;
  return useQuery({
    queryKey: ['mainAreaRooms', requestParams],
    queryFn: () => fetchGroupList(requestParams),
    enabled: enabled !== false && !!requestParams.groupDemonTypeEnum,
  });
}

// Query: Get tags list
export function useTags(params: GetTagListRequest & { enabled?: boolean }) {
  const { enabled, ...requestParams } = params;
  return useQuery({
    queryKey: ['tags', requestParams],
    queryFn: () => fetchTagList(requestParams),
    enabled: enabled !== false,
  });
}

// Mutation: Create room
export function useCreateRoom() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateRoomRequest) => createRoom(data),
    onSuccess: () => {
      // Invalidate room lists
      queryClient.invalidateQueries({ queryKey: ['sidebarRooms'] });
      queryClient.invalidateQueries({ queryKey: ['mainAreaRooms'] });
    },
  });
}
