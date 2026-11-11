import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Lead, SocketStatus } from '../types/lead';
import { DEFAULT_CONFIG } from '../constants/config';

export function useSocket(initialServerUrl: string = DEFAULT_CONFIG.DEFAULT_BACKEND_URL) {
  const [serverUrl, setServerUrl] = useState<string>(initialServerUrl);
  const [status, setStatus] = useState<SocketStatus>('disconnected');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [latestLeadId, setLatestLeadId] = useState<string | null>(null);
  const [lastEventTime, setLastEventTime] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);

  const connectSocket = useCallback((url: string) => {
    if (socketRef.current) {
      console.log('[Socket Hook] Disconnecting existing socket instance...');
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    console.log(`[Socket Hook] Connecting to ${url}...`);
    setStatus('connecting');

    try {
      const socket = io(url, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      socket.on('connect', () => {
        console.log(`[Socket Hook] 🟢 Connected successfully (ID: ${socket.id})`);
        setStatus('connected');
      });

      socket.on('connection_established', (data) => {
        console.log('[Socket Hook] Handshake confirmed from server:', data);
      });

      socket.on('new_lead', (newLead: Lead) => {
        console.log('[Socket Hook] ⚡ Real-Time Lead Received:', newLead);
        
        setLeads((prevLeads) => {
          // Prevent duplicates if received multiple times
          const exists = prevLeads.some((l) => l.id === newLead.id || l.leadgen_id === newLead.leadgen_id);
          if (exists) {
            return prevLeads.map((l) => (l.id === newLead.id ? newLead : l));
          }
          return [newLead, ...prevLeads];
        });

        setLatestLeadId(newLead.id);
        setLastEventTime(new Date().toLocaleTimeString());

        // Reset highlight pulse after 4 seconds
        setTimeout(() => {
          setLatestLeadId(null);
        }, 4000);
      });

      socket.on('disconnect', (reason) => {
        console.log(`[Socket Hook] 🔴 Socket disconnected: ${reason}`);
        setStatus('disconnected');
      });

      socket.on('connect_error', (error) => {
        console.warn(`[Socket Hook] ⚠️ Connection error: ${error.message}`);
        setStatus('error');
      });

      socketRef.current = socket;
    } catch (err) {
      console.error('[Socket Hook] 💥 Fatal socket initialization error:', err);
      setStatus('error');
    }
  }, []);

  // Initialize connection on mount and when serverUrl changes
  useEffect(() => {
    connectSocket(serverUrl);

    return () => {
      if (socketRef.current) {
        console.log('[Socket Hook] Cleaning up socket connection on unmount.');
        socketRef.current.disconnect();
      }
    };
  }, [serverUrl, connectSocket]);

  const reconnect = useCallback(() => {
    connectSocket(serverUrl);
  }, [serverUrl, connectSocket]);

  /**
   * Helper function to trigger a synthetic lead via the backend /api/test-lead endpoint.
   */
  const triggerTestLead = async (customProfile?: Partial<Lead>) => {
    try {
      const response = await fetch(`${serverUrl.replace(/\/$/, '')}/api/test-lead`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customProfile || {}),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('[Socket Hook] 💥 Error triggering test lead:', error);
      throw error;
    }
  };

  const clearLeads = () => {
    setLeads([]);
  };

  return {
    serverUrl,
    setServerUrl,
    status,
    leads,
    latestLeadId,
    lastEventTime,
    reconnect,
    triggerTestLead,
    clearLeads,
  };
}
