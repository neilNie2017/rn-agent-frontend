import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AgentManagement'>;

type Agent = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
};

const defaultAgents: Agent[] = [
  {
    id: '1',
    name: '通用助手',
    description: '适合日常问答与任务协助',
    enabled: true,
  },
  {
    id: '2',
    name: '代码专家',
    description: '擅长编程问题与代码审查',
    enabled: true,
  },
  {
    id: '3',
    name: '写作助手',
    description: '帮助撰写文章、润色文案',
    enabled: false,
  },
  {
    id: '4',
    name: '翻译官',
    description: '多语言实时翻译',
    enabled: false,
  },
];

export function AgentManagementScreen({ navigation }: Props) {
  const [agents, setAgents] = useState<Agent[]>(defaultAgents);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const insets = useSafeAreaInsets();

  function toggleAgent(id: string) {
    setAgents(prev =>
      prev.map(a => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
    );
  }

  function handleAddAgent() {
    if (!newAgentName.trim()) return;
    const newAgent: Agent = {
      id: Date.now().toString(),
      name: newAgentName.trim(),
      description: '自定义智能体',
      enabled: true,
    };
    setAgents(prev => [...prev, newAgent]);
    setNewAgentName('');
    setShowAddModal(false);
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>{'‹'}</Text>
        </Pressable>
        <Text style={styles.title}>智能体管理</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {agents.map(agent => (
          <View key={agent.id} style={styles.card}>
            <View style={styles.cardBody}>
              <Text style={styles.agentName}>{agent.name}</Text>
              <Text style={styles.agentDesc}>{agent.description}</Text>
            </View>
            <Pressable
              onPress={() => toggleAgent(agent.id)}
              style={[styles.toggle, agent.enabled && styles.toggleOn]}>
              <View
                style={[
                  styles.toggleThumb,
                  agent.enabled && styles.toggleThumbOn,
                ]}
              />
            </Pressable>
          </View>
        ))}

        <Pressable
          onPress={() => setShowAddModal(true)}
          style={({ pressed }) => [
            styles.addCard,
            pressed ? styles.addCardPressed : null,
          ]}>
          <Text style={styles.addIcon}>+</Text>
          <Text style={styles.addText}>新建智能体</Text>
        </Pressable>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent
        visible={showAddModal}
        onRequestClose={() => setShowAddModal(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAddModal(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Pressable style={styles.modalCard}>
              <Text style={styles.modalTitle}>新建智能体</Text>
              <TextInput
                autoFocus
                onChangeText={setNewAgentName}
                placeholder="输入智能体名称"
                placeholderTextColor="#94a3b8"
                style={styles.modalInput}
                value={newAgentName}
              />
              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => setShowAddModal(false)}
                  style={styles.modalBtn}>
                  <Text style={styles.modalBtnText}>取消</Text>
                </Pressable>
                <Pressable
                  onPress={handleAddAgent}
                  style={[styles.modalBtn, styles.modalBtnPrimary]}>
                  <Text style={[styles.modalBtnText, styles.modalBtnPrimaryText]}>
                    创建
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomColor: '#e2e8f0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: 52,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backBtn: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  backText: {
    color: '#2563eb',
    fontSize: 30,
    fontWeight: '600',
    lineHeight: 32,
  },
  title: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '700',
  },
  list: {
    gap: 12,
    padding: 16,
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 16,
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  agentName: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  agentDesc: {
    color: '#64748b',
    fontSize: 13,
  },
  toggle: {
    backgroundColor: '#cbd5e1',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: 2,
    width: 52,
  },
  toggleOn: {
    backgroundColor: '#2563eb',
  },
  toggleThumb: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    height: 28,
    width: 28,
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
  addCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#2563eb',
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  addCardPressed: {
    backgroundColor: '#eff6ff',
  },
  addIcon: {
    color: '#2563eb',
    fontSize: 22,
    fontWeight: '600',
  },
  addText: {
    color: '#2563eb',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
  },
  modalTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderColor: '#d8e0ec',
    borderRadius: 8,
    borderWidth: 1,
    color: '#111827',
    fontSize: 15,
    height: 44,
    paddingHorizontal: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalBtnPrimary: {
    backgroundColor: '#2563eb',
  },
  modalBtnText: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '600',
  },
  modalBtnPrimaryText: {
    color: '#ffffff',
  },
});
