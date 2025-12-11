/**
 * Etherpad Configuration File
 * Centralized management of all Etherpad-related configuration items
 */

// Environment configuration
const ENV = {
  development: {
    ETHERPAD_URL: 'http://8.138.89.124:8080',
    API_KEY: '4e4183f5467fcd0f2ee35a7c4c0b65d40a1d2a9a3d2b45d9614c938f3c243c50',
  },
  production: {
    ETHERPAD_URL: 'http://8.138.89.124:8080',
    API_KEY: '4e4183f5467fcd0f2ee35a7c4c0b65d40a1d2a9a3d2b45d9614c938f3c243c50',
  },
  // Can add more environments
};

// Current environment
const currentEnv = process.env.NODE_ENV || 'development';

// Etherpad configuration
export const ETHERPAD_CONFIG = {
  // Server URL
  SERVER_URL: ENV[currentEnv as keyof typeof ENV]?.ETHERPAD_URL || ENV.development.ETHERPAD_URL,
  
  // API Key for accessing Etherpad API
  API_KEY: ENV[currentEnv as keyof typeof ENV]?.API_KEY || ENV.development.API_KEY,
  
  // Pad ID prefix, used to distinguish different types of pads
  PAD_PREFIX: 'room-',
  
  // Default settings
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
    lang: 'en',
  },
};

export default ETHERPAD_CONFIG; 