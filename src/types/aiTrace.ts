/**
 * AI Trace 类型定义
 *
 * 对应后端 GET /v1/admin/ai-traces/{groupId} 接口
 */

// ==========================================
// Chat Message（来自 chat_msg 表）
// ==========================================

export interface ChatMessageVO {
  infoId: number;
  groupId: number;
  senderId: number;
  senderName: string;
  content: string;
  msgType: number;
  createTime: string;
  senderType: 'USER' | 'CHATBOT';
  replyToMsgId: number | null;
}

// ==========================================
// Environment State（来自 env_state_snapshot）
// ==========================================

export interface EnvStateVO {
  snapshotId: number;
  groupId: number;
  msgId: number;
  profileId: number;
  understandingLevel: number | null;
  ideaDiversity: number | null;
  conflictLevel: number | null;
  goalProgress: number | null;
  currentPhase: string | null;
  participationScore: number | null;
  activeUsers: number[] | null;
  silentUsers: number[] | null;
  rawJson: string;
  createdAt: string;
}

// ==========================================
// LLM Context Log（来自 llm_context_log）
// ==========================================

export interface LLMContextLogVO {
  logId: number;
  groupId: number;
  msgId: number;
  agentType: number; // 0=MANAGER, 1=ASSISTANT, 2=STATE_ANALYZER
  profileId: number;
  modelName: string | null;
  modelConfig: string | null;
  systemPrompt: string;
  userPrompt: string;
  contextMessages: string;
  fullPrompt: string;
  llmResponse: string;
  parsedResponse: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  executionTimeMs: number;
  status: string;
  errorMessage: string | null;
  createdAt: string;
}

// ==========================================
// AI Trace Detail（单轮完整 trace）
// ==========================================

export interface AITraceDetailVO {
  triggerMsgId: number;
  envState: EnvStateVO;
  managerIO: LLMContextLogVO;
  assistantIOs: LLMContextLogVO[] | null;
  stateAnalyzerIO: LLMContextLogVO;
}

// ==========================================
// 时间线响应
// ==========================================

export interface AITimelineRespVO {
  messages: ChatMessageVO[];
  traces: Record<string, AITraceDetailVO>;
}

// ==========================================
// API 响应包装
// ==========================================

export interface AITracesResponse {
  code: number;
  message: string;
  data: AITimelineRespVO;
}
