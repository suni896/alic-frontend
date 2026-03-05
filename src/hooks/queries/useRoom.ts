import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createRoom,
  fetchGroupList,
  type CreateRoomRequest,
  type GetGroupListRequest,
} from '../../api/room.api';
import { fetchTagList, type GetTagListRequest } from '../../api/tag.api';

// Query: Get sidebar rooms (JOINEDROOM)
export function useSidebarRooms(params: GetGroupListRequest) {
  return useQuery({
    queryKey: ['sidebarRooms', params],
    queryFn: () => fetchGroupList(params),
    enabled: !!params.groupDemonTypeEnum,
  });
}

// Query: Get main area rooms (PUBLICROOM)
export function useMainAreaRooms(params: GetGroupListRequest) {
  return useQuery({
    queryKey: ['mainAreaRooms', params],
    queryFn: () => fetchGroupList(params),
    enabled: !!params.groupDemonTypeEnum,
  });
}

// Query: Get tags list
export function useTags(params: GetTagListRequest) {
  return useQuery({
    queryKey: ['tags', params],
    queryFn: () => fetchTagList(params),
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
