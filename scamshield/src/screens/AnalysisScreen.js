import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, ActivityIndicator, Modal,
} from 'react-native';
import { analyzeTranscriptAPI } from '../services/api';
import { RISK_CONFIG } from '../engines/patternEngine';
import patterns from '../data/patterns.json';

const DEMO_SCENARIOS = [
  {
    title: 'Mandarin - Police Impersonation',
    risk: 'High',
    transcript: '你好，我是国家警察局的侦探，你的银行账户涉及洗钱活动，必须立刻将资金转到我们指定的安全账户，否则我们会逮捕你。这件事必须保密，不要告诉任何人。',
    callerNumber: '+60 12-XXX-9988',
  },
  {
    title: 'Malay - Polis Palsu',
    risk: 'High',
    transcript: 'Selamat pagi, saya pegawai polis dari Ibu Pejabat Polis Daerah. Akaun bank anda telah terlibat dalam kes pengubahan wang haram. Anda perlu memindahkan wang anda segera ke akaun selamat kami. Jangan beritahu sesiapa tentang perkara ini.',
    callerNumber: '+60 3-XXX-2211',
  },
  {
    title: 'English - Parcel Scam',
    risk: 'Medium',
    transcript: 'Hello, this is customs department. We have intercepted a parcel in your name containing suspicious items. You need to pay a clearance fee immediately to avoid legal action. Please transfer the payment to clear your shipment.',
    callerNumber: '+60 11-XXX-5544',
  },
];

const RISK_CONFIG_LOCAL = {
  Low:    { color: '#4CAF50', bg: '#E8F5E9', emoji: '✅' },
  Medium: { color: '#FF9800', bg: '#FFF3E0', emoji: '⚠️' },
  High:   { color: '#F44336', bg: '#FFEBEE', emoji: '🚨' },
};

