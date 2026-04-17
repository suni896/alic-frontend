/**
 * MultiAgent Config API 层
 * 
 * 参考文档: /docs/MultiAgent-Development-Plan.md
 * 
 * 关键设计原则:
 * - MultiAgent 模式使用 Config Module APIs（/config/*）进行 Agent 配置
 * - 群组基本信息使用 editGroupInfo
 * - Agent 配置使用 batchUpdateConfig（编辑时）
 */

import apiClient from '../lib/apiClient';
import type {
  GlobalScriptVO,
  ProfileVO,
  PresetActionType,
  PresetProfileTemplate,
  BatchUpdateRequest,
  BatchUpdateResult,
  CreateGroupPayload,
  CreateGroupResponse,
  ProfilePresetsResponse,
  ActionTypesResponse,
  GlobalScriptResponse,
  ProfilesResponse,
  ProfileOperationResponse,
  ActionConfigResponse,
  ActionConfigQueryResponse,
  BatchUpdateResponse,
} from '../types/multiagent';

// ==========================================
// API 基础配置
// ==========================================

const API_BASE = '/v1';

// ==========================================
// 创建群组（MultiAgent 模式）
// ==========================================

/**
 * 创建 MultiAgent 群组
 * POST /v1/group/create_new_group
 * 
 * @param payload 创建群组请求体（包含 multiAgentConfig）
 */
export async function createMultiAgentGroup(
  payload: CreateGroupPayload
): Promise<CreateGroupResponse> {
  const { data } = await apiClient.post<CreateGroupResponse>(
    `${API_BASE}/group/create_new_group`,
    payload
  );
  return data;
}

// ==========================================
// 全局剧本 API
// ==========================================

/**
 * 获取 Global Script
 * GET /v1/group/{groupId}/config/script
 * 
 * @param groupId 群组 ID
 */
export async function getGlobalScript(
  groupId: string | number
): Promise<GlobalScriptVO> {
  const { data } = await apiClient.get<GlobalScriptResponse>(
    `${API_BASE}/group/${groupId}/config/script`
  );
  if (data.code !== 200) {
    throw new Error(data.message || 'Failed to get global script');
  }
  
  const result = data.data!;
  
  // Ensure interactionPolicy is an object, not a string
  if (result.interactionPolicy && typeof result.interactionPolicy === 'string') {
    try {
      result.interactionPolicy = JSON.parse(result.interactionPolicy);
    } catch (e) {
      console.warn('Failed to parse interactionPolicy string:', e);
      result.interactionPolicy = {};
    }
  }
  
  return result;
}

/**
 * 更新 Global Script
 * PUT /v1/group/{groupId}/config/script
 * 
 * @param groupId 群组 ID
 * @param script Global Script 数据
 */
export async function updateGlobalScript(
  groupId: string | number,
  script: GlobalScriptVO
): Promise<void> {
  const { data } = await apiClient.put<GlobalScriptResponse>(
    `${API_BASE}/group/${groupId}/config/script`,
    script
  );
  if (data.code !== 200) {
    throw new Error(data.message || 'Failed to update global script');
  }
}

// ==========================================
// Profile 管理 API
// ==========================================

/**
 * 获取群组所有 Profiles
 * GET /v1/group/{groupId}/config/profiles
 * 
 * @param groupId 群组 ID
 */
export async function getProfiles(
  groupId: string | number
): Promise<ProfileVO[]> {
  const { data } = await apiClient.get<ProfilesResponse>(
    `${API_BASE}/group/${groupId}/config/profiles`
  );
  if (data.code !== 200) {
    throw new Error(data.message || 'Failed to get profiles');
  }
  return data.data || [];
}

/**
 * 添加 Profile（独立 API，批量更新时一般不使用）
 * POST /v1/group/{groupId}/config/profiles
 * 
 * @param groupId 群组 ID
 * @param profile Profile 数据
 */
