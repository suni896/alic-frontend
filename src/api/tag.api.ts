import apiClient from '../components/loggedOut/apiClient';

export interface CreateTagRequest {
  tagName: string;
}

export interface CreateTagResponse {
  code: number;
  message: string;
  data: {
    tagId: number;
  };
}

export const createTag = async (data: CreateTagRequest): Promise<CreateTagResponse> => {
  const response = await apiClient.post<CreateTagResponse>('/v1/tag/add_tag', data);
  return response.data;
};

export interface TagInfoGroup {
  groupId: number;
  groupName: string;
  isBinded: boolean;
  groupAdmin: string;
  groupDescription: string;
}

export interface TagInfoResponse {
  code: number;
  message: string;
  data: TagInfoData;
}

export interface PaginationParams {
  pageNum: number;
  pageSize: number;
}

export interface TagGroupsWithPagination {
  data: TagInfoGroup[];
  pageNum: number;
  pageSize: number;
  total: number;
  pages: number;
}

export interface TagInfoData {
  tagId: number;
  tagName: string;
  tagGroups: TagGroupsWithPagination;
}

export const fetchTagGroups = async (
  tagId: string,
  pagination: PaginationParams
): Promise<TagInfoData> => {
  const requestData = {
    tagId,
    pageRequestVO: pagination,
  };

  const response = await apiClient.post<TagInfoResponse>(
    '/v1/tag/get_tag_info',
    requestData
  );

  if (response.data.code === 200) {
    return response.data.data;
  }
  
  throw new Error(
    `API returned error code: ${response.data.code}, message: ${response.data.message}`
  );
};

export const removeRoomsFromTag = async (
  tagId: string,
  roomIds: number[]
): Promise<void> => {
  if (!tagId || roomIds.length === 0) {
    throw new Error('Tag ID or selected room IDs are missing');
  }

  const response = await apiClient.post('/v1/tag/remove_group', {
    tagId: parseInt(tagId),
    groupIdList: roomIds,
  });

  if (response.data.code !== 200) {
    throw new Error(response.data.message || 'Failed to remove rooms');
  }
};


// Alternative endpoint for adding rooms (used in MyClass)
export const addGroupToTag = async (
  tagId: number,
  tagName: string,
  roomIds: number[]
): Promise<void> => {
  if (!tagId || roomIds.length === 0) {
    throw new Error('Tag ID or room IDs are missing');
  }

  const requestData = {
    groupIdList: roomIds,
    tagId: tagId,
    tagName: tagName,
  };

  const response = await apiClient.post('/v1/tag/add_group', requestData);

  if (response.data.code === 200) {
    return;
  } else if (response.data.code === 1001) {
    throw new Error('Parameters are invalid for tag binding group. Please check your inputs and try again.');
  } else {
    throw new Error(response.data.message || `API returned error code: ${response.data.code}`);
  }
};

// Interface for available groups (used in AddRoomOverlay)
export interface AvailableGroup {
  groupId: number;
  groupName: string;
  isBinded: boolean;
}

export interface AvailableGroupsResponse {
  code: number;
  message: string;
  data: AvailableGroup[];
}

// Fetch available groups for a tag (used in AddRoomOverlay)
export const fetchAvailableGroupsForTag = async (
  tagId: number,
  keyword?: string
): Promise<AvailableGroup[]> => {
  const requestData = {
    tagId,
    keyword: keyword || undefined,
  };

  const response = await apiClient.post<AvailableGroupsResponse>(
    '/v1/tag/get_group_list_for_tag',
    requestData
  );

  if (response.data.code === 200) {
    return response.data.data;
  }

  throw new Error(
    `API returned error code: ${response.data.code}, message: ${response.data.message}`
  );
};

// Interface for group info response
export interface ChatBotVO {
  accessType: number;
  botContext: number;
  botName: string;
  botPrompt: string;
  botId?: number;
}

export interface ChatBotFeedbackVO {
  botName: string;
  botPrompt: string;
  msgCountInterval: number;
  timeInterval: number;
  botId?: number;
}

export interface GroupInfo {
  groupId: number;
  groupName: string;
  groupDescription: string;
  groupType: number;
  password?: string;
  clearContextTime?: string;
  groupMode?: "free" | "feedback";
  chatBots?: ChatBotVO[];
  chatBotFeedback?: ChatBotFeedbackVO;
}

export interface GroupInfoResponse {
  code: number;
  message: string;
  data?: GroupInfo;
}

// Fetch group info by ID (used in MyClass)
export const fetchGroupInfo = async (groupId: number): Promise<GroupInfo> => {
  const response = await apiClient.get<GroupInfoResponse>(
    '/v1/group/get_group_info',
    { params: { groupId } }
  );

  if (response.data.code === 200 && response.data.data) {
    return response.data.data;
  }

  throw new Error(
    `API returned error code: ${response.data.code}, message: ${response.data.message}`
  );
};

// Tag list interfaces
export interface Tag {
  tagId: number;
  tagName: string;
}

export interface GetTagListRequest {
  keyword: string;
  pageRequestVO: {
    pageSize: number;
    pageNum: number;
  };
}

export interface GetTagListResponse {
  code: number;
  message: string;
  data: {
    pageSize: number;
    pageNum: number;
    pages: number;
    total: number;
    data: Tag[];
  };
}

export const fetchTagList = async (data: GetTagListRequest): Promise<GetTagListResponse> => {
  const response = await apiClient.post<GetTagListResponse>('/v1/tag/get_tag_list', data);
  return response.data;
};

// Get tag binded to a specific group
export interface TagBindedResponse {
  code: number;
  message: string;
  data: Tag[];
}

export const fetchTagBindedToGroup = async (groupId: number): Promise<TagBindedResponse> => {
  const response = await apiClient.get<TagBindedResponse>(`/v1/tag/get_tag_binded_group_list?groupId=${groupId}`);
  return response.data;
};
