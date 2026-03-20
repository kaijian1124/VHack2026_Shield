import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, StyleSheet, Animated, Easing } from 'react-native';

const C = {
  bg: '#EEF2EF', surface: '#FFFFFF', dark: '#484F58',
  green: '#006D4B', greenLight: '#E8F5EE', greenAccent: '#4CAF82',
  red: '#D93025', redLight: '#FDECEA',
  amber: '#E8A000', amberLight: '#FFF8E7',
  text: '#1A1F2C', muted: '#6B7280',
};

const SCAM_TYPES = [
  { name: 'Macau Scam',     desc: 'Impersonates police or banks, demands urgent transfer', emoji: '🏦', color: C.red,   bg: C.redLight   },
  { name: 'Parcel Scam',    desc: 'Fake customs fees for intercepted parcels',             emoji: '📦', color: C.amber, bg: C.amberLight },
  { name: 'Love Scam',      desc: 'Builds false romance then requests money',              emoji: '💔', color: C.red,   bg: C.redLight   },
  { name: 'Investment Scam',desc: 'Promises high returns on fake platforms',               emoji: '📈', color: C.amber, bg: C.amberLight },
  { name: 'Government Aid', desc: 'Impersonates welfare agencies, steals OTP',            emoji: '🏛️', color: C.red,   bg: C.redLight   },
  { name: 'Job Scam',       desc: 'Fake part-time tasks requiring upfront deposit',        emoji: '💼', color: C.amber, bg: C.amberLight },
];

const STEPS = [
  'Stay calm — do not panic',
  'Hang up immediately',
  'Do NOT transfer any money',
  'Do NOT share your OTP or IC number',
  'Block the number',
  'Report to NSRC (997) or polis.com.my',
  'Save evidence — screenshots, call records',
];

const LINKS = [
  { label: 'Royal Malaysia Police',  sub: 'rmp.gov.my',           url: 'https://www.rmp.gov.my', emoji: '👮' },
  { label: 'BNM Complaints',         sub: 'bnm.gov.my',           url: 'https://www.bnm.gov.my', emoji: '🏦' },
  { label: 'MCMC Cyber Crime Portal',sub: 'aduan.mcmc.gov.my',    url: 'https://aduan.mcmc.gov.my', emoji: '💻' },
];

function FadeCard({ children, delay = 0, style }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 500, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);
  return <Animated.View style={[{ opacity: fade, transform: [{ translateY: slide }] }, style]}>{children}</Animated.View>;
}

