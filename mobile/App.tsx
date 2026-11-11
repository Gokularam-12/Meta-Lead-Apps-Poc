import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  StatusBar,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSocket } from './src/hooks/useSocket';
import { Header } from './src/components/Header';
import { LeadCard } from './src/components/LeadCard';
import { EmptyState } from './src/components/EmptyState';
import { SettingsModal } from './src/components/SettingsModal';
import { DEFAULT_CONFIG } from './src/constants/config';
import { Lead } from './src/types/lead';

function MainScreen() {
  const insets = useSafeAreaInsets();
  const {
    serverUrl,
    setServerUrl,
    status,
    leads,
    latestLeadId,
    triggerTestLead,
    clearLeads,
  } = useSocket();

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleTriggerSimulatedLead = async () => {
    try {
      setIsSimulating(true);
      await triggerTestLead();
    } catch (err: any) {
      Alert.alert(
        'Trigger Failed',
        `Could not reach backend at ${serverUrl}. Ensure the Node.js server is running and reachable.`
      );
    } finally {
      setIsSimulating(false);
    }
  };

  const renderLeadItem = ({ item }: { item: Lead }) => (
    <LeadCard lead={item} isLatest={item.id === latestLeadId} />
  );

  return (
    <View style={styles.container}>
      {/* Light style translucent status bar for notches and edge-to-edge screens */}
      <ExpoStatusBar style="light" translucent backgroundColor="transparent" />
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Top App Header with dynamic Safe Area top padding */}
      <Header
        status={status}
        leadCount={leads.length}
        onOpenSettings={() => setSettingsVisible(true)}
        onClearLeads={clearLeads}
      />

      {/* Real-Time Leads List or Empty State */}
      {leads.length === 0 ? (
        <EmptyState
          onTriggerTestLead={handleTriggerSimulatedLead}
          isConnecting={status === 'connecting'}
        />
      ) : (
        <FlatList
          data={leads}
          keyExtractor={(item) => item.id || item.leadgen_id}
          renderItem={renderLeadItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max(insets.bottom + 24, 80) },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Quick Action Button with dynamic bottom inset positioning */}
      {leads.length > 0 && (
        <View
          style={[
            styles.fabContainer,
            { bottom: Math.max(insets.bottom + 16, 20) },
          ]}
        >
          <TouchableOpacity
            style={styles.fab}
            activeOpacity={0.85}
            onPress={handleTriggerSimulatedLead}
            disabled={isSimulating}
          >
            <Ionicons name="flash" size={18} color="#FFFFFF" />
            <Text style={styles.fabText}>
              {isSimulating ? 'Sending...' : 'Test Lead'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Server Configuration Modal */}
      <SettingsModal
        visible={settingsVisible}
        currentUrl={serverUrl}
        onClose={() => setSettingsVisible(false)}
        onSaveUrl={(newUrl) => setServerUrl(newUrl)}
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainScreen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DEFAULT_CONFIG.BG_COLOR,
  },
  listContent: {
    padding: 16,
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DEFAULT_CONFIG.META_ACCENT_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 25,
    gap: 8,
    shadowColor: DEFAULT_CONFIG.META_ACCENT_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
