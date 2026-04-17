/**
 * MultiAgent Config Form Validation Schema
 * 
 * 使用 Yup 进行表单验证
 */

import * as Yup from 'yup';

// ==========================================
// 基础验证规则
// ==========================================

const roleNameValidation = Yup.string()
  .required('Role name is required')
  .matches(
    /^[\u4e00-\u9fa5A-Za-z0-9]{1,20}$/,
    'Must be 1-20 characters. Supports letters, numbers, and Chinese characters.'
  );

const descriptionValidation = Yup.string()
  .max(500, 'Description cannot exceed 500 characters');

const scriptContentValidation = Yup.string()
  .required('Script content is required')
  .max(5000, 'Script content cannot exceed 5000 characters');

// ==========================================
// Profile 验证 Schema
// ==========================================

export const profileSchema = Yup.object().shape({
  botId: Yup.string().nullable(),
  botName: Yup.string()
    .required('Bot name is required')
    .matches(
      /^[\u4e00-\u9fa5A-Za-z0-9]{1,20}$/,
      'Must be 1-20 characters. Supports letters, numbers, and Chinese characters.'
    ),
  roleType: Yup.number()
    .oneOf([0, 1], 'Invalid role type')
    .required('Role type is required'),
  roleName: roleNameValidation,
  description: descriptionValidation,
  presetTemplateId: Yup.string()
    .required('Please select a preset template'),
  accessType: Yup.number()
    .oneOf([0, 1], 'Invalid access type')
    .required('Access type is required'),
  condition: Yup.number(),
});

// ==========================================
// Global Script 验证 Schema
// ==========================================

const interactionPolicySchema = Yup.object().shape({
  turnTaking: Yup.string()
    .oneOf(['round_robin', 'volunteer', 'designated'], 'Invalid turn taking mode'),
  maxTurns: Yup.number()
    .min(1, 'Minimum 1 turn')
    .max(100, 'Maximum 100 turns'),
  maxDuration: Yup.number()
    .min(1, 'Minimum 1 minute')
    .max(180, 'Maximum 180 minutes'),
  terminationCondition: Yup.string()
    .max(500, 'Termination condition cannot exceed 500 characters'),
});

const roleConstraintSchema = Yup.object().shape({
  role: Yup.string().required('Role is required'),
  canInterrupt: Yup.boolean(),
  maxSpeakingTime: Yup.number()
    .min(1, 'Minimum 1 second')
    .max(300, 'Maximum 300 seconds'),
});

export const globalScriptSchema = Yup.object().shape({
  scriptContent: scriptContentValidation,
  interactionPolicy: interactionPolicySchema,
  roleConstraints: Yup.array().of(roleConstraintSchema),
});

// ==========================================
// Action Config 验证 Schema
// ==========================================

const actionRuleSchema = Yup.object().shape({
  maxUsagePerTurn: Yup.number()
    .min(1, 'Minimum 1')
    .max(10, 'Maximum 10'),
  cooldownTurns: Yup.number()
    .min(0, 'Minimum 0')
    .max(10, 'Maximum 10'),
  targetRoles: Yup.array().of(Yup.string()),
  condition: Yup.string()
    .max(300, 'Condition cannot exceed 300 characters'),
});

export const actionConfigSchema = Yup.object().shape({
  enabledActionCodes: Yup.array()
    .of(Yup.number())
    .min(1, 'Select at least one action'),
  customTemplates: Yup.object(),
  actionRules: Yup.object().shape({
    '*': actionRuleSchema,
  }),
});

// ==========================================
// 完整表单验证 Schema
// ==========================================

export const multiAgentConfigSchema = Yup.object().shape({
  // 基础群组信息（创建时使用）
  roomName: Yup.string()
    .required('Group Name is required')
    .matches(
      /^[A-Za-z0-9]{1,20}$/,
      'Must be 1-20 characters long, supports uppercase and lowercase English letters and numbers'
    ),
  roomDescription: Yup.string()
    .required('Group Description is required')
    .max(800, 'Group Description cannot exceed 800 characters'),
  roomType: Yup.string()
    .oneOf(['0', '1'], 'Invalid group type')
    .required('Group Type is required'),
  roomPassword: Yup.string().when('roomType', {
    is: (value: string) => value === '0',
    then: (schema) =>
      schema
        .required('Password is required for private groups')
        .matches(
          /^[A-Za-z0-9!@#$%^&*()_+\-={}$.]{6,33}$/,
          'Password must be 6-33 characters long and contain valid characters'
        ),
    otherwise: (schema) => schema.notRequired(),
  }),

  // MultiAgent 配置
  globalScript: globalScriptSchema,
  
  profiles: Yup.array()
    .of(profileSchema)
    .min(2, 'At least 2 agents are required (1 Manager + 1 Assistant)')
    .max(10, 'Maximum 10 agents allowed')
    .required('Agent profiles are required')
    .test('manager-required', 'At least one MANAGER agent is required', (profiles) => {
      if (!profiles || !Array.isArray(profiles)) return false;
      return profiles.some((p) => p.roleType === 0);
    })
    .test('unique-role-names', 'Agent role names must be unique', function (profiles) {
      if (!profiles || !Array.isArray(profiles)) return true;
      
      const roleNames = profiles.map((p) => p.roleName?.trim().toLowerCase()).filter(Boolean);
      const uniqueNames = new Set(roleNames);
      return uniqueNames.size === roleNames.length;
    }),

  actionConfig: actionConfigSchema,
});

// ==========================================
// 编辑模式验证 Schema（不包含群组基础信息）
// ==========================================

export const multiAgentEditSchema = Yup.object().shape({
  globalScript: globalScriptSchema,
  
  profiles: Yup.array()
    .of(profileSchema)
    .min(2, 'At least 2 agents are required (1 Manager + 1 Assistant)')
    .max(10, 'Maximum 10 agents allowed')
    .required('Agent profiles are required')
    .test('manager-required', 'At least one MANAGER agent is required', (profiles) => {
      if (!profiles || !Array.isArray(profiles)) return false;
      return profiles.some((p) => p.roleType === 0);
    })
    .test('unique-role-names', 'Agent role names must be unique', function (profiles) {
      if (!profiles || !Array.isArray(profiles)) return true;
      
      const roleNames = profiles.map((p) => p.roleName?.trim().toLowerCase()).filter(Boolean);
      const uniqueNames = new Set(roleNames);
      return uniqueNames.size === roleNames.length;
    }),

  actionConfig: actionConfigSchema,
});

// ==========================================
// 类型导出
// ==========================================

export type ProfileFormValues = Yup.InferType<typeof profileSchema>;
export type GlobalScriptFormValues = Yup.InferType<typeof globalScriptSchema>;
export type ActionConfigFormValues = Yup.InferType<typeof actionConfigSchema>;
export type MultiAgentConfigFormValues = Yup.InferType<typeof multiAgentConfigSchema>;
export type MultiAgentEditFormValues = Yup.InferType<typeof multiAgentEditSchema>;