function PulseDot() {
  const pulse = useRef(new Animated.Value(1)).current;
  const op = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.parallel([
      Animated.sequence([
        Animated.timing(pulse, { toValue: 2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(op, { toValue: 0, duration: 800, useNativeDriver: true }),
        Animated.timing(op, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    ])).start();
  }, []);
  return (
    <View style={{ width: 10, height: 10, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
      <Animated.View style={{ position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: C.greenAccent, opacity: op, transform: [{ scale: pulse }] }} />
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.greenAccent }} />
    </View>
  );
}

export default function HelpScreen() {
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-20)).current;
  const callBtnSc = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(headerY, { toValue: 0, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    Animated.loop(Animated.sequence([
      Animated.timing(callBtnSc, { toValue: 1.03, duration: 800, useNativeDriver: true }),
      Animated.timing(callBtnSc, { toValue: 1, duration: 800, useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* ── Header ─────────────────────────── */}
      <Animated.View style={[styles.header, { opacity: headerFade, transform: [{ translateY: headerY }] }]}>
        <Text style={styles.pageTitle}>Help & Resources</Text>
        <Text style={styles.pageSub}>Stay protected against phone scams</Text>
      </Animated.View>

      {/* ── Emergency Card ─────────────────── */}
      <FadeCard delay={100} style={styles.emergencyCard}>
        <View style={styles.emergencyTop}>
          <View>
            <Text style={styles.emergencyEyebrow}>EMERGENCY HOTLINE</Text>
            <Text style={styles.emergencyTitle}>National Scam Response Centre</Text>
            <Text style={styles.emergencySub}>Malaysia's official scam hotline. Available 24/7.</Text>
          </View>
          <View style={styles.emergencyBadge}>
            <Text style={{ fontSize: 28 }}>🚨</Text>
          </View>
        </View>

        <View style={styles.securingRow}>
          <PulseDot />
          <Text style={styles.securingTxt}>ACTIVE & MONITORING</Text>
        </View>

        <Animated.View style={{ transform: [{ scale: callBtnSc }] }}>
          <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL('tel:997')} activeOpacity={0.85}>
            <Text style={styles.callBtnTxt}>📞  Call 997</Text>
          </TouchableOpacity>
        </Animated.View>
      </FadeCard>

      {/* ── AI Shield Status ─────────────────── */}
      <FadeCard delay={160} style={styles.shieldCard}>
        <View style={styles.shieldRow}>
          <View style={styles.shieldIcon}><Text style={{ fontSize: 20 }}>🛡</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.shieldTitle}>AI Fraud Shield Active</Text>
            <Text style={styles.shieldSub}>ScamShield is analyzing patterns to keep you protected.</Text>
          </View>
        </View>
      </FadeCard>

      {/* ── If You Receive a Scam Call ──────── */}
      <FadeCard delay={220} style={styles.card}>
        <Text style={styles.cardTitle}>If You Receive a Scam Call</Text>
        {STEPS.map((step, i) => (
          <FadeCard key={i} delay={220 + i * 50}>
            <View style={[styles.stepRow, i < STEPS.length - 1 && styles.stepRowBorder]}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumTxt}>{i + 1}</Text>
              </View>
              <Text style={styles.stepTxt}>{step}</Text>
            </View>
          </FadeCard>
        ))}
      </FadeCard>

      {/* ── Scam Types ──────────────────────── */}
      <FadeCard delay={300} style={styles.card}>
        <Text style={styles.cardTitle}>Common Scam Types in Malaysia</Text>
        <View style={styles.scamGrid}>
          {SCAM_TYPES.map((sc, i) => (
            <FadeCard key={i} delay={300 + i * 60} style={[styles.scamTile, { backgroundColor: sc.bg }]}>
              <Text style={styles.scamEmoji}>{sc.emoji}</Text>
              <Text style={[styles.scamName, { color: sc.color }]}>{sc.name}</Text>
              <Text style={styles.scamDesc}>{sc.desc}</Text>
            </FadeCard>
          ))}
        </View>
      </FadeCard>

      {/* ── Pro Tip ─────────────────────────── */}
      <FadeCard delay={360} style={styles.tipCard}>
        <Text style={styles.tipLabel}>PRO GUARDIAN TIP</Text>
        <Text style={styles.tipTxt}>Never share your OTP with anyone claiming to be from the bank.</Text>
        <View style={styles.tipLine} />
      </FadeCard>

      {/* ── Useful Links ────────────────────── */}
      <FadeCard delay={400} style={styles.card}>
        <Text style={styles.cardTitle}>Useful Links</Text>
        {LINKS.map((link, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.linkRow, i < LINKS.length - 1 && styles.linkRowBorder]}
            onPress={() => Linking.openURL(link.url)}
            activeOpacity={0.7}
          >
            <View style={styles.linkIcon}>
              <Text style={{ fontSize: 16 }}>{link.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.linkLabel}>{link.label}</Text>
              <Text style={styles.linkSub}>{link.sub}</Text>
            </View>
            <Text style={styles.linkArrow}>→</Text>
          </TouchableOpacity>
        ))}
      </FadeCard>

      {/* ── Footer ──────────────────────────── */}
      <FadeCard delay={440}>
        <View style={styles.footer}>
          <Text style={styles.footerTxt}>ScamShield helps protect Malaysians from phone fraud. Stay vigilant and share this with people you care about.</Text>
        </View>
      </FadeCard>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 60 },

  header: { marginBottom: 24, paddingTop: 8 },
  pageTitle: { fontSize: 34, fontWeight: '800', color: C.text, letterSpacing: -1 },
  pageSub: { fontSize: 14, color: C.muted, marginTop: 4, fontWeight: '500' },

  // Emergency
  emergencyCard: { backgroundColor: C.dark, borderRadius: 24, padding: 22, marginBottom: 14, shadowColor: C.dark, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 8 },
  emergencyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  emergencyEyebrow: { fontSize: 11, fontWeight: '800', color: '#9AA3AF', letterSpacing: 1.5, marginBottom: 6 },
  emergencyTitle: { fontSize: 18, fontWeight: '800', color: '#FFF', letterSpacing: -0.3, marginBottom: 4 },
  emergencySub: { fontSize: 13, color: '#9AA3AF', lineHeight: 18 },
  emergencyBadge: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  securingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  securingTxt: { fontSize: 11, fontWeight: '800', color: C.greenAccent, letterSpacing: 1.5 },
  callBtn: { backgroundColor: C.red, borderRadius: 18, paddingVertical: 16, alignItems: 'center', shadowColor: C.red, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 6 },
  callBtnTxt: { color: '#FFF', fontSize: 18, fontWeight: '800' },

  // Shield
  shieldCard: { backgroundColor: C.greenLight, borderRadius: 20, padding: 18, marginBottom: 14 },
  shieldRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  shieldIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center', shadowColor: C.text, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 1 },
  shieldTitle: { fontSize: 15, fontWeight: '700', color: C.green, marginBottom: 3 },
  shieldSub: { fontSize: 13, color: C.muted },

  card: { backgroundColor: C.surface, borderRadius: 22, padding: 20, marginBottom: 14, shadowColor: C.text, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 18, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 14 },

  stepRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  stepRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F4F2' },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  stepNumTxt: { fontSize: 13, fontWeight: '800', color: C.text },
  stepTxt: { fontSize: 14, color: '#3D4451', fontWeight: '500', flex: 1 },

  scamGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  scamTile: { borderRadius: 16, padding: 14, width: '47%' },
  scamEmoji: { fontSize: 24, marginBottom: 8 },
  scamName: { fontSize: 13, fontWeight: '800', marginBottom: 4, letterSpacing: -0.2 },
  scamDesc: { fontSize: 12, color: C.muted, lineHeight: 17 },

  tipCard: { backgroundColor: '#EBEBEA', borderRadius: 22, padding: 20, marginBottom: 14 },
  tipLabel: { fontSize: 11, fontWeight: '700', color: C.muted, letterSpacing: 1.5, marginBottom: 8 },
  tipTxt: { fontSize: 18, fontWeight: '800', color: C.text, lineHeight: 26, letterSpacing: -0.3 },
  tipLine: { width: 32, height: 3, backgroundColor: C.dark, borderRadius: 2, marginTop: 16 },

  linkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  linkRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F4F2' },
  linkIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  linkLabel: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 2 },
  linkSub: { fontSize: 12, color: C.muted },
  linkArrow: { fontSize: 18, color: '#B0B8C0' },

  footer: { backgroundColor: '#EBEBEA', borderRadius: 16, padding: 16, alignItems: 'center' },
  footerTxt: { fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 20, fontWeight: '500' },
});