import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchAITraces } from '../../api/aiTrace.api';

// ==========================================
// Query Keys
// ==========================================

export const aiTraceKeys = {
  all: ['aiTraces'] as const,
  timeline: (groupId: number) => [...aiTraceKeys.all, 'timeline', groupId] as const,
};

/**
 * 获取 AI Trace 时间线（无限滚动分页）
 *
 * 分页逻辑：
 * - 第一页：不传 lastMsgId，获取最新消息
 * - 后续页：取当前已加载消息中最旧的 infoId 作为 lastMsgId
 * - 当返回 messages 为空时，表示没有更多数据
 */
export function useAITraces(groupId: number | undefined) {
  return useInfiniteQuery({
    queryKey: aiTraceKeys.timeline(groupId ?? 0),
    queryFn: async ({ pageParam }) => {
      return fetchAITraces(groupId!, pageParam as number | undefined);
    },
    getNextPageParam: (lastPage) => {
      const messages = lastPage.messages;
      if (messages.length === 0) return undefined;
      return messages[messages.length - 1].infoId;
    },
    initialPageParam: undefined as number | undefined,
    enabled: !!groupId,
    staleTime: 30 * 1000,
  });
}
