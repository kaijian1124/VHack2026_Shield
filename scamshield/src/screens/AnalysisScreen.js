import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Modal, Animated, Easing,
} from 'react-native';
import { analyzeTranscriptAPI } from '../services/api';
import DEMO_SCENARIOS from '../data/demo_scenarios.json';

const C = {
  bg: '#EEF2EF', surface: '#FFFFFF', dark: '#484F58',
  green: '#006D4B', greenLight: '#E8F5EE', greenAccent: '#4CAF82',
  red: '#D93025', redLight: '#FDECEA',
  amber: '#E8A000', amberLight: '#FFF8E7',
  text: '#1A1F2C', muted: '#6B7280', border: '#E5EAE7',
};

const RISK = {
  Low:    { color: C.green, bg: C.greenLight, label: 'SAFE',      icon: '✓' },
  Medium: { color: C.amber, bg: C.amberLight, label: 'CAUTION',   icon: '⚠' },
  High:   { color: C.red,   bg: C.redLight,   label: 'HIGH RISK', icon: '!' },
};

function RingGauge({ score, size = 160, strokeWidth = 14 }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);
  const color = score >= 70 ? C.green : score >= 40 ? C.amber : C.red;
  const track = score >= 70 ? '#C8E6D4' : score >= 40 ? '#FFE0B2' : '#FFCDD2';
  const label = score >= 70 ? 'EXCELLENT' : score >= 40 ? 'CAUTION' : 'HIGH RISK';
  useEffect(() => {
    const id = anim.addListener(({ value }) => setDisplay(Math.round(value)));
    Animated.timing(anim, { toValue: score, duration: 1600, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    return () => anim.removeListener(id);
  }, [score]);
  const rightRot = anim.interpolate({ inputRange: [0, 50, 100], outputRange: ['-90deg', '90deg', '90deg'] });
  const leftRot = anim.interpolate({ inputRange: [0, 50, 100], outputRange: ['90deg', '90deg', '270deg'] });
  return (
    <View style={{ width: size, height: size }}>
      <View style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: strokeWidth, borderColor: track }} />
      <View style={{ position: 'absolute', right: 0, width: size / 2, height: size, overflow: 'hidden' }}>
        <Animated.View style={{ position: 'absolute', left: -(size / 2), width: size, height: size, borderRadius: size / 2, borderWidth: strokeWidth, borderTopColor: color, borderRightColor: color, borderBottomColor: 'transparent', borderLeftColor: 'transparent', transform: [{ rotate: rightRot }] }} />
      </View>
      <View style={{ position: 'absolute', left: 0, width: size / 2, height: size, overflow: 'hidden' }}>
        <Animated.View style={{ position: 'absolute', right: -(size / 2), width: size, height: size, borderRadius: size / 2, borderWidth: strokeWidth, borderTopColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color, borderLeftColor: color, transform: [{ rotate: leftRot }] }} />
      </View>
      <View style={{ position: 'absolute', width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 44, fontWeight: '800', color: C.text, letterSpacing: -2 }}>{display}</Text>
        <Text style={{ fontSize: 10, fontWeight: '800', color, letterSpacing: 2, marginTop: 2 }}>{label}</Text>
      </View>
    </View>
  );
}

function FadeCard({ children, delay = 0, style }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(28)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 500, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);
  return <Animated.View style={[{ opacity: fade, transform: [{ translateY: slide }] }, style]}>{children}</Animated.View>;
}

