import apiClient from '../components/loggedOut/apiClient';
import type { RoomGroup } from '../components/loggedIn/useJoinRoom';

export interface ChatBotVO {
  accessType: number;
  botContext: number;
  botName: string;
  botPrompt: string;
}

export interface CreateRoomRequest {
  groupName: string;
  groupDescription: string;
  groupType: number;
  password?: string;
  chatBotVOList: ChatBotVO[];
  groupMode: 'free' | 'feedback';
  chatBotFeedbackVO?: {
    botName: string;
    botPrompt: string;
    msgCountInterval: number;
    timeInterval: number;
  };
}

export interface CreateRoomResponse {
  code: number;
  message: string;
  data?: {
    groupId: number;
  };
}

export interface GetGroupListRequest {
  keyword: string;
  groupDemonTypeEnum: 'JOINEDROOM' | 'PUBLICROOM' | 'ALLROOM';
  pageRequestVO: {
    pageSize: number;
    pageNum: number;
  };
}

export interface GetGroupListResponse {
  code: number;
  message: string;
  data: {
    pageSize: number;
    pageNum: number;
    pages: number;
    total: number;
    data: RoomGroup[];
  };
}

export const createRoom = async (data: CreateRoomRequest): Promise<CreateRoomResponse> => {
  const response = await apiClient.post<CreateRoomResponse>('/v1/group/create_new_group', data);
  return response.data;
};

export const fetchGroupList = async (data: GetGroupListRequest): Promise<GetGroupListResponse> => {
  const response = await apiClient.post<GetGroupListResponse>('/v1/group/get_group_list', data);
  return response.data;
};
