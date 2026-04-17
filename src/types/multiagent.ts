/**
 * MultiAgent Config 类型定义
 * 
 * 参考文档: /docs/MultiAgent-Development-Plan.md
 */

// ==========================================
// 基础类型
// ==========================================

/**
 * MultiAgent 模式配置
 */
export interface MultiAgentConfigVO {
  globalScript: GlobalScriptVO;
  profiles: ProfileVO[];
  actionConfig?: ActionConfigVO;
  stateAnalyzerProfile?: StateAnalyzerProfileVO;
}

/**
 * 全局剧本
 */
export interface GlobalScriptVO {
  scriptContent: string;
  interactionPolicy?: InteractionPolicyVO;
  roleConstraints?: RoleConstraintVO[];
}

/**
 * 交互策略
 */
export interface InteractionPolicyVO {
  turnTaking?: 'round_robin' | 'volunteer' | 'designated';
  maxTurns?: number;
  maxDuration?: number;
  terminationCondition?: string;
}

/**
 * 角色约束
 */
export interface RoleConstraintVO {
  role: string;
  canInterrupt?: boolean;
  maxSpeakingTime?: number;
}

/**
 * Profile 配置（老师视角）
 * 注意：STATE_ANALYZER 是系统级 Agent，由后端自动创建，前端不需要配置
 */
export interface ProfileVO {
  profileId?: string;         // 创建后返回，更新时会变化（condition模式）
  botId?: string;             // 关联的 Bot ID，创建后返回（API路径中使用）
  botName?: string;           // Bot名称（用于显示）
  roleType: 0 | 1;  // 0=MANAGER, 1=ASSISTANT
  roleName: string;           // 用户自定义名称，如"小明"
  description?: string;       // 角色描述
  presetTemplateId: string;   // 预设模板ID，如 "critical_thinker_v1"
  accessType?: number;        // 0=仅管理员, 1=所有成员
  condition?: number;         // 1=激活，profileId=历史（后端返回，前端只读）
}

/**
 * Action 配置
 */
export interface ActionConfigVO {
  enabledActionCodes: number[];  // 如 [0, 1, 2] 对应 ASK_QUESTION, GIVE_EXAMPLE, CHALLENGE_ASSUMPTION
  customTemplates?: Record<number, string>;  // key: actionCode
  actionRules?: Record<number, ActionRuleVO>;
}

/**
 * Action 规则
 */
export interface ActionRuleVO {
  maxUsagePerTurn?: number;
  cooldownTurns?: number;
  targetRoles?: string[];
  condition?: string;
}

/**
 * State Analyzer 配置
 */
export interface StateAnalyzerProfileVO {
  promptTemplate?: string;
  analysisDimensions?: string[];
  triggerCondition?: string;
  contextLength?: number;
}

// ==========================================
// 预设类型
// ==========================================

/**
 * 预设 Profile 模板（从后端获取）
 */
export interface PresetProfileTemplate {
  templateId: string;         // 如 "critical_thinker_v1"
  templateName: string;       // 如 "批判性思考者"
  description: string;        // 模板描述
  roleType: 0 | 1;            // 0=MANAGER, 1=ASSISTANT（STATE_ANALYZER 不在列表中）
}

/**
 * Action 类型（从后端获取）
 */
export interface PresetActionType {
  actionCode: number;         // 如 0, 1, 2...
  actionType: string;         // 如 "ASK_QUESTION"
  displayName: string;        // 如 "提问"
  description: string;
  processScript?: string;     // 完整的 process script 模板
  outputFormat?: string;      // 输出格式定义（JSON）
  isDefaultEnabled: boolean;  // 默认是否启用
  category?: number;          // 分类: 0=BASIC, 1=ADVANCED, 2=EXPERIMENTAL
  status?: number;            // 状态: 0=禁用, 1=启用
}

/**
 * Role Type 枚举
 */
export enum RoleTypeEnum {
  MANAGER = 0,           // 讨论主持人，负责调度
  ASSISTANT = 1,         // 讨论参与者
  STATE_ANALYZER = 2     // 【系统级】状态分析器，自动创建，不在群聊中显示
}

// ==========================================
// 请求/响应类型
// ==========================================

/**
 * 创建群组请求体（MultiAgent 模式）
 */
