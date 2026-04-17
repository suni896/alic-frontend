/**
 * MultiAgent Config Panel Component
 * 
 * MultiAgent 模式配置主组件
 * 
 * 功能：
 * - 创建新群组时集成在 CreateRoomComponent 中
 * - 编辑群组时作为独立面板使用
 * 
 * 参考文档: /docs/MultiAgent-Development-Plan.md
 */

import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Formik, FormikHelpers } from 'formik';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
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
import { multiAgentConfigSchema, multiAgentEditSchema } from './MultiAgentConfigSchema';
import type {
  MultiAgentConfigVO,
  ProfileVO,
  GlobalScriptVO,
  ActionConfigVO,
  PresetProfileTemplate,
  PresetActionType,
} from '../../../types/multiagent';

// ==================== Types ====================

interface MultiAgentConfigPanelProps {
  /** 是否显示面板 */
  $isOpen: boolean;
  /** 关闭面板回调 */
  onClose: () => void;
  /** 群组 ID（编辑模式时使用） */
  groupId?: string | number;
  /** 是否为编辑模式 */
  isEditMode?: boolean;
  /** 初始配置数据（编辑模式时使用） */
  initialConfig?: MultiAgentConfigVO;
  /** 预设 Profile 模板列表 */
  presetTemplates: PresetProfileTemplate[];
  /** 预设 Action 类型列表 */
  actionTypes: PresetActionType[];
  /** 提交配置回调（创建模式） */
  onSubmit?: (values: MultiAgentConfigFormValues) => void;
  /** 保存配置回调（编辑模式） */
  onSave?: (values: MultiAgentEditFormValues) => Promise<void>;
  /** 是否正在加载 */
  isLoading?: boolean;
  /** 是否正在提交 */
  isSubmitting?: boolean;
}

export interface MultiAgentConfigFormValues {
  roomName: string;
  roomDescription: string;
  roomType: string;
  roomPassword: string;
  globalScript: GlobalScriptVO;
  profiles: ProfileVO[];
  actionConfig: ActionConfigVO;
}

export interface MultiAgentEditFormValues {
  globalScript: GlobalScriptVO;
  profiles: ProfileVO[];
  actionConfig: ActionConfigVO;
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

const Form = styled.form`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;
  
  /* ================= Box Model ================= */
  width: 100%;
  gap: var(--space-4);
  
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    gap: var(--space-5);
  }
  
  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    gap: var(--space-5);
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

const TextInput = styled.input<{ $hasError?: boolean }>`
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
  border: 1px solid ${(props) => (props.$hasError ? 'var(--error-red)' : 'var(--input-bg)')};
  border-radius: var(--radius-5);
  
  /* ================= Animation ================= */
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${(props) => (props.$hasError ? 'var(--error-red)' : 'var(--emerald-green)')};
  }
  
  &:disabled {
    background-color: var(--gray-200);
    color: var(--gray-400);
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const Select = styled.select<{ $hasError?: boolean }>`
  /* ================= Box Model ================= */
  width: 100%;
  height: 2.5rem;
  padding: var(--space-3) var(--space-4);
  
  /* ================= Typography ================= */
  font-family: var(--font-sans);
  font-size: var(--space-4);
  color: var(--slate-grey);
  
  /* ================= Visual ================= */
  background: var(--input-bg);
  border: 1px solid ${(props) => (props.$hasError ? 'var(--error-red)' : 'var(--input-bg)')};
  border-radius: var(--radius-5);
  
  /* ================= Animation ================= */
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${(props) => (props.$hasError ? 'var(--error-red)' : 'var(--emerald-green)')};
  }
  
  &:disabled {
    background-color: var(--gray-200);
    color: var(--gray-400);
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const ErrorText = styled.div`
  /* ================= Typography ================= */
  font-family: var(--font-roboto);
  font-size: var(--space-3);
  color: var(--error-red);
  
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-4);
  }
`;

const FormRow = styled.div`
  /* ================= Layout ================= */
  display: grid;
  grid-template-columns: 1fr;
  
  /* ================= Box Model ================= */
  width: 100%;
  gap: var(--space-3);
  
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
  }
  
  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
  }
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

