import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SocketStatus } from '../types/lead';
import { DEFAULT_CONFIG } from '../constants/config';

interface HeaderProps {
  status: SocketStatus;
  leadCount: number;
  onOpenSettings: () => void;
  onClearLeads: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  leadCount,
  onOpenSettings,
  onClearLeads,
}) => {
  const insets = useSafeAreaInsets();

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return {
          label: 'Live Connected',
          dotColor: DEFAULT_CONFIG.SUCCESS_COLOR,
          bgColor: 'rgba(16, 185, 129, 0.15)',
          borderColor: 'rgba(16, 185, 129, 0.3)',
        };
      case 'connecting':
        return {
          label: 'Connecting...',
          dotColor: DEFAULT_CONFIG.WARNING_COLOR,
          bgColor: 'rgba(245, 158, 11, 0.15)',
          borderColor: 'rgba(245, 158, 11, 0.3)',
        };
      case 'disconnected':
      case 'error':
      default:
        return {
          label: 'Disconnected',
          dotColor: DEFAULT_CONFIG.DANGER_COLOR,
          bgColor: 'rgba(239, 68, 68, 0.15)',
          borderColor: 'rgba(239, 68, 68, 0.3)',
        };
    }
  };

  const badge = getStatusBadge();

  const dynamicTopPadding = Math.max(insets.top, Platform.OS === 'android' ? 16 : 12) + 6;

  return (
    <View style={[styles.container, { paddingTop: dynamicTopPadding }]}>
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <View style={styles.logoBadge}>
            <Ionicons name="logo-facebook" size={20} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.title}>Meta Lead Ads</Text>
            <Text style={styles.subtitle}>Real-Time Webhook Stream</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          {leadCount > 0 && (
            <TouchableOpacity
              onPress={onClearLeads}
              style={styles.iconButton}
              accessibilityLabel="Clear leads"
            >
              <Ionicons name="trash-outline" size={18} color={DEFAULT_CONFIG.TEXT_SECONDARY} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={onOpenSettings}
            style={styles.iconButton}
            accessibilityLabel="Configure server connection"
          >
            <Ionicons name="settings-sharp" size={19} color={DEFAULT_CONFIG.TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomRow}>
        {/* Real-Time Connection Status Indicator */}
        <TouchableOpacity
          onPress={onOpenSettings}
          activeOpacity={0.8}
          style={[
            styles.statusPill,
            { backgroundColor: badge.bgColor, borderColor: badge.borderColor },
          ]}
        >
          <View style={[styles.statusDot, { backgroundColor: badge.dotColor }]} />
          <Text style={[styles.statusText, { color: badge.dotColor }]}>{badge.label}</Text>
        </TouchableOpacity>

        {/* Total Leads Counter */}
        <View style={styles.counterBadge}>
          <Ionicons name="flash" size={13} color={DEFAULT_CONFIG.META_ACCENT_COLOR} />
          <Text style={styles.counterText}>
            {leadCount} {leadCount === 1 ? 'Lead' : 'Leads'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: DEFAULT_CONFIG.META_ACCENT_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: DEFAULT_CONFIG.META_ACCENT_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
    color: DEFAULT_CONFIG.TEXT_SECONDARY,
    fontWeight: '400',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  counterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    gap: 5,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '600',
    color: DEFAULT_CONFIG.TEXT_PRIMARY,
  },
});
