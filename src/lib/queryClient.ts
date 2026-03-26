import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分钟后数据过期
      gcTime: 1000 * 60 * 10,   // 10分钟后清理缓存
      retry: 1,                 // 失败重试1次
      refetchOnWindowFocus: false, // 窗口聚焦时不自动刷新
    },
  },
});