const MultiAgentConfigPanel: React.FC<MultiAgentConfigPanelProps> = ({
  $isOpen,
  onClose,
  groupId: _groupId,
  isEditMode = false,
  initialConfig,
  presetTemplates,
  actionTypes,
  onSubmit,
  onSave,
  isLoading = false,
  isSubmitting = false,
}) => {
  // 创建模式的初始值
  const createModeInitialValues: MultiAgentConfigFormValues = useMemo(
    () => ({
      roomName: '',
      roomDescription: '',
      roomType: '1',
      roomPassword: '',
      globalScript: {
        scriptContent: '',
        interactionPolicy: {
          turnTaking: 'round_robin',
          maxTurns: 20,
          maxDuration: 30,
          terminationCondition: '',
        },
        roleConstraints: [],
      },
      profiles: [
        {
          botName: '',
          roleType: 0,
          roleName: '',
          description: '',
          presetTemplateId: '',
          accessType: 1,
        },
        {
          botName: '',
          roleType: 1,
          roleName: '',
          description: '',
          presetTemplateId: '',
          accessType: 1,
        },
      ],
      actionConfig: {
        enabledActionCodes: actionTypes.filter((a) => a.isDefaultEnabled).map((a) => a.actionCode),
        customTemplates: {},
        actionRules: {},
      },
    }),
    [actionTypes]
  );

  // 编辑模式的初始值
  const editModeInitialValues: MultiAgentEditFormValues = useMemo(() => {
    if (initialConfig) {
      return {
        globalScript: initialConfig.globalScript,
        profiles: initialConfig.profiles,
        actionConfig: initialConfig.actionConfig || {
          enabledActionCodes: [],
          customTemplates: {},
          actionRules: {},
        },
      };
    }
    return {
      globalScript: createModeInitialValues.globalScript,
      profiles: createModeInitialValues.profiles,
      actionConfig: createModeInitialValues.actionConfig,
    };
  }, [initialConfig, createModeInitialValues]);

  const handleSubmit = async (
    values: MultiAgentConfigFormValues | MultiAgentEditFormValues,
    helpers: FormikHelpers<MultiAgentConfigFormValues | MultiAgentEditFormValues>
  ) => {
    try {
      if (isEditMode && onSave) {
        await onSave(values as MultiAgentEditFormValues);
      } else if (onSubmit) {
        onSubmit(values as MultiAgentConfigFormValues);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      helpers.setSubmitting(false);
    }
  };

  if (!$isOpen) return null;

  return createPortal(
    <ModalBackdrop onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        {isLoading && <LoadingOverlay>Loading...</LoadingOverlay>}

        <ModalCloseButton onClick={onClose} aria-label="Close">
          <FiX />
        </ModalCloseButton>

        <HeaderSection>
          <HeaderTitle>
            {isEditMode ? 'Edit MultiAgent Configuration' : 'MultiAgent Configuration'}
          </HeaderTitle>
          <HeaderSubTitle>
            {isEditMode
              ? 'Update your MultiAgent discussion settings'
              : 'Configure AI agents for multi-party discussion'}
          </HeaderSubTitle>
        </HeaderSection>

        <Formik
          initialValues={isEditMode ? editModeInitialValues : createModeInitialValues}
          validationSchema={isEditMode ? multiAgentEditSchema : multiAgentConfigSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ handleSubmit, values, errors, touched, handleChange, handleBlur, isValid }) => (
            <Form onSubmit={handleSubmit}>
              <ModalContent>
                {/* 基础信息（仅创建模式） */}
                {!isEditMode && (
                  <BasicInfoSection>
                    <InputGroup>
                      <InputLabel htmlFor="roomName">Group Name *</InputLabel>
                      <TextInput
                        id="roomName"
                        name="roomName"
                        placeholder="Enter group name (1-20 characters)"
                        value={(values as MultiAgentConfigFormValues).roomName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={isSubmitting}
                        $hasError={!!(!isEditMode && (touched as { roomName?: boolean }).roomName && (errors as { roomName?: string }).roomName)}
                      />
                      {(!isEditMode && (touched as { roomName?: boolean }).roomName && (errors as { roomName?: string }).roomName) && (
                        <ErrorText>{(errors as { roomName?: string }).roomName}</ErrorText>
                      )}
                    </InputGroup>

                    <InputGroup>
                      <InputLabel htmlFor="roomDescription">Group Description *</InputLabel>
                      <TextInput
                        id="roomDescription"
                        name="roomDescription"
                        placeholder="Enter group description"
                        value={(values as MultiAgentConfigFormValues).roomDescription}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={isSubmitting}
                        $hasError={!!(!isEditMode && (touched as { roomDescription?: boolean }).roomDescription && (errors as { roomDescription?: string }).roomDescription)}
                      />
                      {(!isEditMode && (touched as { roomDescription?: boolean }).roomDescription && (errors as { roomDescription?: string }).roomDescription) && (
                        <ErrorText>{(errors as { roomDescription?: string }).roomDescription}</ErrorText>
                      )}
                    </InputGroup>

                    <FormRow>
                      <InputGroup>
                        <InputLabel htmlFor="roomType">Group Type *</InputLabel>
                        <Select
                          id="roomType"
                          name="roomType"
                          value={(values as MultiAgentConfigFormValues).roomType}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={isSubmitting}
                        >
                          <option value="1">Public (公开)</option>
                          <option value="0">Private (私密)</option>
                        </Select>
                      </InputGroup>

                      {(values as MultiAgentConfigFormValues).roomType === '0' && (
                        <InputGroup>
                          <InputLabel htmlFor="roomPassword">Password *</InputLabel>
                          <TextInput
                            id="roomPassword"
                            name="roomPassword"
                            type="password"
                            placeholder="6-33 characters"
                            value={(values as MultiAgentConfigFormValues).roomPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={isSubmitting}
                            $hasError={!!(!isEditMode && (touched as { roomPassword?: boolean }).roomPassword && (errors as { roomPassword?: string }).roomPassword)}
                          />
                          {(!isEditMode && (touched as { roomPassword?: boolean }).roomPassword && (errors as { roomPassword?: string }).roomPassword) && (
                            <ErrorText>{(errors as { roomPassword?: string }).roomPassword}</ErrorText>
                          )}
                        </InputGroup>
                      )}
                    </FormRow>
                  </BasicInfoSection>
                )}

                {/* Global Script */}
                <GlobalScriptSection disabled={isSubmitting} />

                {/* Profiles */}
                <ProfilesSection 
                  disabled={isSubmitting} 
                  presetTemplates={presetTemplates} 
                />

                {/* Action Config */}
                <ActionConfigSection 
                  disabled={isSubmitting} 
                  actionTypes={actionTypes} 
                />
              </ModalContent>

              <ButtonContainer>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!isValid || isSubmitting}
                  $isLoading={isSubmitting}
                >
                  {isSubmitting
                    ? isEditMode
                      ? 'Saving...'
                      : 'Creating...'
                    : isEditMode
                    ? 'Save Configuration'
                    : 'Create Group'}
                </Button>
                <Button type="button" variant="cancel" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
              </ButtonContainer>
            </Form>
          )}
        </Formik>
      </Modal>
    </ModalBackdrop>,
    document.body
  );
};

export default MultiAgentConfigPanel;
