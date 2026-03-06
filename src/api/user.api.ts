import apiClient from '../lib/apiClient';

export interface UserInformation {
  userId: number;
  userEmail: string;
  userName: string;
  userPortrait: string;
}

export interface GetUserInfoResponse {
  code: number;
  message: string;
  data: UserInformation;
}

export interface UpdateUserInfoRequest {
  userName: string;
  userId: number;
}

export interface UpdateUserInfoResponse {
  code: number;
  message: string;
  data?: unknown;
}

export const getUserInfo = async (): Promise<GetUserInfoResponse> => {
  const response = await apiClient.get<GetUserInfoResponse>('/v1/user/get_user_info');
  return response.data;
};

export const updateUserInfo = async (data: UpdateUserInfoRequest): Promise<UpdateUserInfoResponse> => {
  const response = await apiClient.post<UpdateUserInfoResponse>('/v1/user/edit_user_info', data);
  return response.data;
};

export interface LogoutResponse {
  code: number;
  message: string;
  data?: unknown;
}

export const logout = async (): Promise<LogoutResponse> => {
  const response = await apiClient.post<LogoutResponse>('/v1/user/logout');
  return response.data;
};

// Get user info in group context
export interface UserInGroup {
  userId: number;
  userName: string;
  userPortrait: string;
  userEmail: string;
}

export interface GetUserInfoInGroupResponse {
  code: number;
  message: string;
  data: UserInGroup;
}

export const fetchUserInfoInGroup = async (userId: number): Promise<GetUserInfoInGroupResponse> => {
  const response = await apiClient.get<GetUserInfoInGroupResponse>(`/v1/user/get_user_info_in_group?userId=${userId}`);
  return response.data;
};
