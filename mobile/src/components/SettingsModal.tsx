import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DEFAULT_CONFIG } from '../constants/config';

interface SettingsModalProps {
  visible: boolean;
  currentUrl: string;
  onClose: () => void;
  onSaveUrl: (newUrl: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  currentUrl,
  onClose,
  onSaveUrl,
}) => {
  const insets = useSafeAreaInsets();
  const [urlInput, setUrlInput] = useState(currentUrl);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    const target = urlInput.trim().replace(/\/$/, '');
    try {
      const response = await fetch(`${target}/api/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setTestResult({
          success: true,
          message: `Connected! Active Sockets: ${data.activeSockets || 0}`,
        });
      } else {
        setTestResult({
          success: false,
          message: `Server returned HTTP ${response.status}`,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Connection refused. Ensure server is running and IP is reachable.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const cleanUrl = urlInput.trim().replace(/\/$/, '');
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      Alert.alert('Invalid URL', 'URL must begin with http:// or https://');
      return;
    }
    onSaveUrl(cleanUrl);
    onClose();
  };

  const applyPreset = (presetUrl: string) => {
    setUrlInput(presetUrl);
    setTestResult(null);
  };

  const dynamicBottomPadding = Math.max(insets.bottom, 20) + 12;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { paddingBottom: dynamicBottomPadding }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="settings" size={18} color={DEFAULT_CONFIG.META_ACCENT_COLOR} />
              <Text style={styles.headerTitle}>Server Configuration</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={DEFAULT_CONFIG.TEXT_SECONDARY} />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            Configure the Node.js backend URL receiving Meta webhooks and broadcasting leads via Socket.io.
          </Text>

          {/* Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Backend Server URL</Text>
            <TextInput
              style={styles.input}
              value={urlInput}
              onChangeText={(text) => {
                setUrlInput(text);
                setTestResult(null);
              }}
              placeholder="e.g. http://192.168.1.50:5000"
              placeholderTextColor="#64748B"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>

          {/* Presets */}
          <View style={styles.presetsContainer}>
            <Text style={styles.presetsLabel}>Quick Presets:</Text>
            <View style={styles.presetButtonsRow}>
              <TouchableOpacity
                style={styles.presetBtn}
                onPress={() =>
                  applyPreset(
                    Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000'
                  )
                }
              >
                <Text style={styles.presetBtnText}>
                  {Platform.OS === 'android' ? 'Android Host (10.0.2.2)' : 'Localhost (5000)'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetBtn}
                onPress={() => applyPreset('https://your-tunnel.ngrok-free.app')}
              >
                <Text style={styles.presetBtnText}>Ngrok Tunnel</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Test Status Box */}
          {testResult && (
            <View
              style={[
                styles.resultBox,
                testResult.success ? styles.resultSuccess : styles.resultError,
              ]}
            >
              <Ionicons
                name={testResult.success ? 'checkmark-circle' : 'alert-circle'}
                size={16}
                color={testResult.success ? DEFAULT_CONFIG.SUCCESS_COLOR : DEFAULT_CONFIG.DANGER_COLOR}
              />
              <Text
                style={[
                  styles.resultText,
                  { color: testResult.success ? '#34D399' : '#F87171' },
                ]}
              >
                {testResult.message}
              </Text>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.testBtn}
              onPress={handleTestConnection}
              disabled={isTesting}
            >
              {isTesting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="pulse" size={15} color="#FFFFFF" />
                  <Text style={styles.testBtnText}>Ping Server</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Save & Connect</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeBtn: {
    padding: 4,
  },
  description: {
    fontSize: 12,
    color: DEFAULT_CONFIG.TEXT_SECONDARY,
    lineHeight: 18,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: DEFAULT_CONFIG.TEXT_PRIMARY,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  presetsContainer: {
    marginBottom: 16,
  },
  presetsLabel: {
    fontSize: 11,
    color: DEFAULT_CONFIG.TEXT_SECONDARY,
    marginBottom: 6,
  },
  presetButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  presetBtn: {
    backgroundColor: '#1E293B',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  presetBtnText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  resultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  resultSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  resultError: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  resultText: {
    fontSize: 12,
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  testBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  testBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  saveBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DEFAULT_CONFIG.META_ACCENT_COLOR,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
