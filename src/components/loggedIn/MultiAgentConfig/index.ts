/**
 * MultiAgent Config Module
 * 
 * 导出所有 MultiAgent 配置相关组件和类型
 */

// 主组件
export { default as MultiAgentConfigPanel } from './MultiAgentConfigPanel';
export type { 
  MultiAgentConfigFormValues, 
  MultiAgentEditFormValues 
} from './MultiAgentConfigPanel';

// 编辑组件（新增）
export { default as EditMultiAgentConfigPanel } from './EditMultiAgentConfigPanel';

// 子组件
export { default as GlobalScriptSection } from './GlobalScriptSection';
export { default as ProfilesSection } from './ProfilesSection';
export { default as ActionConfigSection } from './ActionConfigSection';

// 验证模式
export {
  multiAgentConfigSchema,
  multiAgentEditSchema,
  profileSchema,
  globalScriptSchema,
  actionConfigSchema,
  type ProfileFormValues,
  type GlobalScriptFormValues,
  type ActionConfigFormValues,
  type MultiAgentConfigFormValues as MultiAgentConfigSchemaValues,
  type MultiAgentEditFormValues as MultiAgentEditSchemaValues,
} from './MultiAgentConfigSchema';