export interface CreateGroupPayload {
  groupName: string;
  groupDescription: string;
  groupType: number;          // 0=private, 1=public
  password?: string;
  groupMode: 'free' | 'feedback' | 'multiagent';
  multiAgentConfig?: MultiAgentConfigVO;
}

/**
 * Action Config DTO（后端返回的完整配置）
 */
export interface ActionConfigDTO {
  actionCode: number;
  actionType: string;
  displayName: string;
  processScript: string;
  isEnabled: boolean;
  customTemplate?: string;
  rules?: ActionRuleVO;
}

// ==========================================
// 编辑时使用的新增类型
// ==========================================

/**
 * 批量更新请求（编辑 MultiAgent 配置时使用）
 * PUT /v1/group/{groupId}/config/batch-update
 */
export interface BatchUpdateRequest {
  globalScript?: GlobalScriptVO;
  profiles?: ProfileUpdateItem[];    // 新增/更新的 Profiles
  deletedBotIds?: string[];          // 要删除的 Bot IDs
  actionConfig?: ActionConfigVO;
}

/**
 * Profile 更新项（用于 batch-update）
 */
export interface ProfileUpdateItem {
  botId?: string;              // null 表示新增，有值表示更新
  botName: string;
  roleType: 0 | 1;             // 0=MANAGER, 1=ASSISTANT
  roleName: string;
  description?: string;
  presetTemplateId: string;
  accessType?: number;
}

/**
 * 批量更新结果（部分成功/失败模式）
 */
export interface BatchUpdateResult {
  globalScriptUpdated: boolean;      // Global Script 是否更新成功
  profiles: {
    oldBotId?: string;               // 原始 botId（新增时为 null/undefined）
    newBotId: string;                // 新的 botId（新增或更新后）
    newProfileId: string;            // 新的 profileId（condition 模式产生新版本）
    botName: string;                 // Bot 名称
    operation: 'CREATED' | 'UPDATED'; // 操作类型
    success: boolean;                // 该 Profile 操作是否成功
    errorMessage?: string;           // 失败时的错误信息
  }[];
  actionConfigUpdated: boolean;      // Action Config 是否更新成功
  deletedBotIds: string[];           // 成功删除的 Bot ID 列表
}

// ==========================================
// API 响应类型
// ==========================================

/**
 * 创建群组响应
 */
export interface CreateGroupResponse {
  code: number;
  message: string;
  data?: {
    groupId: number;
    groupName: string;
    groupDescription: string;
    groupType: number;
    password?: string;
    clearContextTime?: string;
    groupMode?: 'free' | 'feedback' | 'multiagent';
    chatBots?: Array<{
      accessType: number;
      botContext: number;
      botName: string;
      botPrompt: string;
      botId?: number;
    }>;
    chatBotFeedback?: {
      botName: string;
      botPrompt: string;
      msgCountInterval: number;
      timeInterval: number;
      botId?: number;
    };
  };
}

/**
 * 预设 Profile 模板列表响应
 */
export interface ProfilePresetsResponse {
  code: number;
  message: string;
  data?: PresetProfileTemplate[];
}

/**
 * Action 类型列表响应
 */
export interface ActionTypesResponse {
  code: number;
  message: string;
  data?: PresetActionType[];
}

/**
 * Global Script 响应
 */
export interface GlobalScriptResponse {
  code: number;
  message: string;
  data?: GlobalScriptVO;
}

/**
 * Profiles 列表响应
 */
export interface ProfilesResponse {
  code: number;
  message: string;
  data?: ProfileVO[];
}

/**
 * Profile 操作响应（添加/更新/删除）
 */
export interface ProfileOperationResponse {
  code: number;
  message: string;
  data?: {
    profileId?: string;
    botId?: string;
    newProfileId?: string;  // 更新时返回新的 profileId
  };
}

/**
 * Action Config 查询响应（GET /config/actions）
 */
export interface ActionConfigQueryResponse {
  code: number;
  message: string;
  data?: {
    enabledActionCodes: number[];
    customTemplates: Record<number, string> | null;
    actionRules: ActionRuleVO[] | null;
  };
}

/**
 * Action Config 响应（PUT /config/actions/{actionCode}）
 */
export interface ActionConfigResponse {
  code: number;
  message: string;
  data?: ActionConfigDTO[];
}

/**
 * 批量更新响应
 */
export interface BatchUpdateResponse {
  code: number;
  message: string;
  data?: BatchUpdateResult;
}
