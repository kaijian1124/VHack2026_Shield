import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, Easing, TouchableOpacity } from 'react-native';
import allPatterns from '../data/patterns.json';

const C = {
  bg: '#EEF2EF', surface: '#FFFFFF', dark: '#484F58',
  green: '#006D4B', greenLight: '#E8F5EE',
  red: '#D93025', redLight: '#FDECEA',
  amber: '#E8A000', amberLight: '#FFF8E7',
  text: '#1A1F2C', muted: '#6B7280',
};

const RISK = {
  Low:    { color: C.green, bg: C.greenLight, label: 'VERIFIED',  icon: '✓' },
  Medium: { color: C.amber, bg: C.amberLight, label: 'CAUTION',   icon: '⚠' },
  High:   { color: C.red,   bg: C.redLight,   label: 'HIGH RISK', icon: '!' },
};

function buildPatterns(call) {
  if (call.patternResults?.length > 0) return call.patternResults;
  const detected = call.patterns_detected || call.triggeredPatterns?.map(p => p.patternName) || [];
  const names = detected.map(n => n.toLowerCase().replace(/ /g, '_'));
  return allPatterns.map(p => {
    const hit = names.some(n => n === p.name || n === p.name.replace(/_/g, ' ') || p.name.includes(n));
    return { patternId: p.id, patternName: p.name, weight: p.weight, score: hit ? p.weight : 0, triggered: hit };
  });
}

