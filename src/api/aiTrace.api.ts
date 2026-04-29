import apiClient from '../lib/apiClient';
import type { AITimelineRespVO, AITracesResponse } from '../types/aiTrace';

const API_BASE = '/v1';

/**
 * 获取 AI Trace 时间线数据
 * GET /v1/admin/ai-traces/{groupId}?lastMsgId=&pageSize=
 *
 * @param groupId 群组 ID
 * @param lastMsgId 分页游标（可选，不传则获取最新消息）
 * @param pageSize 每页条数（默认 20）
 */
export async function fetchAITraces(
  groupId: number,
  lastMsgId?: number,
  pageSize: number = 20
): Promise<AITimelineRespVO> {
  const params = new URLSearchParams();
  params.append('pageSize', pageSize.toString());
  if (lastMsgId !== undefined && lastMsgId > 0) {
    params.append('lastMsgId', lastMsgId.toString());
  }

  const { data } = await apiClient.get<AITracesResponse>(
    `${API_BASE}/admin/ai-traces/${groupId}?${params.toString()}`
  );

  if (data.code !== 200) {
    throw new Error(data.message || 'Failed to fetch AI traces');
  }

  return data.data;
}
