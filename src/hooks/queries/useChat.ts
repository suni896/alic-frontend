import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchHistoryMsg,
  fetchMsgByIds,
  type GetHistoryMsgRequest,
  type GetMsgByIdsRequest,
} from '../../api/chat.api';
import {
  fetchGroupChatBotList,
  fetchGroupChatBotInfo,
  fetchClearHistory,
  clearAIContext,
  type ClearAIContextRequest,
} from '../../api/group.api';
import { fetchUserInfoInGroup } from '../../api/user.api';

// Query: Get group chat bot list
export function useGroupChatBotList(groupId: number | undefined) {
  return useQuery({
    queryKey: ['groupChatBotList', groupId],
    queryFn: () => fetchGroupChatBotList(groupId!),
    enabled: !!groupId,
  });
}

// Query: Get group chat bot info
export function useGroupChatBotInfo(botId: number | undefined) {
  return useQuery({
    queryKey: ['groupChatBotInfo', botId],
    queryFn: () => fetchGroupChatBotInfo(botId!),
    enabled: !!botId,
  });
}

// Query: Get clear history
export function useClearHistory(groupId: number | undefined) {
  return useQuery({
    queryKey: ['clearHistory', groupId],
    queryFn: () => fetchClearHistory(groupId!),
    enabled: !!groupId,
  });
}

// Mutation: Clear AI context
export function useClearAIContext() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ClearAIContextRequest) => clearAIContext(data),
    onSuccess: (_, variables) => {
      // Invalidate clear history to refresh
      queryClient.invalidateQueries({ queryKey: ['clearHistory', variables.groupId] });
    },
  });
}

// Query: Get history messages
export function useHistoryMsg(params: GetHistoryMsgRequest & { enabled?: boolean }) {
  const { enabled, ...requestParams } = params;
  return useQuery({
    queryKey: ['historyMsg', requestParams],
    queryFn: () => fetchHistoryMsg(requestParams),
    enabled: enabled !== false && !!requestParams.groupId,
  });
}

// Query: Get messages by IDs
export function useMsgByIds(params: GetMsgByIdsRequest & { enabled?: boolean }) {
  const { enabled, ...requestParams } = params;
  return useQuery({
    queryKey: ['msgByIds', requestParams],
    queryFn: () => fetchMsgByIds(requestParams),
    enabled: enabled !== false && !!requestParams.groupId && requestParams.msgIds.length > 0,
  });
}

// Query: Get user info in group
export function useUserInfoInGroup(userId: number | undefined) {
  return useQuery({
    queryKey: ['userInfoInGroup', userId],
    queryFn: () => fetchUserInfoInGroup(userId!),
    enabled: !!userId,
  });
}