function Scanner() {
  const scan = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const d1 = useRef(new Animated.Value(0.3)).current;
  const d2 = useRef(new Animated.Value(0.3)).current;
  const d3 = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(scan, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(scan, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.03, duration: 700, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
    ])).start();
    [[d1, 0], [d2, 200], [d3, 400]].forEach(([dot, delay]) => {
      Animated.loop(Animated.sequence([Animated.delay(delay), Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }), Animated.timing(dot, { toValue: 0.3, duration: 300, useNativeDriver: true }), Animated.delay(600)])).start();
    });
  }, []);
  const ty = scan.interpolate({ inputRange: [0, 1], outputRange: [0, 52] });
  return (
    <Animated.View style={[styles.scanner, { transform: [{ scale: pulse }] }]}>
      <View style={styles.scanWin}>
        <Animated.View style={[styles.scanLine, { transform: [{ translateY: ty }] }]} />
        {[{ top: 0, left: 0 }, { top: 0, right: 0 }, { bottom: 0, left: 0 }, { bottom: 0, right: 0 }].map((pos, i) => (
          <View key={i} style={[styles.corner, pos,
            i === 0 && { borderBottomWidth: 0, borderRightWidth: 0 },
            i === 1 && { borderBottomWidth: 0, borderLeftWidth: 0 },
            i === 2 && { borderTopWidth: 0, borderRightWidth: 0 },
            i === 3 && { borderTopWidth: 0, borderLeftWidth: 0 },
          ]} />
        ))}
      </View>
      <Text style={styles.scanTitle}>Analyzing transcript</Text>
      <View style={styles.dotsRow}>
        {[d1, d2, d3].map((d, i) => <Animated.View key={i} style={[styles.dot, { opacity: d }]} />)}
      </View>
      <Text style={styles.scanSub}>AI detecting scam patterns</Text>
    </Animated.View>
  );
}

