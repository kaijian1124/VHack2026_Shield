import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  Animated, Alert, Modal, FlatList,
} from 'react-native';
import { analyzeTranscript, RISK_CONFIG } from '../engines/patternEngine';
import { DEMO_SCENARIOS, simulateSTT } from '../engines/demoEngine';
import { uploadCallLog } from '../services/supabase';

export default function HomeScreen({ navigation }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [showScenarioPicker, setShowScenarioPicker] = useState(false);
  const [callLog, setCallLog] = useState([]);
  const cancelSTT = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation when listening
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  function startDemoCall(scenario) {
    setShowScenarioPicker(false);
    setIsListening(true);
    setTranscript('');
    setAnalysis(null);

    cancelSTT.current = simulateSTT(
      scenario,
      (partial) => {
        setTranscript(partial);
        // Live analysis every ~500ms worth of text
        if (partial.length % 20 === 0) {
          const result = analyzeTranscript(partial);
          setAnalysis(result);
        }
      },
      (full) => {
        const result = analyzeTranscript(full);
        setAnalysis(result);
        setIsListening(false);

        // Save to local log
        const logEntry = {
          id: Date.now().toString(),
          callerNumber: scenario.callerNumber,
          callStart: new Date(Date.now() - 30000).toISOString(),
          callEnd: new Date().toISOString(),
          ...result,
        };
        setCallLog(prev => [logEntry, ...prev]);

        // Upload metadata only (no transcript)
        uploadCallLog({
          callId: logEntry.id,
          callerNumber: scenario.callerNumber,
          callStart: logEntry.callStart,
          callEnd: logEntry.callEnd,
          overallScore: result.overallScore,
          riskLevel: result.riskLevel,
          triggeredPatterns: result.triggeredPatterns,
        }).catch(() => {}); // silent fail ok for demo
      }
    );
  }

  function stopCall() {
    if (cancelSTT.current) cancelSTT.current();
    setIsListening(false);
  }

  const risk = analysis ? RISK_CONFIG[analysis.riskLevel] : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>🛡️ ScamShield</Text>
        <Text style={styles.tagline}>Protecting You in Real-Time</Text>
      </View>

      {/* Live Risk Badge */}
      {analysis && (
        <Animated.View style={[styles.riskBadge, { backgroundColor: risk.bg, transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.riskEmoji}>{risk.emoji}</Text>
          <Text style={[styles.riskLabel, { color: risk.color }]}>{risk.label}</Text>
          <Text style={[styles.riskScore, { color: risk.color }]}>Score: {analysis.overallScore}/100</Text>
        </Animated.View>
      )}

      {/* Transcript Display */}
      {isListening && (
        <View style={styles.transcriptBox}>
          <Text style={styles.transcriptLabel}>🎙️ Live Transcript (On-Device Only)</Text>
          <Text style={styles.transcriptText}>{transcript || '...'}</Text>
        </View>
      )}

      {/* Triggered Patterns */}
      {analysis && analysis.triggeredPatterns.length > 0 && (
        <View style={styles.patternsBox}>
          <Text style={styles.patternsTitle}>⚡ Detected Patterns</Text>
          {analysis.triggeredPatterns.map(p => (
            <View key={p.patternId} style={styles.patternRow}>
              <Text style={styles.patternName}>{p.patternId}: {p.patternName.replace(/_/g, ' ')}</Text>
              <View style={styles.scoreBar}>
                <View style={[styles.scoreBarFill, { width: `${p.score}%`, backgroundColor: RISK_CONFIG[p.score > 60 ? 'High' : p.score > 30 ? 'Medium' : 'Low'].color }]} />
              </View>
              <Text style={styles.patternScore}>{p.score}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Action Suggestions */}
      {analysis && analysis.riskLevel === 'High' && (
        <View style={styles.actionBox}>
          <Text style={styles.actionTitle}>🚨 Recommended Actions</Text>
          <Text style={styles.actionItem}>1. Hang up immediately</Text>
          <Text style={styles.actionItem}>2. Call NSRC Hotline: <Text style={styles.hotline}>997</Text></Text>
          <Text style={styles.actionItem}>3. Block this number</Text>
          <Text style={styles.actionItem}>4. Report at polis.com.my</Text>
        </View>
      )}

      {/* Buttons */}
      <View style={styles.buttonArea}>
        {!isListening ? (
          <TouchableOpacity style={styles.btnDemo} onPress={() => setShowScenarioPicker(true)}>
            <Text style={styles.btnText}>📞 Start Demo Call</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.btnStop} onPress={stopCall}>
            <Text style={styles.btnText}>⏹ End Call</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.btnLog} onPress={() => navigation.navigate('CallLog', { callLog })}>
          <Text style={styles.btnTextSecondary}>📋 Call Log ({callLog.length})</Text>
        </TouchableOpacity>
      </View>

      {/* Privacy Notice */}
      <View style={styles.privacyBox}>
        <Text style={styles.privacyText}>🔒 Transcript never leaves your device. Only scores & metadata are synced.</Text>
      </View>

      {/* Scenario Picker Modal */}
      <Modal visible={showScenarioPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Choose Demo Scenario</Text>
            {DEMO_SCENARIOS.map(s => (
              <TouchableOpacity key={s.id} style={styles.scenarioBtn} onPress={() => startDemoCall(s)}>
                <Text style={styles.scenarioTitle}>{s.title}</Text>
                <Text style={[styles.scenarioRisk, { color: RISK_CONFIG[s.expectedRisk].color }]}>
                  Expected: {s.expectedRisk}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowScenarioPicker(false)}>
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
  appName: { fontSize: 28, fontWeight: '800', color: '#1A237E' },
  tagline: { fontSize: 14, color: '#5C6BC0', marginTop: 4 },
  riskBadge: { borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 16 },
  riskEmoji: { fontSize: 40 },
  riskLabel: { fontSize: 22, fontWeight: '700', marginTop: 4 },
  riskScore: { fontSize: 16, fontWeight: '600', marginTop: 2 },
  transcriptBox: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#5C6BC0' },
  transcriptLabel: { fontSize: 12, color: '#888', marginBottom: 8 },
  transcriptText: { fontSize: 14, color: '#333', lineHeight: 22 },
  patternsBox: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 },
  patternsTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12, color: '#333' },
  patternRow: { marginBottom: 10 },
  patternName: { fontSize: 13, color: '#555', marginBottom: 4, textTransform: 'capitalize' },
  scoreBar: { height: 8, backgroundColor: '#EEE', borderRadius: 4, overflow: 'hidden' },
  scoreBarFill: { height: 8, borderRadius: 4 },
  patternScore: { fontSize: 12, color: '#888', marginTop: 2, textAlign: 'right' },
  actionBox: { backgroundColor: '#FFF3E0', borderRadius: 12, padding: 16, marginBottom: 16 },
  actionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8, color: '#E65100' },
  actionItem: { fontSize: 14, color: '#333', marginBottom: 4 },
  hotline: { fontWeight: '800', color: '#F44336' },
  buttonArea: { gap: 12, marginBottom: 16 },
  btnDemo: { backgroundColor: '#3F51B5', borderRadius: 12, padding: 16, alignItems: 'center' },
  btnStop: { backgroundColor: '#F44336', borderRadius: 12, padding: 16, alignItems: 'center' },
  btnLog: { backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#DDD' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnTextSecondary: { color: '#333', fontSize: 16, fontWeight: '600' },
  privacyBox: { backgroundColor: '#E8EAF6', borderRadius: 10, padding: 12 },
  privacyText: { fontSize: 12, color: '#5C6BC0', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, color: '#333' },
  scenarioBtn: { backgroundColor: '#F5F5F5', borderRadius: 10, padding: 14, marginBottom: 10 },
  scenarioTitle: { fontSize: 14, fontWeight: '600', color: '#333' },
  scenarioRisk: { fontSize: 12, marginTop: 2, fontWeight: '600' },
  cancelText: { textAlign: 'center', color: '#888', marginTop: 8, fontSize: 16 },
});
