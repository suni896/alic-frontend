/**
 * Create Profile Preset Modal
 *
 * 在配置 Agent 时，如果现有模板不合适，可快速创建自定义模板
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import Button from '../../ui/Button';
import AutoResizeTextarea from '../../ui/Textarea';
import {
  ModalBackdrop,
  ModalCloseButton,
  HeaderSection,
  HeaderTitle,
  HeaderSubTitle,
  ButtonContainer,
  FixedButtonContainer,
} from '../../ui/SharedComponents';
import { useCreateProfilePreset } from '../../../hooks/queries/useMultiAgent';

// ==================== Types ====================

interface CreateProfilePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** 创建成功后回调，返回新模板的 templateId */
  onSuccess: (templateId: string) => void;
  /** 默认 roleType */
  defaultRoleType?: 0 | 1;
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
  max-width: 35rem;
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

const Form = styled.div`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;

  /* ================= Box Model ================= */
  width: 100%;
  gap: var(--space-3);

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    gap: var(--space-4);
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

const NumberInput = styled(TextInput).attrs({ type: 'number' })`
  /* ================= Box Model ================= */
  padding-right: 1.5rem;
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
`;

// ==================== Component ====================

const CreateProfilePresetModal: React.FC<CreateProfilePresetModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultRoleType = 1,
}) => {
  const [templateName, setTemplateName] = useState('');
  const [roleType, setRoleType] = useState<0 | 1>(defaultRoleType);
  const [promptTemplate, setPromptTemplate] = useState('');
  const [contextTemplate, setContextTemplate] = useState('');
  const [contextLength, setContextLength] = useState(5);
  const [temperature, setTemperature] = useState(0.7);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createPresetMutation = useCreateProfilePreset();

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!templateName.trim()) {
      newErrors.templateName = 'Template name is required';
    } else if (templateName.length > 50) {
      newErrors.templateName = 'Template name cannot exceed 50 characters';
    } else if (!/^[\u4e00-\u9fa5A-Za-z0-9]+(?: [\u4e00-\u9fa5A-Za-z0-9]+)*$/.test(templateName)) {
      newErrors.templateName = 'Only Chinese, English, numbers and single spaces are allowed';
    }
    if (!promptTemplate.trim()) {
      newErrors.promptTemplate = 'Prompt template is required';
    } else if (promptTemplate.length > 20000) {
      newErrors.promptTemplate = 'Prompt template cannot exceed 20000 characters';
    }
    if (!contextTemplate.trim()) {
      newErrors.contextTemplate = 'Context template is required';
    } else if (contextTemplate.length > 20000) {
      newErrors.contextTemplate = 'Context template cannot exceed 20000 characters';
    }
    if (contextLength < 1 || contextLength > 20) {
      newErrors.contextLength = 'Context length must be between 1 and 20';
    }
    if (temperature < 0 || temperature > 2) {
      newErrors.temperature = 'Temperature must be between 0 and 2';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const templateId = await createPresetMutation.mutateAsync({
        templateName: templateName.trim(),
        roleType,
        promptTemplate: promptTemplate.trim(),
        contextTemplate: contextTemplate.trim(),
        contextLength,
        temperature,
      });

      // Reset form
      setTemplateName('');
      setPromptTemplate('');
      setContextTemplate('');
      setContextLength(5);
      setTemperature(0.7);
      setErrors({});

      onSuccess(templateId);
      onClose();
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create template',
      });
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return createPortal(
    <ModalBackdrop onClick={handleClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalCloseButton onClick={handleClose} aria-label="Close">
          <FiX />
        </ModalCloseButton>

        <HeaderSection>
          <HeaderTitle>Create Profile Template</HeaderTitle>
          <HeaderSubTitle>Create a custom template for your AI agent</HeaderSubTitle>
        </HeaderSection>

        <ModalContent>
          <Form>
            <InputGroup>
              <InputLabel htmlFor="preset-template-name">Template Name *</InputLabel>
              <TextInput
                id="preset-template-name"
                placeholder="e.g., Critical Thinker"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                maxLength={50}
                disabled={createPresetMutation.isPending}
                $hasError={!!errors.templateName}
              />
              {errors.templateName && <ErrorText>{errors.templateName}</ErrorText>}
            </InputGroup>

            <FormRow>
              <InputGroup>
                <InputLabel htmlFor="preset-role-type">Role Type *</InputLabel>
                <Select
                  id="preset-role-type"
                  value={roleType}
                  onChange={(e) => setRoleType(Number(e.target.value) as 0 | 1)}
                  disabled={createPresetMutation.isPending}
                >
                  <option value={0}>Manager (讨论主持人)</option>
                  <option value={1}>Assistant (讨论参与者)</option>
                </Select>
              </InputGroup>

              <InputGroup>
                <InputLabel htmlFor="preset-context-length">Context Length *</InputLabel>
                <NumberInput
                  id="preset-context-length"
                  min={1}
                  max={20}
                  value={contextLength}
                  onChange={(e) => setContextLength(Number(e.target.value))}
                  disabled={createPresetMutation.isPending}
                  $hasError={!!errors.contextLength}
                />
                {errors.contextLength && <ErrorText>{errors.contextLength}</ErrorText>}
              </InputGroup>

              <InputGroup>
                <InputLabel htmlFor="preset-temperature">Temperature *</InputLabel>
                <NumberInput
                  id="preset-temperature"
                  min={0}
                  max={2}
                  step={0.1}
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  disabled={createPresetMutation.isPending}
                  $hasError={!!errors.temperature}
                />
                {errors.temperature && <ErrorText>{errors.temperature}</ErrorText>}
              </InputGroup>
            </FormRow>

            <InputGroup>
              <InputLabel htmlFor="preset-prompt-template">Prompt Template *</InputLabel>
              <AutoResizeTextarea
                name="preset-prompt-template"
                placeholder="Enter the system prompt for this agent..."
                value={promptTemplate}
                onChange={(e) => setPromptTemplate(e.target.value)}
                maxLength={20000}
                onBlur={() => {}}
                hasError={!!errors.promptTemplate}
                disabled={createPresetMutation.isPending}
              />
              {errors.promptTemplate && <ErrorText>{errors.promptTemplate}</ErrorText>}
            </InputGroup>

            <InputGroup>
              <InputLabel htmlFor="preset-context-template">Context Template *</InputLabel>
              <AutoResizeTextarea
                name="preset-context-template"
                placeholder="Enter the context template for this agent..."
                value={contextTemplate}
                onChange={(e) => setContextTemplate(e.target.value)}
                maxLength={20000}
                onBlur={() => {}}
                hasError={!!errors.contextTemplate}
                disabled={createPresetMutation.isPending}
              />
              {errors.contextTemplate && <ErrorText>{errors.contextTemplate}</ErrorText>}
            </InputGroup>

            {errors.submit && <ErrorText>{errors.submit}</ErrorText>}
          </Form>
        </ModalContent>

        <ButtonContainer>
          <FixedButtonContainer>
            <Button
              type="button"
              variant="cancel"
              onClick={handleClose}
              disabled={createPresetMutation.isPending}
            >
              Cancel
            </Button>
          </FixedButtonContainer>
          <FixedButtonContainer>
            <Button
              type="button"
              variant="primary"
              onClick={handleSubmit}
              disabled={createPresetMutation.isPending}
              $isLoading={createPresetMutation.isPending}
            >
              Create
            </Button>
          </FixedButtonContainer>
        </ButtonContainer>
      </Modal>
    </ModalBackdrop>,
    document.body
  );
};

export default CreateProfilePresetModal;