export default function AnalysisScreen({ navigation }) {
  const [callerNumber, setCallerNumber] = useState('');
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showScenarios, setShowScenarios] = useState(false);

  async function handleAnalyze() {
    if (!transcript.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await analyzeTranscriptAPI(transcript, callerNumber || null);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function loadScenario(scenario) {
    setTranscript(scenario.transcript);
    setCallerNumber(scenario.callerNumber);
    setShowScenarios(false);
  }

  function clearAll() {
    setTranscript('');
    setCallerNumber('');
    setResult(null);
    setError(null);
  }

  const risk = result ? RISK_CONFIG_LOCAL[result.risk_level] || RISK_CONFIG_LOCAL['Low'] : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>🛡️ ScamShield</Text>
        <Text style={styles.tagline}>Paste call transcript for AI analysis</Text>
      </View>

      <View style={styles.inputBox}>
        <Text style={styles.label}>Caller Number (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="+60 12-XXX-XXXX"
          value={callerNumber}
          onChangeText={setCallerNumber}
          placeholderTextColor="#AAA"
        />
      </View>

      <View style={styles.inputBox}>
        <Text style={styles.label}>Call Transcript</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Paste call transcript here..."
          value={transcript}
          onChangeText={setTranscript}
          multiline
          numberOfLines={6}
          placeholderTextColor="#AAA"
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity style={styles.scenarioBtn} onPress={() => setShowScenarios(true)}>
        <Text style={styles.scenarioBtnText}>📋 Load Sample Transcript</Text>
      </TouchableOpacity>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.analyzeBtn, (!transcript.trim() || loading) && styles.disabled]}
          onPress={handleAnalyze}
          disabled={!transcript.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.analyzeBtnText}>🧠 Analyze with AI</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.clearBtn} onPress={clearAll}>
          <Text style={styles.clearBtnText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>❌ {error}</Text>
        </View>
      )}

      {result && (
        <View style={styles.resultContainer}>
          <View style={[styles.riskBadge, { backgroundColor: risk.bg }]}>
            <Text style={styles.riskEmoji}>{risk.emoji}</Text>
            <Text style={[styles.riskLevel, { color: risk.color }]}>{result.risk_level} Risk</Text>
            <Text style={[styles.riskScore, { color: risk.color }]}>Score: {result.score}/100</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ Patterns Detected</Text>
            {result.patterns_detected?.length > 0 ? (
              result.patterns_detected.map((p, i) => (
                <Text key={i} style={styles.patternItem}>• {p}</Text>
              ))
            ) : (
              <Text style={styles.noPattern}>No scam patterns detected</Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Reasons</Text>
            {result.reasons?.map((r, i) => (
              <Text key={i} style={styles.reasonItem}>• {r}</Text>
            ))}
          </View>

          <View style={styles.recommendationBox}>
            <Text style={styles.sectionTitle}>💡 Recommendation</Text>
            <Text style={styles.recommendationText}>{result.recommendation}</Text>
          </View>

          {result.risk_level === 'High' && (
            <View style={styles.actionBox}>
              <Text style={styles.actionTitle}>🚨 Recommended Actions</Text>
              <Text style={styles.actionItem}>1. Hang up immediately</Text>
              <Text style={styles.actionItem}>2. Call NSRC Hotline: <Text style={styles.hotline}>997</Text></Text>
              <Text style={styles.actionItem}>3. Block this number</Text>
              <Text style={styles.actionItem}>4. Report at polis.com.my</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.historyBtn}
            onPress={() => navigation.navigate('HistoryTab')}
          >
            <Text style={styles.historyBtnText}>📋 View Analysis History</Text>
          </TouchableOpacity>

          <View style={styles.privacyBox}>
            <Text style={styles.privacyText}>🔒 Transcript not stored. Only analysis results saved.</Text>
          </View>
        </View>
      )}

      <Modal visible={showScenarios} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Sample Transcript</Text>
            {DEMO_SCENARIOS.map((s, i) => (
              <TouchableOpacity key={i} style={styles.scenarioOption} onPress={() => loadScenario(s)}>
                <Text style={styles.scenarioOptionTitle}>{s.title}</Text>
                <Text style={[styles.scenarioRisk, { color: RISK_CONFIG_LOCAL[s.risk].color }]}>
                  Expected: {s.risk} Risk
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowScenarios(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  content: { padding: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#1A237E' },
  tagline: { fontSize: 14, color: '#5C6BC0', marginTop: 4 },
  inputBox: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 14, color: '#333', borderWidth: 1, borderColor: '#DDD' },
  textArea: { backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 14, color: '#333', borderWidth: 1, borderColor: '#DDD', minHeight: 120 },
  scenarioBtn: { backgroundColor: '#E8EAF6', borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 16 },
  scenarioBtnText: { color: '#3F51B5', fontSize: 14, fontWeight: '600' },
  buttonRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  analyzeBtn: { flex: 2, backgroundColor: '#3F51B5', borderRadius: 12, padding: 16, alignItems: 'center' },
  clearBtn: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#DDD' },
  disabled: { opacity: 0.5 },
  analyzeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  clearBtnText: { color: '#666', fontSize: 16, fontWeight: '600' },
  errorBox: { backgroundColor: '#FFEBEE', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { color: '#F44336', fontSize: 14 },
  resultContainer: { gap: 16 },
  riskBadge: { borderRadius: 16, padding: 20, alignItems: 'center' },
  riskEmoji: { fontSize: 40 },
  riskLevel: { fontSize: 22, fontWeight: '700', marginTop: 4 },
  riskScore: { fontSize: 16, fontWeight: '600', marginTop: 2 },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A237E', marginBottom: 10 },
  patternItem: { fontSize: 14, color: '#333', marginBottom: 4 },
  noPattern: { fontSize: 14, color: '#888' },
  reasonItem: { fontSize: 14, color: '#333', marginBottom: 4 },
  recommendationBox: { backgroundColor: '#E8F5E9', borderRadius: 12, padding: 16 },
  recommendationText: { fontSize: 14, color: '#333', lineHeight: 22 },
  actionBox: { backgroundColor: '#FFF3E0', borderRadius: 12, padding: 16 },
  actionTitle: { fontSize: 16, fontWeight: '700', color: '#E65100', marginBottom: 8 },
  actionItem: { fontSize: 14, color: '#333', marginBottom: 4 },
  hotline: { fontWeight: '800', color: '#F44336' },
  historyBtn: { backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#3F51B5' },
  historyBtnText: { color: '#3F51B5', fontSize: 14, fontWeight: '600' },
  privacyBox: { backgroundColor: '#E8EAF6', borderRadius: 10, padding: 12 },
  privacyText: { fontSize: 12, color: '#5C6BC0', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, color: '#333' },
  scenarioOption: { backgroundColor: '#F5F5F5', borderRadius: 10, padding: 14, marginBottom: 10 },
  scenarioOptionTitle: { fontSize: 14, fontWeight: '600', color: '#333' },
  scenarioRisk: { fontSize: 12, marginTop: 2, fontWeight: '600' },
  cancelText: { textAlign: 'center', color: '#888', marginTop: 8, fontSize: 16 },
});