function Tag({ text, delay = 0 }) {
  const a = useRef(new Animated.Value(0)).current;
  const sc = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(a, { toValue: 1, duration: 360, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(sc, { toValue: 1, delay, tension: 120, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[styles.tag, { opacity: a, transform: [{ scale: sc }] }]}>
      <Text style={styles.tagTxt}>{text}</Text>
    </Animated.View>
  );
}

function AnalyzeBtn({ onPress, disabled, loading }) {
  const sc = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!disabled && !loading) {
      const loop = Animated.loop(Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ]));
      loop.start();
      return () => loop.stop();
    } else { glow.setValue(0); }
  }, [disabled, loading]);
  const glowOp = glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.18] });
  return (
    <Animated.View style={[{ flex: 2 }, { transform: [{ scale: sc }] }]}>
      <Animated.View style={[styles.btnGlow, { opacity: glowOp }]} />
      <TouchableOpacity
        style={[styles.analyzeBtn, disabled && styles.dimmed]}
        onPress={onPress}
        onPressIn={() => Animated.spring(sc, { toValue: 0.95, useNativeDriver: true, speed: 50 }).start()}
        onPressOut={() => Animated.spring(sc, { toValue: 1, useNativeDriver: true, speed: 50 }).start()}
        disabled={disabled} activeOpacity={1}
      >
        <Text style={styles.analyzeTxt}>{loading ? 'Scanning...' : '🧠  Analyze with AI'}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function AnalysisScreen({ navigation }) {
  const [callerNumber, setCallerNumber] = useState('');
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-24)).current;
  const resultFade = useRef(new Animated.Value(0)).current;
  const resultSc = useRef(new Animated.Value(0.92)).current;
  const shakeX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(headerY, { toValue: 0, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (result) {
      resultFade.setValue(0); resultSc.setValue(0.92);
      Animated.parallel([
        Animated.timing(resultFade, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(resultSc, { toValue: 1, tension: 65, friction: 10, useNativeDriver: true }),
      ]).start();
    }
  }, [result]);

  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeX, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 7, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: -7, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  }, [error]);

  async function handleAnalyze() {
    if (!transcript.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const data = await analyzeTranscriptAPI(transcript, callerNumber || null);
      setResult(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  function clearAll() { setTranscript(''); setCallerNumber(''); setResult(null); setError(null); }

  const risk = result ? RISK[result.risk_level] || RISK.Low : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      <Animated.View style={[styles.headerRow, { opacity: headerFade, transform: [{ translateY: headerY }] }]}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarBadge}><Text style={{ fontSize: 18 }}>🛡️</Text></View>
          <View>
            <Text style={styles.headerEyebrow}>THE LEDGER</Text>
            <Text style={styles.headerTitle}>ScamShield</Text>
          </View>
        </View>
        <View style={styles.shieldBtn}><Text style={{ fontSize: 16 }}>🛡</Text></View>
      </Animated.View>

      <FadeCard delay={100} style={styles.card}>
        <Text style={styles.cardEyebrow}>Your Security Score</Text>
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <RingGauge score={result ? result.score : 100} />
        </View>
        <Text style={styles.secureNote}>
          {result ? `Analysis complete — Risk level: ${result.risk_level}` : 'You are protected against 99% of identified scam patterns.'}
        </Text>
      </FadeCard>

      {result && (
        <FadeCard delay={0} style={[styles.card, styles.darkCard]}>
          <Text style={styles.darkCardLabel}>Last Call Status</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusPill, { backgroundColor: risk.bg }]}>
              <Text style={[styles.statusPillTxt, { color: risk.color }]}>{risk.icon}  {result.risk_level}</Text>
            </View>
            <Text style={styles.darkCardTime}>Verified just now</Text>
          </View>
        </FadeCard>
      )}

      <FadeCard delay={200} style={styles.card}>
        <View style={styles.uploadIconRow}>
          <View style={styles.uploadIconBox}><Text style={{ fontSize: 20 }}>📄</Text></View>
        </View>
        <Text style={styles.uploadTitle}>Upload Transcript</Text>
        <Text style={styles.uploadSub}>Paste a text transcript or upload an audio file to analyze for fraudulent keywords and patterns.</Text>

        <TextInput style={styles.input} placeholder="+60 12-XXX-XXXX  (optional)" value={callerNumber} onChangeText={setCallerNumber} placeholderTextColor={C.muted} />
        <TextInput style={styles.textArea} placeholder="Paste call transcript here..." value={transcript} onChangeText={setTranscript} multiline numberOfLines={5} placeholderTextColor={C.muted} textAlignVertical="top" />

        <TouchableOpacity style={styles.sampleBtn} onPress={() => setShowModal(true)} activeOpacity={0.75}>
          <Text style={styles.sampleTxt}>📋  Load Sample Transcript</Text>
        </TouchableOpacity>

        <View style={styles.btnRow}>
          <AnalyzeBtn onPress={handleAnalyze} disabled={!transcript.trim() || loading} loading={loading} />
          <TouchableOpacity style={styles.clearBtn} onPress={clearAll} activeOpacity={0.75}>
            <Text style={styles.clearTxt}>Clear</Text>
          </TouchableOpacity>
        </View>

        {transcript.trim() && !loading && !result && (
          <TouchableOpacity style={styles.startLink} onPress={handleAnalyze}>
            <Text style={styles.startLinkTxt}>Start Analysis  →</Text>
          </TouchableOpacity>
        )}
      </FadeCard>

      {loading && <Scanner />}

      {error && (
        <Animated.View style={[styles.errorBox, { transform: [{ translateX: shakeX }] }]}>
          <Text style={styles.errorTxt}>❌  {error}</Text>
        </Animated.View>
      )}

      {result && (
        <Animated.View style={{ opacity: resultFade, transform: [{ scale: resultSc }] }}>

          <FadeCard delay={80} style={styles.card}>
            <Text style={styles.sectionTitle}>⚡  Patterns Detected</Text>
            {result.patterns_detected?.length > 0 ? (
              <View style={styles.tagWrap}>
                {result.patterns_detected.map((p, i) => <Tag key={i} text={p} delay={i * 60} />)}
              </View>
            ) : (
              <Text style={styles.mutedTxt}>No scam patterns detected</Text>
            )}
          </FadeCard>

          <FadeCard delay={160} style={styles.card}>
            <Text style={styles.sectionTitle}>📝  Analysis Reasons</Text>
            {result.reasons?.map((r, i) => (
              <FadeCard key={i} delay={160 + i * 60}>
                <View style={styles.reasonRow}>
                  <View style={styles.reasonDot} />
                  <Text style={styles.reasonTxt}>{r}</Text>
                </View>
              </FadeCard>
            ))}
          </FadeCard>

          <FadeCard delay={240} style={[styles.card, { backgroundColor: C.greenLight }]}>
            <Text style={styles.sectionTitle}>💡  Recommendation</Text>
            <Text style={styles.bodyTxt}>{result.recommendation}</Text>
          </FadeCard>

          {result.risk_level === 'High' && (
            <FadeCard delay={300} style={[styles.card, { backgroundColor: C.redLight }]}>
              <Text style={[styles.sectionTitle, { color: C.red }]}>🚨  Immediate Actions</Text>
              {['Hang up immediately', 'Call NSRC Hotline: 997', 'Block this number', 'Report at polis.com.my'].map((a, i) => (
                <FadeCard key={i} delay={300 + i * 60}>
                  <View style={styles.actionRow}>
                    <Text style={styles.actionNum}>{i + 1}</Text>
                    <Text style={styles.actionTxt}>{a}</Text>
                  </View>
                </FadeCard>
              ))}
            </FadeCard>
          )}

          <FadeCard delay={380} style={styles.tipCard}>
            <Text style={styles.tipLabel}>PRO GUARDIAN TIP</Text>
            <Text style={styles.tipTxt}>
              {result.risk_level === 'High'
                ? 'Never transfer money to anyone claiming to secure your account. Legitimate authorities never ask for this.'
                : 'Never share your OTP with anyone claiming to be from the bank.'}
            </Text>
            <View style={styles.tipLine} />
          </FadeCard>

          <FadeCard delay={420}>
            <TouchableOpacity style={styles.historyBtn} onPress={() => navigation.navigate('History')} activeOpacity={0.8}>
              <Text style={styles.historyTxt}>View Analysis History  →</Text>
            </TouchableOpacity>
          </FadeCard>

          <FadeCard delay={460}>
            <View style={styles.privacyBox}>
              <Text style={styles.privacyTxt}>🔒  Transcript not stored. Only analysis results saved.</Text>
            </View>
          </FadeCard>

        </Animated.View>
      )}

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Sample Transcript</Text>
            <ScrollView style={{ maxHeight: 440 }} showsVerticalScrollIndicator={false}>
              {DEMO_SCENARIOS.map((sc2, i) => (
                <TouchableOpacity key={i} style={styles.scenarioItem}
                  onPress={() => { setTranscript(sc2.transcript); setCallerNumber(sc2.callerNumber); setShowModal(false); }}
                  activeOpacity={0.7}>
                  <Text style={styles.scenarioTitle}>{sc2.title}</Text>
                  <View style={[styles.riskPill, { backgroundColor: RISK[sc2.risk].bg }]}>
                    <Text style={[styles.riskPillTxt, { color: RISK[sc2.risk].color }]}>{sc2.risk}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
              <Text style={styles.cancelTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 60 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, paddingTop: 8 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarBadge: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', shadowColor: C.text, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  headerEyebrow: { fontSize: 11, fontWeight: '800', color: C.muted, letterSpacing: 2 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: C.text, letterSpacing: -0.3 },
  shieldBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: C.surface, borderRadius: 22, padding: 20, marginBottom: 14, shadowColor: C.text, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 18, elevation: 2 },
  cardEyebrow: { fontSize: 13, fontWeight: '600', color: C.muted, textAlign: 'center', marginBottom: 4 },
  secureNote: { fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 20, marginTop: 8 },
  darkCard: { backgroundColor: C.dark },
  darkCardLabel: { fontSize: 11, fontWeight: '700', color: '#9AA3AF', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 },
  darkCardTime: { fontSize: 13, color: '#9AA3AF' },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusPill: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  statusPillTxt: { fontSize: 14, fontWeight: '800' },
  uploadIconRow: { marginBottom: 10 },
  uploadIconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  uploadTitle: { fontSize: 22, fontWeight: '800', color: C.text, marginBottom: 6, letterSpacing: -0.5 },
  uploadSub: { fontSize: 13, color: C.muted, lineHeight: 20, marginBottom: 16 },
  input: { backgroundColor: C.bg, borderRadius: 14, padding: 14, fontSize: 15, color: C.text, marginBottom: 10 },
  textArea: { backgroundColor: C.bg, borderRadius: 14, padding: 14, fontSize: 14, color: C.text, minHeight: 120, marginBottom: 10 },
  sampleBtn: { backgroundColor: C.bg, borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 14 },
  sampleTxt: { color: C.text, fontSize: 14, fontWeight: '600' },
  startLink: { alignItems: 'center', marginTop: 10 },
  startLinkTxt: { color: C.green, fontSize: 14, fontWeight: '700' },
  btnRow: { flexDirection: 'row', gap: 10 },
  btnGlow: { position: 'absolute', top: -8, left: -8, right: -8, bottom: -8, backgroundColor: C.dark, borderRadius: 26 },
  analyzeBtn: { backgroundColor: C.dark, borderRadius: 20, padding: 17, alignItems: 'center', shadowColor: C.dark, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 18, elevation: 6 },
  clearBtn: { flex: 1, backgroundColor: C.bg, borderRadius: 20, padding: 17, alignItems: 'center' },
  dimmed: { opacity: 0.38 },
  analyzeTxt: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  clearTxt: { color: C.text, fontSize: 15, fontWeight: '600' },
  scanner: { backgroundColor: C.dark, borderRadius: 22, padding: 30, alignItems: 'center', marginBottom: 14, shadowColor: C.dark, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.22, shadowRadius: 28, elevation: 10 },
  scanWin: { width: 68, height: 68, marginBottom: 18, position: 'relative', overflow: 'hidden' },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: C.greenAccent, shadowColor: C.greenAccent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 8 },
  corner: { position: 'absolute', width: 14, height: 14, borderWidth: 2, borderColor: '#FFF' },
  scanTitle: { color: '#FFF', fontSize: 16, fontWeight: '700', letterSpacing: -0.3 },
  dotsRow: { flexDirection: 'row', gap: 5, marginTop: 8, marginBottom: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.greenAccent },
  scanSub: { color: C.muted, fontSize: 13, fontWeight: '500' },
  errorBox: { backgroundColor: C.redLight, borderRadius: 16, padding: 14, marginBottom: 14 },
  errorTxt: { color: C.red, fontSize: 14, fontWeight: '500' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 14 },
  bodyTxt: { fontSize: 14, color: '#3D4451', lineHeight: 22 },
  mutedTxt: { fontSize: 14, color: C.muted },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: C.bg, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  tagTxt: { fontSize: 13, fontWeight: '600', color: C.text },
  reasonRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  reasonDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.dark, marginTop: 7, marginRight: 10 },
  reasonTxt: { flex: 1, fontSize: 14, color: '#3D4451', lineHeight: 21 },
  actionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  actionNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: C.red, color: '#FFF', fontSize: 13, fontWeight: '800', textAlign: 'center', lineHeight: 26, marginRight: 12 },
  actionTxt: { fontSize: 14, color: C.text, fontWeight: '500', flex: 1 },
  tipCard: { backgroundColor: '#EBEBEA', borderRadius: 22, padding: 20, marginBottom: 14 },
  tipLabel: { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 1.5, marginBottom: 8 },
  tipTxt: { fontSize: 18, fontWeight: '800', color: C.text, lineHeight: 26, letterSpacing: -0.3 },
  tipLine: { width: 32, height: 3, backgroundColor: C.dark, borderRadius: 2, marginTop: 16 },
  historyBtn: { backgroundColor: C.surface, borderRadius: 20, padding: 17, alignItems: 'center', marginBottom: 12, shadowColor: C.text, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 1 },
  historyTxt: { color: C.text, fontSize: 14, fontWeight: '700' },
  privacyBox: { backgroundColor: '#EBEBEA', borderRadius: 14, padding: 13, alignItems: 'center', marginBottom: 8 },
  privacyTxt: { fontSize: 12, color: C.muted, textAlign: 'center', fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(26,31,44,0.55)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: C.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  modalHandle: { width: 36, height: 4, backgroundColor: C.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: C.text, marginBottom: 18, letterSpacing: -0.5 },
  scenarioItem: { backgroundColor: C.surface, borderRadius: 16, padding: 16, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scenarioTitle: { fontSize: 14, fontWeight: '600', color: C.text, flex: 1, marginRight: 10 },
  riskPill: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 5 },
  riskPillTxt: { fontSize: 12, fontWeight: '700' },
  cancelBtn: { marginTop: 6, padding: 16, alignItems: 'center' },
  cancelTxt: { color: C.muted, fontSize: 16, fontWeight: '600' },
});