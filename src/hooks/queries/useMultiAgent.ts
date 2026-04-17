/**
 * MultiAgent Config React Query Hooks
 * 
 * 参考文档: /docs/MultiAgent-Development-Plan.md
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';
import type {
  GlobalScriptVO,
  ProfileVO,
  PresetActionType,
  PresetProfileTemplate,
  BatchUpdateRequest,
  BatchUpdateResult,
  CreateGroupPayload,
  CreateGroupResponse,
} from '../../types/multiagent';
import * as multiAgentApi from '../../api/multiagent.api';

// ==========================================
// Query Keys
// ==========================================

export const multiAgentKeys = {
  all: ['multiAgent'] as const,
  presets: () => [...multiAgentKeys.all, 'presets'] as const,
  profilePresets: () => [...multiAgentKeys.presets(), 'profile'] as const,
  actionTypes: () => [...multiAgentKeys.presets(), 'actionTypes'] as const,
  config: (groupId: string | number) => [...multiAgentKeys.all, 'config', groupId] as const,
  globalScript: (groupId: string | number) => [...multiAgentKeys.config(groupId), 'globalScript'] as const,
  profiles: (groupId: string | number) => [...multiAgentKeys.config(groupId), 'profiles'] as const,
  actions: (groupId: string | number) => [...multiAgentKeys.config(groupId), 'actions'] as const,
};

// ==========================================
// 预设数据 Queries
// ==========================================

/**
 * 获取预设 Profile 模板列表
 */
export function useProfilePresets(): UseQueryResult<PresetProfileTemplate[], Error> {
  return useQuery({
    queryKey: multiAgentKeys.profilePresets(),
    queryFn: multiAgentApi.getProfilePresets,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * 获取预设 Action 类型列表
 */
export function useActionTypes(): UseQueryResult<PresetActionType[], Error> {
  return useQuery({
    queryKey: multiAgentKeys.actionTypes(),
    queryFn: multiAgentApi.getActionTypes,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ==========================================
// 配置 Queries
// ==========================================

/**
 * 获取 Global Script
 * @param groupId 群组 ID
 * @param enabled 是否启用查询
 */
export function useGlobalScript(
  groupId: string | number,
  enabled: boolean = true
): UseQueryResult<GlobalScriptVO, Error> {
  return useQuery({
    queryKey: multiAgentKeys.globalScript(groupId),
    queryFn: () => multiAgentApi.getGlobalScript(groupId),
    enabled: !!groupId && enabled,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * 获取 Profiles 列表
 * @param groupId 群组 ID
 * @param enabled 是否启用查询
 */
export function useProfiles(
  groupId: string | number,
  enabled: boolean = true
): UseQueryResult<ProfileVO[], Error> {
  return useQuery({
    queryKey: multiAgentKeys.profiles(groupId),
    queryFn: () => multiAgentApi.getProfiles(groupId),
    enabled: !!groupId && enabled,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * 获取 Action Config
 * @param groupId 群组 ID
 * @param enabled 是否启用查询
 */
export function useActionConfig(
  groupId: string | number,
  enabled: boolean = true
): UseQueryResult<{ enabledActionCodes: number[]; customTemplates: Record<number, string> | null; actionRules: unknown[] | null }, Error> {
  return useQuery({
    queryKey: multiAgentKeys.actions(groupId),
    queryFn: () => multiAgentApi.getActionConfig(groupId),
    enabled: !!groupId && enabled,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// ==========================================
// Mutations
// ==========================================

/**
 * 创建 MultiAgent 群组
 */
export function useCreateMultiAgentGroup(): UseMutationResult<
  CreateGroupResponse,
  Error,
  CreateGroupPayload
> {
  return useMutation({
    mutationFn: multiAgentApi.createMultiAgentGroup,
  });
}

/**
 * 更新 Global Script
 * @param groupId 群组 ID
 */
export function useUpdateGlobalScript(
  groupId: string | number
): UseMutationResult<void, Error, GlobalScriptVO> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (script: GlobalScriptVO) =>
      multiAgentApi.updateGlobalScript(groupId, script),
    onSuccess: () => {
      // 重新获取 Global Script
      queryClient.invalidateQueries({
        queryKey: multiAgentKeys.globalScript(groupId),
      });
    },
  });
}

/**
 * 添加 Profile
 * @param groupId 群组 ID
 */
export function useAddProfile(
  groupId: string | number
): UseMutationResult<
  { profileId: string; botId: string },
  Error,
  Omit<ProfileVO, 'profileId' | 'botId' | 'condition'>
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profile) => multiAgentApi.addProfile(groupId, profile),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: multiAgentKeys.profiles(groupId),
      });
    },
  });
}

/**
 * 更新 Profile
 * @param groupId 群组 ID
 */
export function useUpdateProfile(
  groupId: string | number
): UseMutationResult<
  { newProfileId: string; newBotId?: string },
  Error,
  {
    botId: string;
    profile: Omit<ProfileVO, 'profileId' | 'botId' | 'condition'>;
  }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ botId, profile }) =>
      multiAgentApi.updateProfile(groupId, botId, profile),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: multiAgentKeys.profiles(groupId),
      });
    },
  });
}

