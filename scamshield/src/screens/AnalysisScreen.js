import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Modal,
  Animated, Easing,
} from 'react-native';
import { analyzeTranscriptAPI } from '../services/api';
import { RISK_CONFIG } from '../engines/patternEngine';
import patterns from '../data/patterns.json';
import DEMO_SCENARIOS from '../data/demo_scenarios.json';

const RISK_CONFIG_LOCAL = {
  Low:    { color: '#6FAF4F', bg: '#F0F7EB', emoji: '✅' },
  Medium: { color: '#D4870A', bg: '#FDF3E3', emoji: '⚠️' },
  High:   { color: '#C44A3A', bg: '#FAEDEB', emoji: '🚨' },
};

// ─── Animated Score Counter ───────────────────────────────────────────────────
function AnimatedScore({ score, color }) {
  const animVal = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    animVal.setValue(0);
    Animated.timing(animVal, {
      toValue: score,
      duration: 1400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    const id = animVal.addListener(({ value }) => setDisplay(Math.round(value)));
    return () => animVal.removeListener(id);
  }, [score]);

  return <Text style={[styles.riskScore, { color }]}>{display} / 100</Text>;
}

// ─── Animated Progress Bar ────────────────────────────────────────────────────
function ScoreBar({ score, color, bg }) {
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    barAnim.setValue(0);
    Animated.timing(barAnim, {
      toValue: score / 100,
      duration: 1200,
      delay: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [score]);

  const barWidth = barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={[styles.arcTrack, { backgroundColor: `${color}30` }]}>
      <Animated.View style={[styles.arcFill, { width: barWidth, backgroundColor: color }]} />
    </View>
  );
}

// ─── Staggered Fade+Slide Card ────────────────────────────────────────────────
function AnimatedCard({ children, delay = 0, style }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 480, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 480, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }, style]}>
      {children}
    </Animated.View>
  );
}

// ─── Scanning Loader ──────────────────────────────────────────────────────────
function ScanningLoader() {
  const scanAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();

    // Dot loading animation
    const dotAnim = (dot, delay) => Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        Animated.delay(600),
      ])
    ).start();
    dotAnim(dot1, 0);
    dotAnim(dot2, 200);
    dotAnim(dot3, 400);
  }, []);

  const translateY = scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 56] });

  return (
    <Animated.View style={[styles.scannerBox, { transform: [{ scale: pulseAnim }] }]}>
      <View style={styles.scanWindow}>
        <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
        <View style={styles.scanCornerTL} />
        <View style={styles.scanCornerTR} />
        <View style={styles.scanCornerBL} />
        <View style={styles.scanCornerBR} />
      </View>
      <Text style={styles.scanText}>Analyzing transcript</Text>
      <View style={styles.dotsRow}>
        <Animated.View style={[styles.dot, { opacity: dot1 }]} />
        <Animated.View style={[styles.dot, { opacity: dot2 }]} />
        <Animated.View style={[styles.dot, { opacity: dot3 }]} />
      </View>
      <Text style={styles.scanSubText}>AI is detecting scam patterns</Text>
    </Animated.View>
  );
}

