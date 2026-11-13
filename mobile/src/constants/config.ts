import { Platform } from 'react-native';

const getDefaultBackendUrl = (): string => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }
  return 'http://localhost:5000';
};

export const DEFAULT_CONFIG = {
  DEFAULT_BACKEND_URL: getDefaultBackendUrl(),
  META_ACCENT_COLOR: '#0081FB', 
  SUCCESS_COLOR: '#10B981',     
  WARNING_COLOR: '#F59E0B',     
  DANGER_COLOR: '#EF4444',      
  BG_COLOR: '#0A0F1D',          
  CARD_BG: '#141D2F',           
  BORDER_COLOR: '#1E293B',      
  TEXT_PRIMARY: '#F8FAFC',     
  TEXT_SECONDARY: '#94A3B8',    
};