/**
 * 删除 Profile
 * @param groupId 群组 ID
 */
export function useDeleteProfile(
  groupId: string | number
): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (botId: string) => multiAgentApi.deleteProfile(groupId, botId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: multiAgentKeys.profiles(groupId),
      });
    },
  });
}

/**
 * 更新 Action Config
 * @param groupId 群组 ID
 */
export function useUpdateActionConfig(
  groupId: string | number
): UseMutationResult<
  void,
  Error,
  {
    actionCode: number;
    config: {
      processScript: string;
      isEnabled: boolean;
      customTemplate?: string;
      rules?: Record<string, unknown>;
    };
  }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ actionCode, config }) =>
      multiAgentApi.updateActionConfig(groupId, actionCode, config),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: multiAgentKeys.actions(groupId),
      });
    },
  });
}

/**
 * 批量更新 MultiAgent 配置
 * @param groupId 群组 ID
 */
export function useBatchUpdateConfig(
  groupId: string | number
): UseMutationResult<BatchUpdateResult, Error, BatchUpdateRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BatchUpdateRequest) =>
      multiAgentApi.batchUpdateConfig(groupId, request),
    onSuccess: () => {
      // 批量使所有相关配置失效
      queryClient.invalidateQueries({
        queryKey: multiAgentKeys.config(groupId),
      });
    },
  });
}

// ==========================================
// 便捷 Hook（编辑模式专用）
// ==========================================

interface EditModeConfig {
  originalProfiles: ProfileVO[];
  currentProfiles: ProfileVO[];
  globalScript: GlobalScriptVO;
  actionConfig?: { enabledActionCodes: number[]; customTemplates?: Record<number, string> };
}

/**
 * 完整更新 MultiAgent 配置（编辑模式专用）
 * 自动处理 Profile 的增删改
 * 
 * @param groupId 群组 ID
 */
export function useUpdateMultiAgentConfig(
  groupId: string | number
): UseMutationResult<BatchUpdateResult, Error, EditModeConfig> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: EditModeConfig) =>
      multiAgentApi.updateMultiAgentConfig(
        groupId,
        config.originalProfiles,
        config.currentProfiles,
        config.globalScript,
        config.actionConfig
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: multiAgentKeys.config(groupId),
      });
    },
  });
}

// ==========================================
// 预加载函数
// ==========================================

/**
 * 预加载群组 MultiAgent 配置
 * 在打开编辑模态框前调用
 */
export function prefetchMultiAgentConfig(
  queryClient: ReturnType<typeof useQueryClient>,
  groupId: string | number
): Promise<[void, void, void]> {
  return Promise.all([
    queryClient.prefetchQuery({
      queryKey: multiAgentKeys.globalScript(groupId),
      queryFn: () => multiAgentApi.getGlobalScript(groupId),
    }),
    queryClient.prefetchQuery({
      queryKey: multiAgentKeys.profiles(groupId),
      queryFn: () => multiAgentApi.getProfiles(groupId),
    }),
    queryClient.prefetchQuery({
      queryKey: multiAgentKeys.actions(groupId),
      queryFn: () => multiAgentApi.getActionConfig(groupId),
    }),
  ]);
}
