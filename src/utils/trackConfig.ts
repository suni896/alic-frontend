/**
 * 埋点系统配置文件
 * 集中管理所有埋点相关的配置项
 */

// 埋点功能开关 - 最高级别控制
export const FEATURE_CONFIG = {
    // 是否启用埋点功能 - 设置为false将完全禁用埋点功能和所有日志
    ENABLED: true,
    // 以下配置仅在ENABLED为true时生效
    CONTENT_CONTAIN_CHECK: true,
    // 注意：以下两个检查已在新规则中禁用，改为在队列中通过转折点过滤处理
    CONTENT_LENGTH_CHECK: false, // 不再检查内容长度，让所有变化都能记录
    CONTENT_DIFF_CHECK: false,   // 不再检查内容差异，让所有变化都能记录
    AUTO_DUMP_QUEUE: true,
    SEND_MESSAGE_TRIGGER: true,
    // 是否启用转折点过滤 - 只保留增→减、减→增的转折点（在队列中实时过滤）
    TURNING_POINT_FILTER: true,
};

// 调试模式配置
export const DEBUG_CONFIG = {
    ENABLED: true,
    CONSOLE_LOG: true,
    VERBOSE: true,
    SHOW_QUEUE: true,
    SHOW_SEND_RESULT: true,
    SHOW_CONTENT_DETAILS: true,
    SHOW_ACTION_TYPE: true,
    SHOW_LENGTH_INFO: true,
    SHOW_TIME_INFO: true,
    SHOW_IDS: true,
    SHOW_CONTENT_DIFF_NOTICE: true,
};

// 批量处理配置
export const BATCH_CONFIG = {
    MAX_BATCH_SIZE: 10,
    FLUSH_INTERVAL_MS: 180000,
    MAX_RETRY_ATTEMPTS: 3,
    RETRY_INTERVAL_MS: 5000,
};

// 事件节流配置
export const THROTTLE_CONFIG = {
    "chat_input_typing": 2000,
};

// 防抖配置（已废弃 - 新规则不使用防抖，改为实时记录+队列转折点过滤）
export const DEBOUNCE_CONFIG = {
    chat_input_typing_add: 0,     // 不再使用防抖
    chat_input_typing_delete: 0,  // 不再使用防抖
};

// 允许的埋点事件
export const ALLOWED_EVENTS = [
    "chat_input_typing",
];

// 内容检查配置
export const CONTENT_CHECK_CONFIG = {
    MIN_CHINESE_CHARS: 2,
    MIN_ENGLISH_WORDS: 2,
    MIN_TOTAL_CHARS: 10,
    MIN_CHINESE_DIFF: 2,
    MIN_ENGLISH_DIFF: 2,
    MIN_TOTAL_DIFF: 5,
};

// 服务器配置
export const SERVER_CONFIG = {
    TRACK_URL: `${import.meta.env.VITE_API_TRACK_URL || "http://localhost:8080"}/api/track`,
    BATCH_TRACK_URL: `${import.meta.env.VITE_API_TRACK_URL || "http://localhost:8080"}/api/track/batch`,
    TIMEOUT_MS: 5000,
};

// 创建并导出配置对象
const trackConfig = {
    DEBUG: DEBUG_CONFIG,
    FEATURES: FEATURE_CONFIG,
    BATCH: BATCH_CONFIG,
    THROTTLE: THROTTLE_CONFIG,
    DEBOUNCE: DEBOUNCE_CONFIG,
    ALLOWED_EVENTS,
    CONTENT_CHECK: CONTENT_CHECK_CONFIG,
    SERVER: SERVER_CONFIG,
};

export default trackConfig;