export async function addProfile(
  groupId: string | number,
  profile: Omit<ProfileVO, 'profileId' | 'botId' | 'condition'>
): Promise<{ profileId: string; botId: string }> {
  const { data } = await apiClient.post<ProfileOperationResponse>(
    `${API_BASE}/group/${groupId}/config/profiles`,
    profile
  );
  if (data.code !== 200) {
    throw new Error(data.message || 'Failed to add profile');
  }
  return {
    profileId: data.data!.profileId!,
    botId: data.data!.botId!,
  };
}

/**
 * 更新 Profile
 * PUT /v1/group/{groupId}/config/profiles/{botId}
 * 
 * 注意：condition=1 时会创建新版本，返回新的 profileId
 * 
 * @param groupId 群组 ID
 * @param botId Bot ID
 * @param profile Profile 数据（不包含 botId）
 */
export async function updateProfile(
  groupId: string | number,
  botId: string,
  profile: Omit<ProfileVO, 'profileId' | 'botId' | 'condition'>
): Promise<{ newProfileId: string; newBotId?: string }> {
  const { data } = await apiClient.put<ProfileOperationResponse>(
    `${API_BASE}/group/${groupId}/config/profiles/${botId}`,
    profile
  );
  if (data.code !== 200) {
    throw new Error(data.message || 'Failed to update profile');
  }
  return {
    newProfileId: data.data!.newProfileId!,
    newBotId: data.data!.botId,
  };
}

/**
 * 删除 Profile
 * DELETE /v1/group/{groupId}/config/profiles/{botId}
 * 
 * @param groupId 群组 ID
 * @param botId Bot ID
 */
export async function deleteProfile(
  groupId: string | number,
  botId: string
): Promise<void> {
  const { data } = await apiClient.delete<ProfileOperationResponse>(
    `${API_BASE}/group/${groupId}/config/profiles/${botId}`
  );
  if (data.code !== 200) {
    throw new Error(data.message || 'Failed to delete profile');
  }
}

// ==========================================
// Action 配置 API
// ==========================================

/**
 * 获取 Action Config
 * GET /v1/group/{groupId}/config/actions
 * 
 * 返回格式: { enabledActionCodes: number[], customTemplates: object, actionRules: object }
 * 
 * @param groupId 群组 ID
 */
export async function getActionConfig(
  groupId: string | number
): Promise<{ enabledActionCodes: number[]; customTemplates: Record<number, string> | null; actionRules: unknown[] | null }> {
  const { data } = await apiClient.get<ActionConfigQueryResponse>(
    `${API_BASE}/group/${groupId}/config/actions`
  );
  if (data.code !== 200) {
    throw new Error(data.message || 'Failed to get action config');
  }
  return {
    enabledActionCodes: data.data?.enabledActionCodes || [],
    customTemplates: data.data?.customTemplates || null,
    actionRules: data.data?.actionRules || null,
  };
}

/**
 * 更新 Action Config
 * PUT /v1/group/{groupId}/config/actions/{actionCode}
 * 
 * @param groupId 群组 ID
 * @param actionCode Action Code
 * @param config 包含 processScript, isEnabled, customTemplate, rules
 */
export async function updateActionConfig(
  groupId: string | number,
  actionCode: number,
  config: {
    processScript: string;
    isEnabled: boolean;
    customTemplate?: string;
    rules?: Record<string, unknown>;
  }
): Promise<void> {
  const { data } = await apiClient.put<ActionConfigResponse>(
    `${API_BASE}/group/${groupId}/config/actions/${actionCode}`,
    config
  );
  if (data.code !== 200) {
    throw new Error(data.message || 'Failed to update action config');
  }
}

// ==========================================
// 预设数据 API
// ==========================================

/**
 * 获取预设 Profile 模板列表
 * GET /v1/config/profile-presets
 */
export async function getProfilePresets(): Promise<PresetProfileTemplate[]> {
  const { data } = await apiClient.get<ProfilePresetsResponse>(
    `${API_BASE}/config/profile-presets`
  );
  if (data.code !== 200) {
    throw new Error(data.message || 'Failed to get profile presets');
  }
  return data.data || [];
}

/**
 * 获取预设 Action 类型列表
 * GET /v1/config/action-types
 */
