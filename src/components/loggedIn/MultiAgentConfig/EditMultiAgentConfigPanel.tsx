/**
 * Edit MultiAgent Config Panel Component
 * 
 * 编辑 MultiAgent 群组配置的独立组件
 * 
 * 特点：
 * - 独立管理表单状态（不使用 Formik）
 * - 分离调用：editGroupInfo（基本信息）+ batchUpdateConfig（Agent 配置）
 * - 处理部分成功/失败的结果展示
 * 
 * 参考文档: /docs/MultiAgent-Development-Plan.md
 */

import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { createPortal } from 'react-dom';
import { FiX, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GlobalScriptSection from './GlobalScriptSection';
import ProfilesSection from './ProfilesSection';
import ActionConfigSection from './ActionConfigSection';
import Button from '../../ui/Button';
import {
  ModalCloseButton,
  HeaderSection,
  HeaderTitle,
  HeaderSubTitle,
  ButtonContainer,
  ModalBackdrop,
} from '../../ui/SharedComponents';
import {
  multiAgentKeys,
  useProfilePresets,
  useActionTypes,
} from '../../../hooks/queries/useMultiAgent';
import * as multiAgentApi from '../../../api/multiagent.api';
import type {
  GlobalScriptVO,
  ProfileVO,
  BatchUpdateRequest,
  BatchUpdateResult,
} from '../../../types/multiagent';

// ==================== Types ====================

interface EditMultiAgentConfigPanelProps {
  /** 是否显示面板 */
  $isOpen: boolean;
  /** 关闭面板回调 */
  onClose: () => void;
  /** 群组 ID */
  groupId: string | number;
  /** 群组基本信息（用于编辑） */
  groupInfo?: {
    groupName: string;
    groupDescription: string;
    groupType: number;
    password?: string;
  };
  /** 保存成功回调 */
  onSaveSuccess?: () => void;
}

interface EditFormState {
  // 基本信息
  groupDescription: string;
  password: string;
  // MultiAgent 配置
  globalScript: GlobalScriptVO;
  profiles: ProfileVO[];
  actionConfig: {
    enabledActionCodes: number[];
    customTemplates?: Record<number, string>;
  };
  // 编辑追踪
  deletedBotIds: string[];
}

// ==================== Styled Components ====================

const Modal = styled.div`
  /* ================= Layout ================= */
  position: relative;
  z-index: 11001;
  display: flex;
  flex-direction: column;
  
  /* ================= Box Model ================= */
  width: 95%;
  max-width: 50rem;
  height: auto;
  max-height: 90vh;
  padding: var(--space-4);
  
  /* ================= Visual ================= */
  background: var(--white);
  border: none;
  border-radius: var(--radius-12);
  box-shadow: 0 25px 50px -12px var(--shadow-25);
  
  /* ================= Animation ================= */
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      transform: translateY(-1.25rem);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  /* ================= Interaction ================= */
  cursor: default;
  
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    width: 85%;
    padding: var(--space-6);
    max-height: 85vh;
  }
  
  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    width: 75%;
    padding: var(--space-7);
    max-height: 40rem;
  }
`;

const ModalContent = styled.div`
  /* ================= Layout ================= */
  flex: 1;
  overflow-y: auto;
  overflow-x: visible;
  
  /* ================= Box Model ================= */
  padding-right: var(--space-1);
  margin-top: var(--space-3);
  
  /* ================= Visual ================= */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: var(--gray-300);
    border-radius: 2px;
  }
  
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    padding-right: var(--space-2);
    margin-top: var(--space-4);
  }
  
  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    padding-right: var(--space-2);
    margin-top: var(--space-4);
  }
`;

const BasicInfoSection = styled.div`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;
  
  /* ================= Box Model ================= */
  width: 100%;
  gap: var(--space-3);
  padding: var(--space-4);
  margin-bottom: var(--space-4);
  
  /* ================= Visual ================= */
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-12);
  
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    gap: var(--space-4);
    padding: var(--space-5);
  }
  
  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    gap: var(--space-4);
    padding: var(--space-6);
  }
`;

const InputGroup = styled.div`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;
  
  /* ================= Box Model ================= */
  width: 100%;
  gap: var(--space-1);
`;

const InputLabel = styled.label`
  /* ================= Typography ================= */
  font-family: var(--font-roboto);
  font-size: var(--space-4);
  font-weight: var(--weight-medium);
  color: var(--color-text);
`;

const TextInput = styled.input`
  /* ================= Box Model ================= */
  width: 100%;
  height: 2.5rem;
  padding: var(--space-3) var(--space-4);
  box-sizing: border-box;
  
  /* ================= Typography ================= */
  font-family: var(--font-sans);
  font-size: var(--space-4);
  color: var(--slate-grey);
  
  /* ================= Visual ================= */
  background: var(--input-bg);
  border: 1px solid var(--input-bg);
  border-radius: var(--radius-5);
  
  /* ================= Animation ================= */
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--emerald-green);
  }
  
  &:disabled {
    background-color: var(--gray-200);
    color: var(--gray-400);
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const ResultSection = styled.div<{ $type: 'success' | 'error' | 'warning' }>`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;
  
  /* ================= Box Model ================= */
  width: 100%;
  gap: var(--space-2);
  padding: var(--space-3);
  margin: var(--space-3) 0;
  
  /* ================= Visual ================= */
  background: ${(props) => {
    switch (props.$type) {
      case 'success':
        return 'var(--green-50)';
      case 'error':
        return 'var(--red-50)';
      case 'warning':
        return 'var(--yellow-50)';
    }
  }};
  border: 1px solid ${(props) => {
    switch (props.$type) {
      case 'success':
        return 'var(--green-200)';
      case 'error':
        return 'var(--red-200)';
      case 'warning':
        return 'var(--yellow-200)';
    }
  }};
  border-radius: var(--radius-8);
`;

const ResultTitle = styled.div`
  /* ================= Layout ================= */
  display: flex;
  align-items: center;
  
  /* ================= Box Model ================= */
  gap: var(--space-2);
  
  /* ================= Typography ================= */
  font-family: var(--font-roboto);
  font-size: var(--space-4);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
`;

const ResultList = styled.ul`
  /* ================= Box Model ================= */
  margin: 0;
  padding-left: var(--space-5);
  
  /* ================= Typography ================= */
  font-family: var(--font-roboto);
  font-size: var(--space-3);
  color: var(--color-text);
`;

const LoadingOverlay = styled.div`
  /* ================= Layout ================= */
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  
  /* ================= Box Model ================= */
  width: 100%;
  height: 100%;
  
  /* ================= Visual ================= */
  background: rgba(255, 255, 255, 0.8);
  border-radius: var(--radius-12);
  
  /* ================= Typography ================= */
  font-family: var(--font-roboto);
  font-size: var(--space-4);
  color: var(--color-text);
`;

// ==================== Component ====================

const EditMultiAgentConfigPanel: React.FC<EditMultiAgentConfigPanelProps> = ({
  $isOpen,
  onClose,
  groupId,
  groupInfo,
  onSaveSuccess,
}) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveResult, setSaveResult] = useState<{
    type: 'success' | 'error' | 'warning';
    title: string;
    messages: string[];
  } | null>(null);

  // 加载预设数据
  const { data: profilePresets, isLoading: isLoadingPresets } = useProfilePresets();
  const { data: actionTypes, isLoading: isLoadingActions } = useActionTypes();

  // 加载当前配置
  const { data: globalScriptData, isLoading: isLoadingScript } = useQuery({
    queryKey: multiAgentKeys.globalScript(groupId),
    queryFn: () => multiAgentApi.getGlobalScript(groupId),
    enabled: $isOpen && !!groupId,
  });

  const { data: profilesData, isLoading: isLoadingProfiles } = useQuery({
    queryKey: multiAgentKeys.profiles(groupId),
    queryFn: () => multiAgentApi.getProfiles(groupId),
    enabled: $isOpen && !!groupId,
  });

  const { data: actionConfigData, isLoading: isLoadingActionConfig } = useQuery({
    queryKey: multiAgentKeys.actions(groupId),
    queryFn: () => multiAgentApi.getActionConfig(groupId),
    enabled: $isOpen && !!groupId,
  });

  // 表单状态
  const [formState, setFormState] = useState<EditFormState>({
    groupDescription: groupInfo?.groupDescription || '',
    password: groupInfo?.password || '',
    globalScript: {
      scriptContent: '',
      interactionPolicy: {},
    },
    profiles: [],
    actionConfig: {
      enabledActionCodes: [],
      customTemplates: {},
    },
    deletedBotIds: [],
  });

  // 原始数据（用于对比修改）
  const [, setOriginalProfiles] = useState<ProfileVO[]>([]);

  // 初始化表单数据
  useEffect(() => {
    if ($isOpen) {
      setFormState({
        groupDescription: groupInfo?.groupDescription || '',
        password: groupInfo?.password || '',
        globalScript: globalScriptData || {
          scriptContent: '',
          interactionPolicy: {},
        },
        profiles: profilesData || [],
        actionConfig: {
          enabledActionCodes: actionConfigData?.enabledActionCodes || [],
          customTemplates: actionConfigData?.customTemplates || {},
        },
        deletedBotIds: [],
      });
      setOriginalProfiles(profilesData || []);
      setSaveResult(null);
    }
  }, [$isOpen, groupInfo, globalScriptData, profilesData, actionConfigData]);

  // 批量更新 mutation
  const batchUpdateMutation = useMutation({
    mutationFn: (request: BatchUpdateRequest) =>
      multiAgentApi.batchUpdateConfig(groupId, request),
  });

  const isLoading =
    isLoadingPresets ||
    isLoadingActions ||
    isLoadingScript ||
    isLoadingProfiles ||
    isLoadingActionConfig;

  // 处理字段变更
  const handleFieldChange = (field: keyof EditFormState, value: unknown) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  // TODO: 实现子组件的外部控制模式，使用这些处理函数
  // 暂时保留这些注释作为后续实现的参考
  /*
  const handleGlobalScriptChange = (globalScript: GlobalScriptVO) => {
    setFormState((prev) => ({ ...prev, globalScript }));
  };

  const handleProfilesChange = (profiles: ProfileVO[]) => {
    setFormState((prev) => ({ ...prev, profiles }));
  };

  const handleDeleteProfile = (botId: string) => {
    setFormState((prev) => ({
      ...prev,
      profiles: prev.profiles.filter((p) => p.botId !== botId),
      deletedBotIds: [...prev.deletedBotIds, botId],
    }));
  };

  const handleActionConfigChange = (actionConfig: {
    enabledActionCodes: number[];
    customTemplates?: Record<number, string>;
  }) => {
    setFormState((prev) => ({ ...prev, actionConfig }));
  };
  */

  // 保存配置
  const handleSave = async () => {
    setIsSubmitting(true);
    setSaveResult(null);

    try {
      // 1. 构建批量更新请求
      const request: BatchUpdateRequest = {
        globalScript: formState.globalScript,
        profiles: formState.profiles.map((p) => ({
          botId: p.botId,
          botName: p.botName || p.roleName,
          roleType: p.roleType,
          roleName: p.roleName,
          description: p.description,
          presetTemplateId: p.presetTemplateId,
          accessType: p.accessType ?? 1,
        })),
        deletedBotIds: formState.deletedBotIds,
        actionConfig: {
          enabledActionCodes: formState.actionConfig.enabledActionCodes,
          customTemplates: formState.actionConfig.customTemplates,
        },
      };

      // 2. 调用批量更新
      const result: BatchUpdateResult = await batchUpdateMutation.mutateAsync(request);

      // 3. 处理结果
      const failedProfiles = result.profiles.filter((p) => !p.success);
      const hasGlobalScriptError = !result.globalScriptUpdated;
      const hasActionConfigError = !result.actionConfigUpdated;

      if (failedProfiles.length === 0 && !hasGlobalScriptError && !hasActionConfigError) {
        // 全部成功
        setSaveResult({
          type: 'success',
          title: 'Configuration saved successfully!',
          messages: [`Updated ${result.profiles.length} agent(s)`],
        });
        // 刷新数据
        queryClient.invalidateQueries({
          queryKey: multiAgentKeys.config(groupId),
        });
        onSaveSuccess?.();
        setTimeout(() => onClose(), 1500);
      } else {
        // 部分失败
        const messages: string[] = [];
        if (hasGlobalScriptError) {
          messages.push('Global Script update failed');
        }
        if (hasActionConfigError) {
          messages.push('Action Config update failed');
        }
        failedProfiles.forEach((p) => {
          messages.push(`${p.botName}: ${p.errorMessage || 'Update failed'}`);
        });

        setSaveResult({
          type: 'warning',
          title: 'Partial success - some items failed to save',
          messages,
        });
      }
    } catch (error) {
      setSaveResult({
        type: 'error',
        title: 'Save failed',
        messages: [error instanceof Error ? error.message : 'Unknown error'],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 验证表单
  const isValid = useMemo(() => {
    // 至少要有 2 个 agents
    if (formState.profiles.length < 2) return false;
    // 至少要有 1 个 MANAGER
    if (!formState.profiles.some((p) => p.roleType === 0)) return false;
    // 所有 profile 必须填写必填字段
    if (formState.profiles.some((p) => !p.botName || !p.roleName || !p.presetTemplateId))
      return false;
    // Global Script 必须填写
    if (!formState.globalScript.scriptContent.trim()) return false;
    return true;
  }, [formState]);

  if (!$isOpen) return null;

  return createPortal(
    <ModalBackdrop onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        {isLoading && <LoadingOverlay>Loading configuration...</LoadingOverlay>}

        <ModalCloseButton onClick={onClose} aria-label="Close">
          <FiX />
        </ModalCloseButton>

        <HeaderSection>
          <HeaderTitle>Edit MultiAgent Configuration</HeaderTitle>
          <HeaderSubTitle>Update AI agents and discussion settings</HeaderSubTitle>
        </HeaderSection>

        <ModalContent>
          {/* 基本信息 */}
          <BasicInfoSection>
            <InputGroup>
              <InputLabel htmlFor="edit-group-description">Group Description</InputLabel>
              <TextInput
                id="edit-group-description"
                value={formState.groupDescription}
                onChange={(e) => handleFieldChange('groupDescription', e.target.value)}
                placeholder="Enter group description"
                disabled={isSubmitting}
              />
            </InputGroup>

            {groupInfo?.groupType === 0 && (
              <InputGroup>
                <InputLabel htmlFor="edit-group-password">Password</InputLabel>
                <TextInput
                  id="edit-group-password"
                  type="password"
                  value={formState.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  placeholder="Enter new password (optional)"
                  disabled={isSubmitting}
                />
              </InputGroup>
            )}
          </BasicInfoSection>

          {/* 结果提示 */}
          {saveResult && (
            <ResultSection $type={saveResult.type}>
              <ResultTitle>
                {saveResult.type === 'success' ? (
                  <FiCheckCircle color="var(--emerald-green)" />
                ) : saveResult.type === 'error' ? (
                  <FiAlertCircle color="var(--error-red)" />
                ) : (
                  <FiAlertCircle color="var(--yellow-500)" />
                )}
                {saveResult.title}
              </ResultTitle>
              {saveResult.messages.length > 0 && (
                <ResultList>
                  {saveResult.messages.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                  ))}
                </ResultList>
              )}
            </ResultSection>
          )}

          {/* Global Script - 使用只读展示，需要扩展支持编辑模式 */}
          <GlobalScriptSection 
            disabled={isSubmitting} 
          />

          {/* Profiles - 需要扩展支持编辑模式 */}
          <ProfilesSection 
            disabled={isSubmitting} 
            presetTemplates={profilePresets || []} 
          />

          {/* Action Config */}
          <ActionConfigSection 
            disabled={isSubmitting} 
            actionTypes={actionTypes || []} 
          />
        </ModalContent>

        <ButtonContainer>
          <Button
            type="button"
            variant="cancel"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            disabled={!isValid || isSubmitting}
            $isLoading={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Configuration'}
          </Button>
        </ButtonContainer>
      </Modal>
    </ModalBackdrop>,
    document.body
  );
};

export default EditMultiAgentConfigPanel;
