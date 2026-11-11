import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DEFAULT_CONFIG } from '../constants/config';

interface EmptyStateProps {
  onTriggerTestLead: () => void;
  isConnecting: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onTriggerTestLead,
  isConnecting,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Animated.View
          style={[
            styles.radarRing,
            {
              transform: [{ scale: pulseAnim }],
              opacity: pulseAnim.interpolate({
                inputRange: [1, 1.15],
                outputRange: [0.6, 0.15],
              }),
            },
          ]}
        />
        <View style={styles.iconCircle}>
          <Ionicons
            name={isConnecting ? 'radio-outline' : 'radio'}
            size={34}
            color={DEFAULT_CONFIG.META_ACCENT_COLOR}
          />
        </View>
      </View>

      <Text style={styles.title}>Waiting for Meta Leads</Text>
      <Text style={styles.subtitle}>
        When a user fills out a Lead Ad on Facebook or Instagram, or when you submit via Meta's
        Testing Tool, leads appear here instantly in real time.
      </Text>

      <View style={styles.actionCard}>
        <Text style={styles.actionCardTitle}>Quick PoC Verification</Text>
        <Text style={styles.actionCardDesc}>
          Simulate an instantaneous lead payload over WebSockets to test the UI pipeline:
        </Text>
        <TouchableOpacity
          onPress={onTriggerTestLead}
          activeOpacity={0.85}
          style={styles.testButton}
        >
          <Ionicons name="flash-outline" size={16} color="#FFFFFF" />
          <Text style={styles.testButtonText}>Trigger Sample Lead</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  radarRing: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: DEFAULT_CONFIG.META_ACCENT_COLOR,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 129, 251, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 129, 251, 0.3)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: DEFAULT_CONFIG.TEXT_PRIMARY,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: DEFAULT_CONFIG.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  actionCard: {
    backgroundColor: '#141D2F',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  actionCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: DEFAULT_CONFIG.TEXT_PRIMARY,
    marginBottom: 4,
  },
  actionCardDesc: {
    fontSize: 11,
    color: DEFAULT_CONFIG.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 16,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DEFAULT_CONFIG.META_ACCENT_COLOR,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
