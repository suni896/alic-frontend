/**
 * Action Config Section Component
 * 
 * Action 配置区域
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { useFormikContext, getIn } from 'formik';
import { FiInfo, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import AutoResizeTextarea from '../../ui/Textarea';
import { InputLabel, ErrorText } from '../../ui/SharedComponents';
import type { PresetActionType, ActionConfigVO } from '../../../types/multiagent';

// ==================== Types ====================

interface ActionConfigSectionProps {
  disabled?: boolean;
  actionTypes: PresetActionType[];
  /** 紧凑模式（用于嵌入表单，减少 padding） */
  compact?: boolean;
}

interface FormValues {
  multiAgentConfig?: {
    actionConfig?: ActionConfigVO;
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

const ActionList = styled.div`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;
  
  /* ================= Box Model ================= */
  width: 100%;
  box-sizing: border-box;
  gap: var(--space-3);
`;

const ActionCard = styled.div<{ $isEnabled?: boolean }>`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;
  
  /* ================= Box Model ================= */
  width: 100%;
  box-sizing: border-box;
  
  /* ================= Visual ================= */
  background: ${(props) => (props.$isEnabled ? 'var(--white)' : 'var(--gray-50)')};
  border: 1px solid ${(props) => (props.$isEnabled ? 'var(--emerald-green)' : 'var(--gray-200)')};
  border-radius: var(--radius-8);
  
  /* ================= Animation ================= */
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${(props) => (props.$isEnabled ? 'var(--emerald-green)' : 'var(--gray-300)')};
  }
`;

const ActionHeader = styled.div`
  /* ================= Layout ================= */
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  /* ================= Box Model ================= */
  width: 100%;
  padding: var(--space-3);
  box-sizing: border-box;
  
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    padding: var(--space-4);
  }
  
  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    padding: var(--space-4);
  }
`;

const ActionInfo = styled.div`
  /* ================= Layout ================= */
  display: flex;
  align-items: center;
  
  /* ================= Box Model ================= */
  gap: var(--space-3);
  
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    gap: var(--space-4);
  }
  
  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    gap: var(--space-4);
  }
`;

const CheckboxContainer = styled.label`
  /* ================= Layout ================= */
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* ================= Box Model ================= */
  width: 1.25rem;
  height: 1.25rem;
  
  /* ================= Interaction ================= */
  cursor: pointer;
  
  input {
    display: none;
  }
`;

const Checkbox = styled.span<{ $checked?: boolean }>`
  /* ================= Layout ================= */
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* ================= Box Model ================= */
  width: 1.25rem;
  height: 1.25rem;
  
  /* ================= Visual ================= */
  background: ${(props) => (props.$checked ? 'var(--emerald-green)' : 'white')};
  border: 1px solid ${(props) => (props.$checked ? 'var(--emerald-green)' : 'var(--gray-300)')};
  border-radius: 4px;
  
  /* ================= Animation ================= */
  transition: all 0.2s ease;
  
  &::after {
    content: "✓";
    
    /* ================= Typography ================= */
    font-size: 0.875rem;
    font-weight: bold;
    color: white;
    
    /* ================= Animation ================= */
    opacity: ${(props) => (props.$checked ? 1 : 0)};
    transition: opacity 0.2s ease;
  }
`;

const ActionDetails = styled.div`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const ActionName = styled.div`
  /* ================= Typography ================= */
  font-family: var(--font-roboto);
  font-size: var(--space-4);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-4);
  }
`;

const ActionDescription = styled.div`
  /* ================= Typography ================= */
  font-family: var(--font-roboto);
  font-size: var(--space-3);
  color: var(--muted-6b7280);
  
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    font-size: var(--space-3);
  }
`;

const CategoryBadge = styled.span<{ $category?: number }>`
  /* ================= Layout ================= */
  display: inline-flex;
  
  /* ================= Box Model ================= */
  padding: var(--space-1) var(--space-2);
  
  /* ================= Typography ================= */
  font-family: var(--font-roboto);
  font-size: var(--space-4);
  font-weight: var(--weight-medium);
  
  /* ================= Visual ================= */
  background: ${(props) => {
    switch (props.$category) {
      case 1:
        return 'var(--blue-100)';
      case 2:
        return 'var(--purple-100)';
      default:
        return 'var(--green-100)';
    }
  }};
  color: ${(props) => {
    switch (props.$category) {
      case 1:
        return 'var(--blue-700)';
      case 2:
        return 'var(--purple-700)';
      default:
        return 'var(--green-700)';
    }
  }};
  border-radius: var(--radius-5);
`;

const ExpandButton = styled.button`
  /* ================= Layout ================= */
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* ================= Box Model ================= */
  width: 2rem;
  height: 2rem;
  padding: 0;
  
  /* ================= Visual ================= */
  background: transparent;
  border: none;
  
  /* ================= Typography ================= */
  font-size: 1.25rem;
  color: var(--muted-6b7280);
  
  /* ================= Interaction ================= */
  cursor: pointer;
  
  /* ================= Animation ================= */
  transition: all 0.2s ease;
  
  &:hover {
    color: var(--color-text);
  }
`;

const ActionContent = styled.div<{ $isExpanded: boolean }>`
  /* ================= Layout ================= */
  display: ${(props) => (props.$isExpanded ? 'flex' : 'none')};
  flex-direction: column;
  
  /* ================= Box Model ================= */
  width: 100%;
  gap: var(--space-3);
  padding: var(--space-3);
  box-sizing: border-box;
  
  /* ================= Visual ================= */
  border-top: 1px solid var(--gray-200);
  
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

const InputGroup = styled.div`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;
  
  /* ================= Box Model ================= */
  width: 100%;
  gap: var(--space-1);
`;

