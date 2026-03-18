import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, ActivityIndicator,
} from 'react-native';
import { analyzeTranscriptAPI } from '../services/api';
import testCall from '../data/testCall.json';

const RISK_CONFIG = {
  Low:    { color: '#4CAF50', bg: '#E8F5E9', emoji: '✅' },
  Medium: { color: '#FF9800', bg: '#FFF3E0', emoji: '⚠️' },
  High:   { color: '#F44336', bg: '#FFEBEE', emoji: '🚨' },
};

export default function AnalyzeScreen() {
  const [transcript, setTranscript] = useState('');
  const [callerNumber, setCallerNumber] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

function loadDemo() {
  setTranscript('你好，我是国家警察局的侦探，你的银行账户涉及洗钱活动，必须立刻将资金转到我们指定的安全账户，否则我们会逮捕你。这件事必须保密，不要告诉任何人。');
  setCallerNumber('+60 12-XXX-9988');
}

function loadTestCall() {
  setTranscript(testCall.transcription.full_text);
  setCallerNumber(testCall.caller.phone_number);
}

  const risk = result ? RISK_CONFIG[result.risk_level] || RISK_CONFIG['Low'] : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>🔍 Analyze Call</Text>
        <Text style={styles.subtitle}>Paste call transcript for AI analysis</Text>
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

      <TouchableOpacity style={styles.demoBtn} onPress={loadDemo}>
        <Text style={styles.demoBtnText}>📋 Load Demo Transcript</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.testBtn} onPress={loadTestCall}>
        <Text style={styles.testBtnText}>🧪 Load Test Call</Text>
      </TouchableOpacity>

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

          <View style={styles.privacyBox}>
            <Text style={styles.privacyText}>🔒 Transcript not stored. Only analysis results saved.</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#1A237E' },
  subtitle: { fontSize: 14, color: '#5C6BC0', marginTop: 4 },
  inputBox: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 14, color: '#333', borderWidth: 1, borderColor: '#DDD' },
  textArea: { backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 14, color: '#333', borderWidth: 1, borderColor: '#DDD', minHeight: 120 },
  demoBtn: { backgroundColor: '#E8EAF6', borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 12 },
  demoBtnText: { color: '#3F51B5', fontSize: 14, fontWeight: '600' },
  testBtn: { backgroundColor: '#FFF3E0', borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 12 },
  testBtnText: { color: '#FF9800', fontSize: 14, fontWeight: '600' },
  analyzeBtn: { backgroundColor: '#3F51B5', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16 },
  disabled: { opacity: 0.5 },
  analyzeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
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
  privacyBox: { backgroundColor: '#E8EAF6', borderRadius: 10, padding: 12 },
  privacyText: { fontSize: 12, color: '#5C6BC0', textAlign: 'center' },
});