/**
 * Global Script Section Component
 * 
 * 全局剧本配置区域
 */

import React from 'react';
import styled from 'styled-components';
import { useFormikContext, getIn } from 'formik';
import AutoResizeTextarea from '../../ui/Textarea';
import { InputLabel, ErrorText } from '../../ui/SharedComponents';
import type { GlobalScriptVO } from '../../../types/multiagent';

// ==================== Types ====================

interface GlobalScriptSectionProps {
  disabled?: boolean;
  /** 外部控制模式（编辑组件使用） */
  value?: GlobalScriptVO;
  onChange?: (value: GlobalScriptVO) => void;
  /** 紧凑模式（用于嵌入表单，减少 padding） */
  compact?: boolean;
}

interface FormValues {
  multiAgentConfig?: {
    globalScript?: GlobalScriptVO;
  };
}

// ==================== Styled Components ====================

const Section = styled.div<{ $compact?: boolean }>`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;
  
  /* ================= Box Model ================= */
  width: 100%;
  box-sizing: border-box;
  gap: ${(props) => (props.$compact ? 'var(--space-3)' : 'var(--space-4)')};
  padding: ${(props) => (props.$compact ? '0' : 'var(--space-4)')};
  
  /* ================= Visual ================= */
  background: ${(props) => (props.$compact ? 'transparent' : 'var(--white)')};
  border: ${(props) => (props.$compact ? 'none' : '1px solid var(--gray-200)')};
  border-radius: ${(props) => (props.$compact ? '0' : 'var(--radius-12)')};
  
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    gap: ${(props) => (props.$compact ? 'var(--space-3)' : 'var(--space-5)')};
    padding: ${(props) => (props.$compact ? '0' : 'var(--space-5)')};
  }
  
  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    gap: ${(props) => (props.$compact ? 'var(--space-3)' : 'var(--space-5)')};
    padding: ${(props) => (props.$compact ? '0' : 'var(--space-6)')};
  }
`;

const SectionTitle = styled.h3`
  /* ================= Typography ================= */
  font-family: var(--font-roboto);
  font-size: var(--space-4);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  
  /* ================= Box Model ================= */
  margin: 0;
  
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-5);
  }
  
  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-5);
  }
`;

const TextareaContainer = styled.div`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;
  
  /* ================= Box Model ================= */
  width: 100%;
  gap: var(--space-2);
`;

const HelperText = styled.p`
  /* ================= Typography ================= */
  font-family: var(--font-roboto);
  font-size: var(--space-3);
  color: var(--muted-6b7280);
  
  /* ================= Box Model ================= */
  margin: 0;
  
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-3);
  }
  
  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-4);
  }
`;

const SubSection = styled.div`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;
  
  /* ================= Box Model ================= */
  width: 100%;
  box-sizing: border-box;
  gap: var(--space-3);
  padding: var(--space-3);
  
  /* ================= Visual ================= */
  background: var(--gray-50);
  border-radius: var(--radius-8);
  
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    gap: var(--space-4);
    padding: var(--space-4);
  }
  
  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    gap: var(--space-4);
    padding: var(--space-4);
  }
`;

const SubSectionTitle = styled.h4`
  /* ================= Typography ================= */
  font-family: var(--font-roboto);
  font-size: var(--space-3);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  
  /* ================= Box Model ================= */
  margin: 0;
  
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-4);
  }
  
  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    font-size: var(--space-4);
  }
`;

const Select = styled.select<{ $hasError?: boolean }>`
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

const InputGroup = styled.div`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;
  
  /* ================= Box Model ================= */
  width: 100%;
  gap: var(--space-2);