// Process Script container with larger min-height
const ProcessScriptContainer = styled(InputGroup)`
  & textarea {
    min-height: 10rem !important;
    height: auto !important;
    
    /* tablet >= 768px */
    @media (min-width: 48rem) {
      min-height: 12rem !important;
    }
  }
`;

const InfoIcon = styled(FiInfo)`
  /* ================= Layout ================= */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  /* ================= Box Model ================= */
  width: 1rem;
  height: 1rem;
  margin-left: var(--space-1);
  
  /* ================= Typography ================= */
  font-size: 0.75rem;
  color: var(--muted-6b7280);
  
  /* ================= Visual ================= */
  border: 1px solid var(--gray-300);
  border-radius: 50%;
  
  /* ================= Interaction ================= */
  cursor: help;
`;

const LabelWithTooltip = styled.div`
  /* ================= Layout ================= */
  display: flex;
  align-items: center;
  
  /* ================= Typography ================= */
  font-family: var(--font-roboto);
  font-size: var(--space-4);
  font-weight: var(--weight-medium);
  color: var(--color-text);
`;

// ==================== Component ====================

const getCategoryLabel = (category?: number): string => {
  switch (category) {
    case 1:
      return 'Advanced';
    case 2:
      return 'Experimental';
    default:
      return 'Basic';
  }
};

const ActionConfigSection: React.FC<ActionConfigSectionProps> = ({ 
  disabled = false, 
  actionTypes,
  compact = false,
}) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } = 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useFormikContext<FormValues & Record<string, any>>();
  const [expandedActions, setExpandedActions] = useState<Set<number>>(new Set());

  const toggleExpand = (actionCode: number) => {
    const newExpanded = new Set(expandedActions);
    if (newExpanded.has(actionCode)) {
      newExpanded.delete(actionCode);
    } else {
      newExpanded.add(actionCode);
    }
    setExpandedActions(newExpanded);
  };

  const isActionEnabled = (actionCode: number): boolean => {
    return values.multiAgentConfig?.actionConfig?.enabledActionCodes?.includes(actionCode) || false;
  };

  const toggleAction = (actionCode: number, checked: boolean) => {
    const currentCodes = values.multiAgentConfig?.actionConfig?.enabledActionCodes || [];
    if (checked) {
      setFieldValue('multiAgentConfig.actionConfig.enabledActionCodes', [...currentCodes, actionCode]);
    } else {
      setFieldValue(
        'multiAgentConfig.actionConfig.enabledActionCodes',
        currentCodes.filter((code: number) => code !== actionCode)
      );
    }
  };

  return (
    <Section $compact={compact}>
      <SectionTitle>Action Configuration (Action 配置)</SectionTitle>
      <HelperText>
        Select which actions agents can use during the discussion. At least one action must be enabled.
      </HelperText>

      <ActionList>
        {actionTypes.map((action) => {
            const isEnabled = isActionEnabled(action.actionCode);
            const isExpanded = expandedActions.has(action.actionCode);

            return (
              <ActionCard key={action.actionCode} $isEnabled={isEnabled}>
                <ActionHeader>
                  <ActionInfo>
                    <CheckboxContainer>
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) => toggleAction(action.actionCode, e.target.checked)}
                        disabled={disabled}
                      />
                      <Checkbox $checked={isEnabled} />
                    </CheckboxContainer>
                    <ActionDetails>
                      <ActionName>
                        {action.displayName}
                        <CategoryBadge $category={action.category}>
                          {getCategoryLabel(action.category)}
                        </CategoryBadge>
                      </ActionName>
                      <ActionDescription>{action.description}</ActionDescription>
                    </ActionDetails>
                  </ActionInfo>
                  <ExpandButton
                    type="button"
                    onClick={() => toggleExpand(action.actionCode)}
                    disabled={disabled}
                  >
                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                  </ExpandButton>
                </ActionHeader>

                <ActionContent $isExpanded={isExpanded}>
                  {action.processScript && (
                    <ProcessScriptContainer>
                      <LabelWithTooltip>
                        Process Script
                        <InfoIcon title="The process script defines how this action is executed" />
                      </LabelWithTooltip>
                      <AutoResizeTextarea
                        name={`actionScript-${action.actionCode}`}
                        placeholder=""
                        value={action.processScript}
                        onChange={() => {}}
                        onBlur={() => {}}
                        disabled
                        hasError={false}
                      />
                    </ProcessScriptContainer>
                  )}

                  {isEnabled && (
                    <InputGroup>
                      <InputLabel htmlFor={`multiAgentConfig.actionConfig.customTemplates.${action.actionCode}`}>
                        Custom Template (Optional)
                      </InputLabel>
                          <AutoResizeTextarea
                        name={`multiAgentConfig.actionConfig.customTemplates.${action.actionCode}`}
                        placeholder="Enter custom template to override the default process script..."
                        value={values.multiAgentConfig?.actionConfig?.customTemplates?.[action.actionCode] || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={disabled}
                        hasError={!!(getIn(touched, `multiAgentConfig.actionConfig.customTemplates.${action.actionCode}`) && 
                          getIn(errors, `multiAgentConfig.actionConfig.customTemplates.${action.actionCode}`))}
                      />
                    </InputGroup>
                  )}
                </ActionContent>
              </ActionCard>
            );
          })}
      </ActionList>

      {typeof (errors as { multiAgentConfig?: { actionConfig?: { enabledActionCodes?: string } } }).multiAgentConfig?.actionConfig?.enabledActionCodes === 'string' && (
        <ErrorText>{(errors as { multiAgentConfig?: { actionConfig?: { enabledActionCodes?: string } } }).multiAgentConfig?.actionConfig?.enabledActionCodes}</ErrorText>
      )}
    </Section>
  );
};

export default ActionConfigSection;