export async function getActionTypes(): Promise<PresetActionType[]> {
  const { data } = await apiClient.get<ActionTypesResponse>(
    `${API_BASE}/config/action-types`
  );
  if (data.code !== 200) {
    throw new Error(data.message || 'Failed to get action types');
  }
  return data.data || [];
}

// ==========================================
// 批量更新 API（编辑 MultiAgent 配置时使用）
// ==========================================

/**
 * 批量更新 MultiAgent 配置
 * PUT /v1/group/{groupId}/config/batch-update
 * 
 * 关键规则：
 * - 用于编辑已有群组的 MultiAgent 配置
 * - Profiles: 新增时 botId 为 null，更新时提供 botId
 * - 删除 Profile: 放在 deletedBotIds 中
 * - Global Script: 直接更新内容
 * - Action Config: 只更新启用状态和自定义模板
 * 
 * @param groupId 群组 ID
 * @param request 批量更新请求
 * @returns 批量更新结果（支持部分成功/失败）
 */
export async function batchUpdateConfig(
  groupId: string | number,
  request: BatchUpdateRequest
): Promise<BatchUpdateResult> {
  const { data } = await apiClient.put<BatchUpdateResponse>(
    `${API_BASE}/group/${groupId}/config/batch-update`,
    request
  );
  if (data.code !== 200) {
    throw new Error(data.message || 'Failed to batch update config');
  }
  return data.data!;
}

// ==========================================
// 便捷函数（编辑模式专用）
// ==========================================

/**
 * 完整更新 MultiAgent 配置（编辑时使用）
 * 
 * 流程：
 * 1. 检查删除的 Profiles
 * 2. 调用 batchUpdateConfig
 * 3. 处理部分成功/失败结果
 * 
 * @param groupId 群组 ID
 * @param originalProfiles 原始 Profiles（用于对比）
 * @param currentProfiles 当前 Profiles 状态
 * @param globalScript Global Script
 * @param actionConfig Action Config
 */
export async function updateMultiAgentConfig(
  groupId: string | number,
  originalProfiles: ProfileVO[],
  currentProfiles: ProfileVO[],
  globalScript: GlobalScriptVO,
  actionConfig?: { enabledActionCodes: number[]; customTemplates?: Record<number, string> }
): Promise<BatchUpdateResult> {
  // 找出要删除的 Profile（在 original 中存在但在 current 中不存在）
  const currentBotIds = new Set(currentProfiles.map(p => p.botId).filter(Boolean));
  const deletedBotIds = originalProfiles
    .filter(p => p.botId && !currentBotIds.has(p.botId))
    .map(p => p.botId!);

  // 构建 Profile 更新项
  const profiles: import('../types/multiagent').ProfileUpdateItem[] = currentProfiles.map(p => ({
    botId: p.botId,  // null/undefined 表示新增
    botName: p.botName || p.roleName,
    roleType: p.roleType,
    roleName: p.roleName,
    description: p.description,
    presetTemplateId: p.presetTemplateId,
    accessType: p.accessType ?? 0,
  }));

  const request: BatchUpdateRequest = {
    globalScript,
    profiles,
    deletedBotIds,
  };

  if (actionConfig) {
    request.actionConfig = {
      enabledActionCodes: actionConfig.enabledActionCodes,
      customTemplates: actionConfig.customTemplates,
    };
  }

  return batchUpdateConfig(groupId, request);
}

/**
 * 验证批量更新结果是否有失败项
 * @param result 批量更新结果
 */
export function hasBatchUpdateFailures(result: BatchUpdateResult): boolean {
  if (!result.profiles) return false;
  return result.profiles.some(p => !p.success);
}

/**
 * 获取批量更新失败的错误信息列表
 * @param result 批量更新结果
 */
export function getBatchUpdateErrors(result: BatchUpdateResult): string[] {
  if (!result.profiles) return [];
  return result.profiles
    .filter(p => !p.success && p.errorMessage)
    .map(p => `${p.botName}: ${p.errorMessage}`);
}