// ─── Animated Score Ring ──────────────────────────────────────────────────────
function RingGauge({ score, size = 140, strokeWidth = 12 }) {
  const anim = useRef(new Animated.Value(0)).current;
  const color = score >= 70 ? C.green : score >= 40 ? C.amber : C.red;
  const track = score >= 70 ? '#C8E6D4' : score >= 40 ? '#FFE0B2' : '#FFCDD2';
  useEffect(() => {
    Animated.timing(anim, { toValue: score, duration: 1400, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
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
        <Text style={{ fontSize: 32, fontWeight: '800', color: C.text, letterSpacing: -1 }}>{score}</Text>
        <Text style={{ fontSize: 9, fontWeight: '800', color, letterSpacing: 2 }}>{score >= 70 ? 'SAFE' : score >= 40 ? 'CAUTION' : 'DANGER'}</Text>
      </View>
    </View>
  );
}

// ─── Animated Bar ─────────────────────────────────────────────────────────────
function AnimBar({ score, color, delay = 0 }) {
  const w = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(w, { toValue: score / 100, duration: 800, delay, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [score]);
  const width = w.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View style={styles.barTrack}>
      <Animated.View style={[styles.barFill, { width, backgroundColor: color }]} />
    </View>
  );
}

// ─── Fade Card ────────────────────────────────────────────────────────────────
function FadeCard({ children, delay = 0, style }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 480, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 480, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);
  return <Animated.View style={[{ opacity: fade, transform: [{ translateY: slide }] }, style]}>{children}</Animated.View>;
}

export default function DetailScreen({ route, navigation }) {
  const { call } = route.params;
  const r = RISK[call.riskLevel] || RISK.Low;
  const patternResults = buildPatterns(call);
  const heroSc = useRef(new Animated.Value(0.9)).current;
  useEffect(() => {
    Animated.spring(heroSc, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }).start();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* ── Hero ─────────────────────────────── */}
      <Animated.View style={[styles.hero, { backgroundColor: r.bg, transform: [{ scale: heroSc }] }]}>
        <RingGauge score={call.overallScore} />
        <View style={styles.heroInfo}>
          <View style={[styles.heroPill, { backgroundColor: r.color }]}>
            <Text style={styles.heroPillTxt}>{r.icon}  {r.label}</Text>
          </View>
          <Text style={styles.heroCaller}>{call.callerNumber || 'Unknown Caller'}</Text>
        </View>
      </Animated.View>

      {/* ── Meta ─────────────────────────────── */}
      <FadeCard delay={80} style={styles.card}>
        <Text style={styles.cardTitle}>Call Details</Text>
        {[
          ['Caller',    call.callerNumber || 'Unknown'],
          ['Language',  { en: 'English', ms: 'Bahasa Melayu', zh: 'Mandarin' }[call.language] || 'English'],
          ['Patterns',  `${call.triggeredPatterns?.length || 0} triggered`],
          ['Risk Score',`${call.overallScore} / 100`],
        ].map(([label, value], i, arr) => (
          <View key={label} style={[styles.metaRow, i < arr.length - 1 && styles.metaRowBorder]}>
            <Text style={styles.metaLabel}>{label}</Text>
            <Text style={styles.metaValue}>{value}</Text>
          </View>
        ))}
      </FadeCard>

      {/* ── Reasons ──────────────────────────── */}
      {call.reasons?.length > 0 && (
        <FadeCard delay={160} style={styles.card}>
          <Text style={styles.cardTitle}>📝  Analysis Reasons</Text>
          {call.reasons.map((reason, i) => (
            <FadeCard key={i} delay={160 + i * 60}>
              <View style={styles.reasonRow}>
                <View style={styles.reasonDot} />
                <Text style={styles.reasonTxt}>{reason}</Text>
              </View>
            </FadeCard>
          ))}
        </FadeCard>
      )}

      {/* ── Pattern Breakdown ────────────────── */}
      <FadeCard delay={240} style={styles.card}>
        <Text style={styles.cardTitle}>🔍  Pattern Breakdown</Text>
        {patternResults.map((p, i) => {
          const pColor = p.score > 60 ? C.red : p.score > 30 ? C.amber : C.green;
          return (
            <FadeCard key={p.patternId} delay={240 + i * 50}>
              <View style={[styles.patternRow, i < patternResults.length - 1 && styles.patternRowBorder]}>
                <View style={styles.patternLeft}>
                  <Text style={styles.patternId}>{p.patternId}</Text>
                  <Text style={[styles.patternName, { color: p.triggered ? C.text : '#B0B8C0' }]}>
                    {p.patternName.replace(/_/g, ' ')}
                  </Text>
                </View>
                <View style={styles.patternRight}>
                  {p.triggered ? (
                    <>
                      <Text style={[styles.patternScore, { color: pColor }]}>{p.score}</Text>
                      <AnimBar score={p.score} color={pColor} delay={240 + i * 50} />
                    </>
                  ) : (
                    <Text style={styles.patternDash}>—</Text>
                  )}
                </View>
              </View>
            </FadeCard>
          );
        })}
      </FadeCard>

      {/* ── Recommendation ───────────────────── */}
      {call.recommendation && (
        <FadeCard delay={360} style={[styles.card, { backgroundColor: C.greenLight }]}>
          <Text style={styles.cardTitle}>💡  Recommendation</Text>
          <Text style={styles.bodyTxt}>{call.recommendation}</Text>
        </FadeCard>
      )}

      {/* ── High Risk Actions ─────────────────── */}
      {call.riskLevel === 'High' && (
        <FadeCard delay={420} style={[styles.card, { backgroundColor: C.redLight }]}>
          <Text style={[styles.cardTitle, { color: C.red }]}>🚨  Immediate Actions</Text>
          {['Block the caller immediately', 'Call NSRC Hotline: 997', 'Report at polis.com.my', 'Do NOT transfer any money'].map((a, i) => (
            <FadeCard key={i} delay={420 + i * 60}>
              <View style={styles.actionRow}>
                <Text style={styles.actionNum}>{i + 1}</Text>
                <Text style={styles.actionTxt}>{a}</Text>
              </View>
            </FadeCard>
          ))}
        </FadeCard>
      )}

      {/* ── Tip Card ─────────────────────────── */}
      <FadeCard delay={480} style={styles.tipCard}>
        <Text style={styles.tipLabel}>PRO GUARDIAN TIP</Text>
        <Text style={styles.tipTxt}>
          {call.riskLevel === 'High'
            ? 'Legitimate authorities never ask you to transfer funds to a "safe account". This is always a scam.'
            : 'Always verify caller identity through official channels before sharing any personal information.'}
        </Text>
        <View style={styles.tipLine} />
      </FadeCard>

      {/* ── Privacy ──────────────────────────── */}
      <FadeCard delay={520}>
        <View style={styles.privacyBox}>
          <Text style={styles.privacyTxt}>🔒  Transcript processed and deleted. Only this summary is stored.</Text>
        </View>
      </FadeCard>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 60 },

  hero: { borderRadius: 24, padding: 24, marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 20, shadowColor: C.text, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 20, elevation: 3 },
  heroInfo: { flex: 1 },
  heroPill: { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginBottom: 10 },
  heroPillTxt: { color: '#FFF', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  heroCaller: { fontSize: 17, fontWeight: '700', color: C.text },

  card: { backgroundColor: C.surface, borderRadius: 22, padding: 20, marginBottom: 14, shadowColor: C.text, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 18, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 14 },

  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  metaRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F4F2' },
  metaLabel: { fontSize: 14, color: C.muted, fontWeight: '500' },
  metaValue: { fontSize: 14, fontWeight: '700', color: C.text },

  reasonRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  reasonDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.dark, marginTop: 7, marginRight: 10 },
  reasonTxt: { flex: 1, fontSize: 14, color: '#3D4451', lineHeight: 21 },

  patternRow: { paddingVertical: 14 },
  patternRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F4F2' },
  patternLeft: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  patternId: { fontSize: 11, fontWeight: '700', color: '#B0B8C0', width: 44, textTransform: 'uppercase', letterSpacing: 0.5 },
  patternName: { flex: 1, fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  patternRight: { },
  patternScore: { fontSize: 18, fontWeight: '800', textAlign: 'right', marginBottom: 6 },
  patternDash: { fontSize: 18, color: '#C8D0CC', textAlign: 'right' },
  barTrack: { height: 5, backgroundColor: '#EEF2EF', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 5, borderRadius: 3 },

  bodyTxt: { fontSize: 14, color: '#3D4451', lineHeight: 22 },

  actionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  actionNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: C.red, color: '#FFF', fontSize: 13, fontWeight: '800', textAlign: 'center', lineHeight: 26, marginRight: 12 },
  actionTxt: { fontSize: 14, color: C.text, fontWeight: '500', flex: 1 },

  tipCard: { backgroundColor: '#EBEBEA', borderRadius: 22, padding: 20, marginBottom: 14 },
  tipLabel: { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 1.5, marginBottom: 8 },
  tipTxt: { fontSize: 18, fontWeight: '800', color: C.text, lineHeight: 26, letterSpacing: -0.3 },
  tipLine: { width: 32, height: 3, backgroundColor: C.dark, borderRadius: 2, marginTop: 16 },

  privacyBox: { backgroundColor: '#EBEBEA', borderRadius: 14, padding: 13, alignItems: 'center', marginBottom: 8 },
  privacyTxt: { fontSize: 12, color: C.muted, textAlign: 'center', fontWeight: '500' },
});