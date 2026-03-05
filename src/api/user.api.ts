import apiClient from '../components/loggedOut/apiClient';

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
