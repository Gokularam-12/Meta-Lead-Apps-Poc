import { Platform } from 'react-native';

/**
 * Default backend URL configuration.
 * - Android Emulator uses 10.0.2.2 to access host machine localhost.
 * - iOS Simulator / Web uses localhost.
 * - Physical devices can use their machine's LAN IP (e.g., http://192.168.1.50:5000) or Ngrok URL.
 */
const getDefaultBackendUrl = (): string => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }
  return 'http://localhost:5000';
};

export const DEFAULT_CONFIG = {
  DEFAULT_BACKEND_URL: getDefaultBackendUrl(),
  META_ACCENT_COLOR: '#0081FB', // Meta Blue
  SUCCESS_COLOR: '#10B981',     // Emerald
  WARNING_COLOR: '#F59E0B',     // Amber
  DANGER_COLOR: '#EF4444',      // Rose Red
  BG_COLOR: '#0A0F1D',          // Slate Dark
  CARD_BG: '#141D2F',           // Card Dark
  BORDER_COLOR: '#1E293B',      // Subtle Border
  TEXT_PRIMARY: '#F8FAFC',      // White Slate
  TEXT_SECONDARY: '#94A3B8',    // Muted Slate
};