`;

// ==================== Component ====================

const GlobalScriptSection: React.FC<GlobalScriptSectionProps> = ({
  disabled = false,
  value,
  onChange,
  compact = false,
}) => {
  // 判断是否为外部控制模式
  const isControlled = value !== undefined && onChange !== undefined;

  // Formik 模式
  const formik = useFormikContext<FormValues>();
  const { values, errors, touched, handleChange, handleBlur } = formik || {};

  // 获取当前值（外部控制模式优先）
  const currentGlobalScript = isControlled
    ? value
    : (values?.multiAgentConfig?.globalScript || {}) as GlobalScriptVO;

  // Provide default values if globalScript is undefined
  const safeValues = {
    globalScript: {
      scriptContent: currentGlobalScript?.scriptContent || '',
      interactionPolicy: {
        turnTaking: '',
        maxTurns: '',
        maxDuration: '',
        terminationCondition: '',
        ...(currentGlobalScript?.interactionPolicy || {}),
      },
      roleConstraints: currentGlobalScript?.roleConstraints || [],
    },
  };

  // 处理变更（支持外部控制模式）
  const handleFieldChange = (field: string, fieldValue: string | number) => {
    if (isControlled) {
      // 外部控制模式：直接调用 onChange
      const newValue = { ...currentGlobalScript };
      if (field.includes('interactionPolicy.')) {
        const key = field.replace('interactionPolicy.', '');
        newValue.interactionPolicy = {
          ...newValue.interactionPolicy,
          [key]: fieldValue,
        };
      } else {
        (newValue as Record<string, unknown>)[field] = fieldValue;
      }
      onChange!(newValue);
    }
    // Formik 模式：使用 handleChange
  };

  // 包装 onChange 处理函数
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value: inputValue } = e.target;
    if (isControlled) {
      handleFieldChange(name.replace('globalScript.', '').replace('multiAgentConfig.', ''), inputValue);
    } else {
      handleChange?.(e);
    }
  };

  const turnTakingOptions = [
    { value: '', label: 'Select turn taking mode (optional)' },
    { value: 'round_robin', label: 'Round Robin (轮流发言)' },
    { value: 'volunteer', label: 'Volunteer (自愿发言)' },
    { value: 'designated', label: 'Designated (指定发言)' },
  ];

  return (
    <Section $compact={compact}>
      <SectionTitle>Global Script (全局剧本)</SectionTitle>
      
      <TextareaContainer>
        <InputLabel htmlFor="globalScript.scriptContent">
          Script Content *
        </InputLabel>
        <HelperText>
          Define the overall discussion scenario, topic, and expected flow.
        </HelperText>
        <AutoResizeTextarea
          name="multiAgentConfig.globalScript.scriptContent"
          placeholder="Enter the global script content here..."
          value={safeValues.globalScript.scriptContent}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={disabled}
          hasError={!isControlled && !!(getIn(touched, 'multiAgentConfig.globalScript.scriptContent') && getIn(errors, 'multiAgentConfig.globalScript.scriptContent'))}
        />
        {!isControlled && getIn(touched, 'multiAgentConfig.globalScript.scriptContent') && getIn(errors, 'multiAgentConfig.globalScript.scriptContent') && (
          <ErrorText>{getIn(errors, 'multiAgentConfig.globalScript.scriptContent')}</ErrorText>
        )}
      </TextareaContainer>

      <SubSection>
        <SubSectionTitle>Interaction Policy (交互策略)</SubSectionTitle>
        
        <InputGroup>
          <InputLabel htmlFor="globalScript.interactionPolicy.turnTaking">
            Turn Taking Mode
          </InputLabel>
          <Select
            id="globalScript.interactionPolicy.turnTaking"
            name="multiAgentConfig.globalScript.interactionPolicy.turnTaking"
            value={safeValues.globalScript.interactionPolicy?.turnTaking || ''}
            onChange={handleInputChange}
            onBlur={handleBlur}
            disabled={disabled}
          >
            {turnTakingOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </InputGroup>

        <InputGroup>
          <InputLabel htmlFor="globalScript.interactionPolicy.maxTurns">
            Max Turns
          </InputLabel>
          <Select
            id="globalScript.interactionPolicy.maxTurns"
            name="multiAgentConfig.globalScript.interactionPolicy.maxTurns"
            value={safeValues.globalScript.interactionPolicy?.maxTurns?.toString() || ''}
            onChange={handleInputChange}
            onBlur={handleBlur}
            disabled={disabled}
          >
            <option value="">Select max turns (optional)</option>
            <option value="5">5 turns</option>
            <option value="10">10 turns</option>
            <option value="15">15 turns</option>
            <option value="20">20 turns</option>
            <option value="30">30 turns</option>
            <option value="50">50 turns</option>
            <option value="100">100 turns</option>
          </Select>
        </InputGroup>

        <InputGroup>
          <InputLabel htmlFor="globalScript.interactionPolicy.maxDuration">
            Max Duration (minutes)
          </InputLabel>
          <Select
            id="globalScript.interactionPolicy.maxDuration"
            name="multiAgentConfig.globalScript.interactionPolicy.maxDuration"
            value={safeValues.globalScript.interactionPolicy?.maxDuration?.toString() || ''}
            onChange={handleInputChange}
            onBlur={handleBlur}
            disabled={disabled}
          >
            <option value="">Select duration (optional)</option>
            <option value="5">5 minutes</option>
            <option value="10">10 minutes</option>
            <option value="15">15 minutes</option>
            <option value="20">20 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">60 minutes</option>
            <option value="90">90 minutes</option>
            <option value="120">120 minutes</option>
          </Select>
        </InputGroup>

        <TextareaContainer>
          <InputLabel htmlFor="globalScript.interactionPolicy.terminationCondition">
            Termination Condition
          </InputLabel>
            <AutoResizeTextarea
            name="multiAgentConfig.globalScript.interactionPolicy.terminationCondition"
            placeholder="Optional: when should the discussion end?"
            value={safeValues.globalScript.interactionPolicy?.terminationCondition || ''}
            onChange={handleInputChange}
            onBlur={handleBlur}
            disabled={disabled}
            hasError={false}
          />
        </TextareaContainer>
      </SubSection>


    </Section>
  );
};

export default GlobalScriptSection;
