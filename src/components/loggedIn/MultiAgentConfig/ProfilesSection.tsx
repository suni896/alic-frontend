/**
 * Profiles Section Component
 * 
 * Agent Profiles 配置区域
 */

import React from 'react';
import styled from 'styled-components';
import { useFormikContext, FieldArray } from 'formik';
import { IoIosAddCircleOutline, IoIosRemoveCircleOutline } from 'react-icons/io';
import { FaRobot, FaUserTie } from 'react-icons/fa';
import { InputLabel, ErrorText } from '../../ui/SharedComponents';
import type { ProfileVO, PresetProfileTemplate } from '../../../types/multiagent';

// ==================== Types ====================

interface ProfilesSectionProps {
  disabled?: boolean;
  presetTemplates: PresetProfileTemplate[];
  /** 紧凑模式（用于嵌入表单，减少 padding） */
  compact?: boolean;
}

interface FormValues {
  multiAgentConfig?: {
    profiles?: ProfileVO[];
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

const ProfileCard = styled.div<{ $isManager?: boolean }>`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;
  
  /* ================= Box Model ================= */
  width: 100%;
  box-sizing: border-box;
  gap: var(--space-3);
  padding: var(--space-3);
  
  /* ================= Visual ================= */
  background: ${(props) => props.$isManager ? 'var(--blue-50)' : 'var(--gray-50)'};
  border: 1px solid ${(props) => props.$isManager ? 'var(--blue-200)' : 'var(--gray-200)'};
  border-radius: var(--radius-8);
  
  /* ================= Animation ================= */
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${(props) => props.$isManager ? 'var(--blue-300)' : 'var(--gray-300)'};
  }
  
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

const ProfileHeader = styled.div`
  /* ================= Layout ================= */
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  /* ================= Box Model ================= */
  width: 100%;
`;

const ProfileTitle = styled.div`
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

const RoleBadge = styled.span<{ $role: 0 | 1 }>`
  /* ================= Layout ================= */
  display: inline-flex;
  align-items: center;
  
  /* ================= Box Model ================= */
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  
  /* ================= Typography ================= */
  font-family: var(--font-roboto);
  font-size: var(--space-4);
  font-weight: var(--weight-medium);
  
  /* ================= Visual ================= */
  background: ${(props) => props.$role === 0 ? 'var(--blue-100)' : 'var(--green-100)'};
  color: ${(props) => props.$role === 0 ? 'var(--blue-700)' : 'var(--green-700)'};
  border-radius: var(--radius-5);
`;

const RemoveIcon = styled(IoIosRemoveCircleOutline)`
  /* ================= Layout ================= */
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* ================= Box Model ================= */
  width: 1.5rem;
  height: 1.5rem;
  
  /* ================= Typography ================= */
  font-size: 1.2rem;
  color: var(--error-red);
  
  /* ================= Interaction ================= */
  cursor: pointer;
  
  /* ================= Animation ================= */
  transition: all 0.2s ease;
  
  &:hover {
    color: var(--error-red-dark);
    transform: scale(1.1);
  }
  
  /* tablet >= 768px */
  @media (min-width: 48rem) {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 1.5rem;
  }
  
  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 1.5rem;
  }
`;

const FormRow = styled.div`
  /* ================= Layout ================= */
  display: grid;
  grid-template-columns: 1fr;
  
  /* ================= Box Model ================= */
  width: 100%;
  box-sizing: border-box;
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

const InputGroup = styled.div`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;
  
  /* ================= Box Model ================= */
  width: 100%;
  box-sizing: border-box;
  gap: var(--space-1);
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

const TemplateDescription = styled.div`
  /* ================= Typography ================= */
  font-family: var(--font-roboto);
  font-size: var(--space-3);
  color: var(--muted-6b7280);
  line-height: 1.5;
  
  /* ================= Box Model ================= */
  margin-top: var(--space-2);
  padding: var(--space-2);
  
  /* ================= Visual ================= */
  background: var(--gray-50);
  border-radius: var(--radius-5);
  border-left: 3px solid var(--emerald-green);
`;

const AddButton = styled.button`
  /* ================= Layout ================= */
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* ================= Box Model ================= */
  width: 100%;
  gap: var(--space-2);
  padding: var(--space-3);
  
  /* ================= Typography ================= */
  font-family: var(--font-roboto);
  font-size: var(--space-4);
  font-weight: var(--weight-medium);
  color: var(--emerald-green);
  
  /* ================= Visual ================= */
  background: var(--white);
  border: 1px dashed var(--emerald-green);
  border-radius: var(--radius-8);
  
  /* ================= Animation ================= */
  transition: all 0.2s ease;
  
  /* ================= Interaction ================= */
  cursor: pointer;
  
  &:hover {
    background: var(--green-50);
    border-color: var(--emerald-green);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AddIcon = styled(IoIosAddCircleOutline)`
  font-size: 1.2rem;
  color: var(--emerald-green);
`;

const ErrorContainer = styled.div`
  /* ================= Layout ================= */
  display: flex;
  flex-direction: column;
  
  /* ================= Box Model ================= */
  width: 100%;
  gap: var(--space-1);
`;

// ==================== Component ====================

const ProfilesSection: React.FC<ProfilesSectionProps> = ({ 
  disabled = false, 
  presetTemplates,
  compact = false,
}) => {
  const { values, errors, touched, handleChange, handleBlur, setFieldValue } = useFormikContext<FormValues>();

  // Provide default empty array if profiles is undefined
  const safeProfiles = values.multiAgentConfig?.profiles || [];

  // Custom handler for roleType to ensure number type
  const handleRoleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>, index: number) => {
    const value = e.target.value;
    // HTML select value is always string, convert to number
    const numValue = value === '' ? '' : parseInt(value, 10);
    setFieldValue(`multiAgentConfig.profiles.${index}.roleType`, numValue);
  };

  const getRoleTypeOptions = () => [
    { value: '', label: 'Select role type' },
    { value: 0, label: 'Manager (讨论主持人)' },
    { value: 1, label: 'Assistant (讨论参与者)' },
  ];

  const getTemplateOptions = () => [
    { value: '', label: 'Select preset template' },
    ...presetTemplates.map((t) => ({
      value: t.templateId,
      label: `${t.templateName} - ${t.description.substring(0, 40)}...`,
    })),
  ];

  // Check for array-level validation errors (has-manager, has-assistant)
  const profilesError = (errors as any)?.multiAgentConfig?.profiles;
  const profilesTouched = (touched as any)?.multiAgentConfig?.profiles;
  const showProfilesError = profilesTouched && typeof profilesError === 'string';

  return (
    <Section $compact={compact}>
      <SectionTitle>Agent Profiles (Agent 配置)</SectionTitle>
      <HelperText>
        Configure AI agents for the discussion. At least 1 MANAGER and 1 ASSISTANT required.
      </HelperText>
      
      {showProfilesError && (
        <ErrorText $visible={true}>{profilesError}</ErrorText>
      )}

      <FieldArray name="multiAgentConfig.profiles">
        {({ push, remove }) => (
          <>
            {safeProfiles.map((profile: ProfileVO, index: number) => {
              const profileErrors = ((errors as { multiAgentConfig?: { profiles?: { botName?: string; roleName?: string; presetTemplateId?: string }[] } }).multiAgentConfig?.profiles)?.[index];
              const profileTouched = ((touched as { multiAgentConfig?: { profiles?: { botName?: boolean; roleName?: boolean; presetTemplateId?: boolean }[] } }).multiAgentConfig?.profiles)?.[index];
              const isManager = profile.roleType === 0;

              return (
                <ProfileCard key={index} $isManager={isManager}>
                  <ProfileHeader>
                    <ProfileTitle>
                      {isManager ? <FaUserTie /> : <FaRobot />}
                      Agent #{index + 1}
                      <RoleBadge $role={profile.roleType ?? 1}>
                        {profile.roleType === 0 ? 'MANAGER' : 'ASSISTANT'}
                      </RoleBadge>
                    </ProfileTitle>
                    {(values.multiAgentConfig?.profiles?.length || 0) > 2 && (
                      <RemoveIcon 
                        data-testid="remove-agent-btn"
                        onClick={() => {
                          if (!disabled) {
                            console.log('[ProfilesSection] Removing agent at index:', index);
                            remove(index);
                          }
                        }} 
                      />
                    )}
                  </ProfileHeader>

                  <FormRow>
                    <InputGroup>
                      <InputLabel htmlFor={`profiles.${index}.botName`}>
                        Bot Name *
                      </InputLabel>
                      <TextInput
                        id={`profiles.${index}.botName`}
                        name={`multiAgentConfig.profiles.${index}.botName`}
                        placeholder="e.g., Critical Thinker Bot"
                        value={profile.botName || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={disabled}
                        $hasError={!!(profileTouched?.botName && profileErrors?.botName)}
                      />
                      {profileTouched?.botName && profileErrors?.botName && (
                        <ErrorText>{profileErrors.botName}</ErrorText>
                      )}
                    </InputGroup>

                    <InputGroup>
                      <InputLabel htmlFor={`profiles.${index}.roleName`}>
                        Role Name *
                      </InputLabel>
                      <TextInput
                        id={`profiles.${index}.roleName`}
                        name={`multiAgentConfig.profiles.${index}.roleName`}
                        placeholder="e.g., Xiaoming"
                        value={profile.roleName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={disabled}
                        $hasError={!!(profileTouched?.roleName && profileErrors?.roleName)}
                      />
                      {profileTouched?.roleName && profileErrors?.roleName && (
                        <ErrorText>{profileErrors.roleName}</ErrorText>
                      )}
                    </InputGroup>
                  </FormRow>

                  <FormRow>
                    <InputGroup>
                      <InputLabel htmlFor={`profiles.${index}.roleType`}>
                        Role Type *
                      </InputLabel>
                      <Select
                        id={`profiles.${index}.roleType`}
                        name={`multiAgentConfig.profiles.${index}.roleType`}
                        value={profile.roleType}
                        onChange={(e) => handleRoleTypeChange(e, index)}
                        onBlur={handleBlur}
                        disabled={disabled}
                      >
                        {getRoleTypeOptions().map((option, idx) => (
                          <option key={`role-${idx}`} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </InputGroup>

                    <InputGroup>
                      <InputLabel htmlFor={`profiles.${index}.presetTemplateId`}>
                        Preset Template *
                      </InputLabel>
                      <Select
                        id={`profiles.${index}.presetTemplateId`}
                        name={`multiAgentConfig.profiles.${index}.presetTemplateId`}
                        value={profile.presetTemplateId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={disabled}
                        $hasError={!!(profileTouched?.presetTemplateId && profileErrors?.presetTemplateId)}
                      >
                        {getTemplateOptions().map((option, idx) => (
                          <option key={`template-${idx}`} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                      
                      {/* Show full prompt template when selected */}
                      {profile.presetTemplateId && (
                        <TemplateDescription>
                          <strong>Prompt Template:</strong>
                          <pre style={{ margin: '0.5rem 0 0 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {presetTemplates.find(t => t.templateId === profile.presetTemplateId)?.promptTemplate || 
                             presetTemplates.find(t => t.templateId === profile.presetTemplateId)?.description}
                          </pre>
                        </TemplateDescription>
                      )}
                      
                      {profileTouched?.presetTemplateId && profileErrors?.presetTemplateId && (
                        <ErrorText>{profileErrors.presetTemplateId}</ErrorText>
                      )}
                    </InputGroup>
                  </FormRow>

                  <FormRow>
                    <InputGroup>
                      <InputLabel htmlFor={`profiles.${index}.description`}>
                        Description (Optional)
                      </InputLabel>
                      <TextInput
                        id={`profiles.${index}.description`}
                        name={`multiAgentConfig.profiles.${index}.description`}
                        placeholder="Brief description of this agent's role"
                        value={profile.description || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={disabled}
                      />
                    </InputGroup>

                  </FormRow>
                </ProfileCard>
              );
            })}

            {(values.multiAgentConfig?.profiles?.length || 0) < 10 && (
              <AddButton
                type="button"
                data-testid="add-agent-btn"
                onClick={() => {
                  if (!disabled) {
                    console.log('[ProfilesSection] Adding new agent');
                    push({
                      botName: '',
                      roleType: 1,
                      roleName: '',
                      description: '',
                      presetTemplateId: '',
                      accessType: 1,
                    });
                  }
                }}
                disabled={disabled}
              >
                <AddIcon />
                Add Agent
              </AddButton>
            )}
          </>
        )}
      </FieldArray>

      {typeof (errors as { multiAgentConfig?: { profiles?: string } }).multiAgentConfig?.profiles === 'string' && (
        <ErrorContainer>
          <ErrorText>{(errors as { multiAgentConfig?: { profiles?: string } }).multiAgentConfig?.profiles}</ErrorText>
        </ErrorContainer>
      )}
    </Section>
  );
};

export default ProfilesSection;
