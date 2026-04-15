/**
 * Etherpad Configuration File
 * Centralized management of all Etherpad-related configuration items
 */

// Etherpad configuration
export const ETHERPAD_CONFIG = {
  // Server URL
  SERVER_URL: import.meta.env.VITE_API_ETHERPAD_URL || '',
  
  // API Key for accessing Etherpad API
  API_KEY: import.meta.env.VITE_API_ETHERPAD_KEY || '',

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