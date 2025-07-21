/**
 * Etherpad 配置文件
 * 集中管理所有 Etherpad 相关的配置项
 */

// 环境配置
const ENV = {
  development: {
    ETHERPAD_URL: 'http://localhost:9001',
  },
  production: {
    ETHERPAD_URL: 'https://etherpad.example.com',
  },
  // 可以添加更多环境
};

// 当前环境
const currentEnv = process.env.NODE_ENV || 'development';

// Etherpad 配置
export const ETHERPAD_CONFIG = {
  // 服务器 URL
  SERVER_URL: ENV[currentEnv as keyof typeof ENV]?.ETHERPAD_URL || ENV.development.ETHERPAD_URL,
  
  // Pad ID 前缀，用于区分不同类型的 pad
  PAD_PREFIX: 'room-',
  
  // 默认设置
  DEFAULT_SETTINGS: {
    showControls: true,
    showChat: false,
    showLineNumbers: true,
    useMonospaceFont: false,
    userName: 'Anonymous',
    userColor: '',
    rtl: false,
    alwaysShowChat: false,
    width: '100%',
    height: '100%',
    border: 0,
    borderStyle: 'solid',
    plugins: {},
    lang: 'zh-cn',
  },
};

export default ETHERPAD_CONFIG; 