import apiClient from '../lib/apiClient';

// Message interfaces
export interface Message {
  infoId: number;
  groupId: number;
  senderId: number;
  senderType: 'USER' | 'CHATBOT';
  content: string;
  createTime: string;
  replyToMsgId?: number;
  name?: string;
  portrait?: string;
}

export interface GetHistoryMsgRequest {
  groupId: number;
  lastMsgId: number;
  pageSize: number;
}

export interface GetHistoryMsgResponse {
  code: number;
  message: string;
  data: Message[];
}

export const fetchHistoryMsg = async (data: GetHistoryMsgRequest): Promise<GetHistoryMsgResponse> => {
  const response = await apiClient.post<GetHistoryMsgResponse>('/v1/chat/getHistoryMsg', data);
  return response.data;
};

// Get messages by IDs
export interface GetMsgByIdsRequest {
  groupId: number;
  msgIds: number[];
}

export interface GetMsgByIdsResponse {
  code: number;
  message: string;
  data: Message[];
}

export const fetchMsgByIds = async (data: GetMsgByIdsRequest): Promise<GetMsgByIdsResponse> => {
  const response = await apiClient.post<GetMsgByIdsResponse>('/v1/chat/getMsgByIds', data);
  return response.data;
};
