import apiClient from '../components/loggedOut/apiClient';
import type { RoomGroup } from '../components/loggedIn/useJoinRoom';

export interface JoinGroupRequest {
  groupId: number;
  joinMemberID?: number;
  password?: string;
}

export interface JoinGroupResponse {
  code: number;
  message: string;
}

export const joinGroup = async (data: JoinGroupRequest): Promise<JoinGroupResponse> => {
  const response = await apiClient.post<JoinGroupResponse>('/v1/group/add_group_member', data);
  return response.data;
};

export interface GetGroupListRequest {
  keyword?: string;
  groupDemonTypeEnum: 'ALLROOM' | 'JOINEDROOM';
  pageRequestVO: {
    pageSize: number;
    pageNum: number;
  };
}

export interface GetGroupListResponse {
  code: number;
  message: string;
  data: {
    pageNum: number;
    pageSize: number;
    total: number;
    pages: number;
    data: RoomGroup[];
  };
}

export interface GetUserRoleResponse {
  code: number;
  message: string;
  data: string; // 'ADMIN', 'MEMBER', etc.
}

export interface EditGroupRequest {
  groupId: number;
  groupName: string;
  groupDescription: string;
  password?: string;
  addChatBotVOList?: Array<{
    accessType: number;
    botContext: number;
    botName: string;
    botPrompt: string;
  }>;
  modifyChatBotVOS?: Array<{
    botId?: number;
    accessType: number;
    botContext: number;
    botName: string;
    botPrompt: string;
  }>;
  modifyChatBotFeedbackVO?: {
    botId?: number;
    botName: string;
    botPrompt: string;
    msgCountInterval: number;
    timeInterval: number;
  };
}

export interface EditGroupResponse {
  code: number;
  message: string;
  data?: unknown;
}

export interface GetGroupInfoResponse {
  code: number;
  message: string;
  data?: {
    groupId: number;
    groupName: string;
    groupDescription: string;
    groupType: number;
    password?: string;
    clearContextTime?: string;
    groupMode?: 'free' | 'feedback';
    chatBots?: Array<{
      accessType: number;
      botContext: number;
      botName: string;
      botPrompt: string;
      botId?: number;
    }>;
    chatBotFeedback?: {
      botName: string;
      botPrompt: string;
      msgCountInterval: number;
      timeInterval: number;
      botId?: number;
    };
  };
}

export const fetchGroupList = async (data: GetGroupListRequest): Promise<GetGroupListResponse> => {
  const response = await apiClient.post<GetGroupListResponse>('/v1/group/get_group_list', data);
  return response.data;
};

export const fetchUserRole = async (groupId: number): Promise<GetUserRoleResponse> => {
  const response = await apiClient.get<GetUserRoleResponse>(`/v1/group/get_role_in_group?groupId=${groupId}`);
  return response.data;
};

export const editGroup = async (data: EditGroupRequest): Promise<EditGroupResponse> => {
  const response = await apiClient.post<EditGroupResponse>('/v1/group/edit_group_info', data);
  return response.data;
};

export const getGroupInfo = async (groupId: number): Promise<GetGroupInfoResponse> => {
  const response = await apiClient.get<GetGroupInfoResponse>(`/v1/group/get_group_info?groupId=${groupId}`);
  return response.data;
};

// Group member interfaces
export interface GroupMember {
  userId: number;
  userName: string;
  userEmail: string;
  userPortrait: string;
}

export interface GetGroupMemberListResponse {
  code: number;
  message: string;
  data: GroupMember[];
}

export const fetchGroupMemberList = async (groupId: number): Promise<GetGroupMemberListResponse> => {
  const response = await apiClient.get<GetGroupMemberListResponse>(`/v1/group/get_group_member_list?groupId=${groupId}`);
  return response.data;
};

export interface RemoveGroupMemberRequest {
  groupId: number;
  removeMemberId: number;
}

export interface RemoveGroupMemberResponse {
  code: number;
  message: string;
  data?: unknown;
}

export const removeGroupMember = async (data: RemoveGroupMemberRequest): Promise<RemoveGroupMemberResponse> => {
  const response = await apiClient.post<RemoveGroupMemberResponse>('/v1/group/remove_group_member', data);
  return response.data;
};