// ─── Pulse Analyze Button ─────────────────────────────────────────────────────
function PulseButton({ onPress, disabled, loading, hasTranscript }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (hasTranscript && !loading) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1100, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0, duration: 1100, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      glowAnim.setValue(0);
    }
  }, [hasTranscript, loading]);

  function onPressIn() {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true, speed: 40 }).start();
  }
  function onPressOut() {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 40 }).start();
  }

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.18] });

  return (
    <Animated.View style={[{ flex: 2, transform: [{ scale: scaleAnim }] }]}>
      <Animated.View style={[styles.btnGlow, { opacity: glowOpacity }]} />
      <TouchableOpacity
        style={[styles.analyzeBtn, disabled && styles.disabled]}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled}
        activeOpacity={1}
      >
        {loading ? (
          <View style={styles.loadingRow}>
            <Text style={styles.analyzeBtnText}>Analyzing</Text>
          </View>
        ) : (
          <Text style={styles.analyzeBtnText}>🧠  Analyze with AI</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Animated Tag Chip ────────────────────────────────────────────────────────
function AnimatedTag({ text, delay }) {
  const anim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(anim, { toValue: 1, duration: 380, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, delay, useNativeDriver: true, tension: 120, friction: 8 }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.tag, { opacity: anim, transform: [{ scale: scaleAnim }] }]}>
      <Text style={styles.tagText}>{text}</Text>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AnalysisScreen({ navigation }) {
  const [callerNumber, setCallerNumber] = useState('');
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showScenarios, setShowScenarios] = useState(false);

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const resultAnim = useRef(new Animated.Value(0)).current;
  const resultScale = useRef(new Animated.Value(0.94)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(headerSlide, { toValue: 0, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (result) {
      resultAnim.setValue(0);
      resultScale.setValue(0.94);
      Animated.parallel([
        Animated.timing(resultAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(resultScale, { toValue: 1, tension: 65, friction: 10, useNativeDriver: true }),
      ]).start();
    }
  }, [result]);

  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 7, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -7, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
      ]).start();
    }
  }, [error]);

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
        <View style={styles.shieldBadge}>
          <Text style={styles.shieldIcon}>🛡️</Text>
        </View>
        <Text style={styles.title}>ScamShield</Text>
        <Text style={styles.tagline}>AI-powered call fraud detection</Text>
      </Animated.View>

      {/* Inputs */}
      <AnimatedCard delay={120} style={styles.bentoCard}>
        <Text style={styles.label}>Caller Number</Text>
        <TextInput
          style={styles.input}
          placeholder="+60 12-XXX-XXXX  (optional)"
          value={callerNumber}
          onChangeText={setCallerNumber}
          placeholderTextColor="#9BA3AF"
        />
      </AnimatedCard>

      <AnimatedCard delay={220} style={styles.bentoCard}>
        <Text style={styles.label}>Call Transcript</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Paste call transcript here..."
          value={transcript}
          onChangeText={setTranscript}
          multiline
          numberOfLines={6}
          placeholderTextColor="#9BA3AF"
          textAlignVertical="top"
        />
        <TouchableOpacity style={styles.sampleBtn} onPress={() => setShowScenarios(true)} activeOpacity={0.7}>
          <Text style={styles.sampleBtnText}>📋  Load Sample Transcript</Text>
        </TouchableOpacity>
      </AnimatedCard>

      {/* Buttons */}
      <AnimatedCard delay={320} style={styles.buttonRow}>
        <PulseButton
          onPress={handleAnalyze}
          disabled={!transcript.trim() || loading}
          loading={loading}
          hasTranscript={!!transcript.trim()}
        />
        <TouchableOpacity style={styles.clearBtn} onPress={clearAll} activeOpacity={0.7}>
          <Text style={styles.clearBtnText}>Clear</Text>
        </TouchableOpacity>
      </AnimatedCard>

      {/* Scanner */}
      {loading && <ScanningLoader />}

      {/* Error */}
      {error && (
        <Animated.View style={[styles.errorBox, { transform: [{ translateX: shakeAnim }] }]}>
          <Text style={styles.errorText}>❌  {error}</Text>
        </Animated.View>
      )}

      {/* Results */}
      {result && (
        <Animated.View style={[{ opacity: resultAnim, transform: [{ scale: resultScale }] }]}>
          <View style={styles.resultContainer}>

            {/* Risk Hero */}
            <AnimatedCard delay={0} style={[styles.riskBadge, { backgroundColor: risk.bg }]}>
              <Text style={styles.riskEmoji}>{risk.emoji}</Text>
              <Text style={[styles.riskLevel, { color: risk.color }]}>{result.risk_level} Risk</Text>
              <AnimatedScore score={result.score} color={risk.color} />
              <ScoreBar score={result.score} color={risk.color} bg={risk.bg} />
            </AnimatedCard>

            {/* Patterns */}
            <AnimatedCard delay={120} style={styles.bentoCard}>
              <Text style={styles.sectionTitle}>⚡  Patterns Detected</Text>
              {result.patterns_detected?.length > 0 ? (
                <View style={styles.tagWrap}>
                  {result.patterns_detected.map((p, i) => (
                    <AnimatedTag key={i} text={p} delay={i * 70} />
                  ))}
                </View>
              ) : (
                <Text style={styles.mutedText}>No scam patterns detected</Text>
              )}
            </AnimatedCard>

            {/* Reasons */}
            <AnimatedCard delay={220} style={styles.bentoCard}>
              <Text style={styles.sectionTitle}>📝  Analysis Reasons</Text>
              {result.reasons?.map((r, i) => (
                <AnimatedCard key={i} delay={220 + i * 70}>
                  <View style={styles.reasonRow}>
                    <View style={styles.reasonDot} />
                    <Text style={styles.reasonText}>{r}</Text>
                  </View>
                </AnimatedCard>
              ))}
            </AnimatedCard>

            {/* Recommendation */}
            <AnimatedCard delay={320} style={[styles.bentoCard, { backgroundColor: '#F0F7EB' }]}>
              <Text style={styles.sectionTitle}>💡  Recommendation</Text>
              <Text style={styles.bodyText}>{result.recommendation}</Text>
            </AnimatedCard>

            {/* High Risk Actions */}
            {result.risk_level === 'High' && (
              <AnimatedCard delay={400} style={[styles.bentoCard, { backgroundColor: '#FAEDEB' }]}>
                <Text style={[styles.sectionTitle, { color: '#C44A3A' }]}>🚨  Immediate Actions</Text>
                {['Hang up immediately', 'Call NSRC Hotline: 997', 'Block this number', 'Report at polis.com.my'].map((action, i) => (
                  <AnimatedCard key={i} delay={400 + i * 70}>
                    <View style={styles.actionRow}>
                      <Text style={styles.actionNum}>{i + 1}</Text>
                      <Text style={styles.actionText}>{action}</Text>
                    </View>
                  </AnimatedCard>
                ))}
              </AnimatedCard>
            )}

            {/* History */}
            <AnimatedCard delay={480}>
              <TouchableOpacity style={styles.historyBtn} onPress={() => navigation.navigate('HistoryTab')} activeOpacity={0.8}>
                <Text style={styles.historyBtnText}>📋  View Analysis History</Text>
              </TouchableOpacity>
            </AnimatedCard>

            {/* Privacy */}
            <AnimatedCard delay={520}>
              <View style={styles.privacyBox}>
                <Text style={styles.privacyText}>🔒  Transcript not stored. Only analysis results saved.</Text>
              </View>
            </AnimatedCard>

          </View>
        </Animated.View>
      )}

      {/* Modal */}
      <Modal visible={showScenarios} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Sample Transcript</Text>
            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              {DEMO_SCENARIOS.map((s, i) => (
                <TouchableOpacity key={i} style={styles.scenarioOption} onPress={() => loadScenario(s)} activeOpacity={0.7}>
                  <Text style={styles.scenarioTitle}>{s.title}</Text>
                  <View style={[styles.riskPill, { backgroundColor: RISK_CONFIG_LOCAL[s.risk].bg }]}>
                    <Text style={[styles.riskPillText, { color: RISK_CONFIG_LOCAL[s.risk].color }]}>{s.risk} Risk</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowScenarios(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAEFF1' },
  content: { padding: 20, paddingBottom: 56 },

  header: { alignItems: 'center', marginBottom: 28, paddingTop: 8 },
  shieldBadge: {
    width: 68, height: 68, borderRadius: 22,
    backgroundColor: '#212529',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#212529',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 10,
  },
  shieldIcon: { fontSize: 32 },
  title: { fontSize: 32, fontWeight: '800', color: '#212529', letterSpacing: -1 },
  tagline: { fontSize: 14, color: '#6C757D', marginTop: 4, fontWeight: '500' },

  bentoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#212529',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 40,
    elevation: 2,
  },

  label: { fontSize: 12, fontWeight: '700', color: '#9BA3AF', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  input: { backgroundColor: '#F1F4F6', borderRadius: 14, padding: 14, fontSize: 15, color: '#212529' },
  textArea: { backgroundColor: '#F1F4F6', borderRadius: 14, padding: 14, fontSize: 15, color: '#212529', minHeight: 130, marginBottom: 12 },
  sampleBtn: { backgroundColor: '#EAEFF1', borderRadius: 14, padding: 13, alignItems: 'center' },
  sampleBtnText: { color: '#212529', fontSize: 14, fontWeight: '600' },

  buttonRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  btnGlow: {
    position: 'absolute', top: -8, left: -8, right: -8, bottom: -8,
    backgroundColor: '#212529',
    borderRadius: 30,
  },
  analyzeBtn: {
    backgroundColor: '#212529',
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#212529',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 6,
  },
  clearBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#212529',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 1,
  },
  disabled: { opacity: 0.38 },
  analyzeBtnText: { color: '#F5F6F7', fontSize: 16, fontWeight: '700' },
  clearBtnText: { color: '#212529', fontSize: 16, fontWeight: '600' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  // Scanner
  scannerBox: {
    backgroundColor: '#212529',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#212529',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 30,
    elevation: 10,
  },
  scanWindow: { width: 72, height: 72, marginBottom: 20, position: 'relative', overflow: 'hidden' },
  scanLine: {
    position: 'absolute', left: 0, right: 0, height: 2,
    backgroundColor: '#6FAF4F',
    shadowColor: '#6FAF4F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  scanCornerTL: { position: 'absolute', top: 0, left: 0, width: 14, height: 14, borderTopWidth: 2, borderLeftWidth: 2, borderColor: '#F5F6F7', borderTopLeftRadius: 3 },
  scanCornerTR: { position: 'absolute', top: 0, right: 0, width: 14, height: 14, borderTopWidth: 2, borderRightWidth: 2, borderColor: '#F5F6F7', borderTopRightRadius: 3 },
  scanCornerBL: { position: 'absolute', bottom: 0, left: 0, width: 14, height: 14, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: '#F5F6F7', borderBottomLeftRadius: 3 },
  scanCornerBR: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderBottomWidth: 2, borderRightWidth: 2, borderColor: '#F5F6F7', borderBottomRightRadius: 3 },
  scanText: { color: '#F5F6F7', fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  dotsRow: { flexDirection: 'row', gap: 6, marginTop: 8, marginBottom: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#6FAF4F' },
  scanSubText: { color: '#6C757D', fontSize: 13, fontWeight: '500' },

  errorBox: { backgroundColor: '#FAEDEB', borderRadius: 16, padding: 14, marginBottom: 16 },
  errorText: { color: '#C44A3A', fontSize: 14, fontWeight: '500' },

  resultContainer: { gap: 16 },

  riskBadge: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#212529',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 40,
    elevation: 2,
  },
  riskEmoji: { fontSize: 52 },
  riskLevel: { fontSize: 28, fontWeight: '800', marginTop: 10, letterSpacing: -0.5 },
  riskScore: { fontSize: 18, fontWeight: '700', marginTop: 6, opacity: 0.9 },
  arcContainer: { width: '100%', marginTop: 16 },
  arcTrack: { height: 6, borderRadius: 3, overflow: 'hidden', width: '100%', marginTop: 16 },
  arcFill: { height: 6, borderRadius: 3 },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#212529', marginBottom: 14 },
  bodyText: { fontSize: 14, color: '#495057', lineHeight: 22 },
  mutedText: { fontSize: 14, color: '#9BA3AF' },

  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#EAEFF1', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  tagText: { fontSize: 13, fontWeight: '600', color: '#212529' },

  reasonRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  reasonDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#212529', marginTop: 6, marginRight: 10 },
  reasonText: { flex: 1, fontSize: 14, color: '#495057', lineHeight: 21 },

  actionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  actionNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#C44A3A', color: '#fff', fontSize: 13, fontWeight: '800', textAlign: 'center', lineHeight: 26, marginRight: 12 },
  actionText: { fontSize: 14, color: '#212529', fontWeight: '500', flex: 1 },

  historyBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#212529',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 1,
  },
  historyBtnText: { color: '#212529', fontSize: 14, fontWeight: '700' },

  privacyBox: { backgroundColor: '#F1F4F6', borderRadius: 16, padding: 14, alignItems: 'center' },
  privacyText: { fontSize: 12, color: '#6C757D', textAlign: 'center', fontWeight: '500' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(33,37,41,0.6)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#F5F6F7', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#212529', marginBottom: 20, letterSpacing: -0.5 },
  scenarioOption: {
    backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, marginBottom: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  scenarioTitle: { fontSize: 14, fontWeight: '600', color: '#212529', flex: 1, marginRight: 10 },
  riskPill: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  riskPillText: { fontSize: 12, fontWeight: '700' },
  cancelBtn: { marginTop: 8, padding: 16, alignItems: 'center' },
  cancelText: { color: '#6C757D', fontSize: 16, fontWeight: '600' },
});