export interface Lead {
  id: string;
  leadgen_id: string;
  form_id: string;
  page_id?: string;
  adId?: string;
  adName?: string;
  campaignName?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  customFields?: Record<string, string>;
  createdTime: string;
  source?: 'meta_live' | 'meta_test_tool' | 'local_simulation';
  isMock?: boolean;
}

export type SocketStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

export interface ServerConfig {
  backendUrl: string;
}
