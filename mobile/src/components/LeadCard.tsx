import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Lead } from '../types/lead';
import { DEFAULT_CONFIG } from '../constants/config';

interface LeadCardProps {
  lead: Lead;
  isLatest: boolean;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, isLatest }) => {
  const highlightAnim = useRef(new Animated.Value(isLatest ? 1 : 0)).current;

  useEffect(() => {
    if (isLatest) {
      highlightAnim.setValue(1);
      Animated.timing(highlightAnim, {
        toValue: 0,
        duration: 3500,
        useNativeDriver: false,
      }).start();
    }
  }, [isLatest, highlightAnim]);

  
  const getInitials = (name: string) => {
    if (!name) return 'ML';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleCopy = async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    
  };

  const handleCall = () => {
    if (lead.phoneNumber && lead.phoneNumber !== 'N/A') {
      Linking.openURL(`tel:${lead.phoneNumber}`);
    }
  };

  const handleEmail = () => {
    if (lead.email && lead.email !== 'N/A') {
      Linking.openURL(`mailto:${lead.email}`);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const borderColor = highlightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#1E293B', DEFAULT_CONFIG.META_ACCENT_COLOR],
  });

  const backgroundColor = highlightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#141D2F', '#172554'],
  });

  return (
    <Animated.View style={[styles.card, { borderColor, backgroundColor }]}>
      {/* Header Row */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(lead.fullName)}</Text>
          </View>
          <View style={styles.nameContainer}>
            <View style={styles.nameBadgeRow}>
              <Text style={styles.fullName}>{lead.fullName || 'Meta Lead'}</Text>
              {isLatest && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>JUST ARRIVED</Text>
                </View>
              )}
            </View>
            <Text style={styles.timestamp}>
              <Ionicons name="time-outline" size={12} color={DEFAULT_CONFIG.TEXT_SECONDARY} />{' '}
              {formatTime(lead.createdTime)}
            </Text>
          </View>
        </View>

        <View style={styles.sourceTag}>
          <Text style={styles.sourceText}>
            {lead.source === 'meta_live' ? '⚡ LIVE' : '🧪 TEST'}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Contact Details */}
      <View style={styles.detailsContainer}>
        {/* Email Row */}
        <View style={styles.detailRow}>
          <Ionicons name="mail-outline" size={16} color={DEFAULT_CONFIG.META_ACCENT_COLOR} />
          <Text style={styles.detailValue} numberOfLines={1}>
            {lead.email || 'No email provided'}
          </Text>
          {lead.email && lead.email !== 'N/A' && (
            <TouchableOpacity onPress={handleEmail} style={styles.actionBtn}>
              <Ionicons name="send" size={12} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Phone Row */}
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={16} color={DEFAULT_CONFIG.SUCCESS_COLOR} />
          <Text style={styles.detailValue} numberOfLines={1}>
            {lead.phoneNumber || 'No phone provided'}
          </Text>
          {lead.phoneNumber && lead.phoneNumber !== 'N/A' && (
            <TouchableOpacity onPress={handleCall} style={[styles.actionBtn, styles.callBtn]}>
              <Ionicons name="call" size={12} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Meta MetaData Footer */}
      <View style={styles.footer}>
        <View style={styles.metaIdPill}>
          <Text style={styles.metaIdLabel}>Lead ID:</Text>
          <Text style={styles.metaIdValue} numberOfLines={1}>
            {lead.leadgen_id || lead.id}
          </Text>
        </View>
        <View style={styles.metaIdPill}>
          <Text style={styles.metaIdLabel}>Form:</Text>
          <Text style={styles.metaIdValue} numberOfLines={1}>
            {lead.form_id}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: DEFAULT_CONFIG.META_ACCENT_COLOR,
  },
  avatarText: {
    color: '#93C5FD',
    fontSize: 15,
    fontWeight: '700',
  },
  nameContainer: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  fullName: {
    fontSize: 15,
    fontWeight: '700',
    color: DEFAULT_CONFIG.TEXT_PRIMARY,
  },
  newBadge: {
    backgroundColor: DEFAULT_CONFIG.META_ACCENT_COLOR,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timestamp: {
    fontSize: 11,
    color: DEFAULT_CONFIG.TEXT_SECONDARY,
    marginTop: 2,
  },
  sourceTag: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sourceText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  divider: {
    height: 1,
    backgroundColor: '#1E293B',
    marginVertical: 10,
  },
  detailsContainer: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailValue: {
    flex: 1,
    fontSize: 13,
    color: DEFAULT_CONFIG.TEXT_PRIMARY,
    fontWeight: '500',
  },
  actionBtn: {
    backgroundColor: DEFAULT_CONFIG.META_ACCENT_COLOR,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  callBtn: {
    backgroundColor: DEFAULT_CONFIG.SUCCESS_COLOR,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(30, 41, 59, 0.6)',
  },
  metaIdPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
    flex: 1,
  },
  metaIdLabel: {
    fontSize: 10,
    color: DEFAULT_CONFIG.TEXT_SECONDARY,
    fontWeight: '500',
  },
  metaIdValue: {
    fontSize: 10,
    color: DEFAULT_CONFIG.TEXT_PRIMARY,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    flex: 1,
  },
});
