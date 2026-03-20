import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, StyleSheet } from 'react-native';

const SCAM_TYPES = [
  { name: 'Macau Scam', desc: 'Impersonates police or banks, demands urgent fund transfer', emoji: '🏦' },
  { name: 'Parcel Scam', desc: 'Fake customs fees for intercepted parcels', emoji: '📦' },
  { name: 'Love Scam', desc: 'Builds false romance then requests money', emoji: '💔' },
  { name: 'Investment Scam', desc: 'Promises high returns on fake platforms', emoji: '📈' },
  { name: 'Government Aid Scam', desc: 'Impersonates welfare agencies, steals OTP', emoji: '🏛️' },
  { name: 'Job Scam', desc: 'Fake part-time tasks requiring upfront deposit', emoji: '💼' },
];

const STEPS = [
  'Stay calm — do not panic',
  'Hang up immediately',
  'Do NOT transfer any money',
  'Do NOT share your OTP or bank details',
  'Block the number',
  'Report to NSRC (997) or polis.com.my',
  'Save evidence — screenshots, call records',
];

const LINKS = [
  { label: 'Royal Malaysia Police', url: 'https://www.rmp.gov.my' },
  { label: 'BNM Complaints (Bank Fraud)', url: 'https://www.bnm.gov.my' },
  { label: 'MCMC Cyber Crime Portal', url: 'https://aduan.mcmc.gov.my' },
];

export default function HelpScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Help & Resources</Text>
        <Text style={styles.subtitle}>Stay protected against phone scams</Text>
      </View>

      {/* NSRC Emergency Card */}
      <View style={[styles.bentoCard, styles.emergencyCard]}>
        <Text style={styles.emergencyLabel}>EMERGENCY HOTLINE</Text>
        <Text style={styles.emergencyTitle}>National Scam Response Centre</Text>
        <Text style={styles.emergencyBody}>Malaysia's official scam hotline. Available 24/7.</Text>
        <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL('tel:997')}>
          <Text style={styles.callBtnText}>📞  Call 997</Text>
        </TouchableOpacity>
      </View>

      {/* Steps */}
      <View style={styles.bentoCard}>
        <Text style={styles.cardHeader}>If You Receive a Scam Call</Text>
        {STEPS.map((step, i) => (
          <View key={i} style={[styles.stepRow, i < STEPS.length - 1 && styles.stepRowBorder]}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{i + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      {/* Scam Types */}
      <View style={styles.bentoCard}>
        <Text style={styles.cardHeader}>Common Scam Types in Malaysia</Text>
        <View style={styles.scamGrid}>
          {SCAM_TYPES.map((s, i) => (
            <View key={i} style={styles.scamTile}>
              <Text style={styles.scamEmoji}>{s.emoji}</Text>
              <Text style={styles.scamName}>{s.name}</Text>
              <Text style={styles.scamDesc}>{s.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Useful Links */}
      <View style={styles.bentoCard}>
        <Text style={styles.cardHeader}>Useful Links</Text>
        {LINKS.map((link, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.linkRow, i < LINKS.length - 1 && styles.linkRowBorder]}
            onPress={() => Linking.openURL(link.url)}
          >
            <Text style={styles.linkText}>{link.label}</Text>
            <Text style={styles.linkArrow}>→</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footerBox}>
        <Text style={styles.footerText}>ScamShield helps protect Malaysians from phone fraud. Stay vigilant.</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAEFF1' },
  content: { padding: 20, paddingBottom: 48 },

  header: { marginBottom: 24, paddingTop: 8 },
  title: { fontSize: 32, fontWeight: '800', color: '#212529', letterSpacing: -1 },
  subtitle: { fontSize: 14, color: '#6C757D', marginTop: 4, fontWeight: '500' },

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

  emergencyCard: {
    backgroundColor: '#212529',
  },
  emergencyLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6C757D',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  emergencyTitle: { fontSize: 20, fontWeight: '800', color: '#F5F6F7', marginBottom: 6, letterSpacing: -0.3 },
  emergencyBody: { fontSize: 14, color: '#ADB5BD', marginBottom: 20 },
  callBtn: {
    backgroundColor: '#C44A3A',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#C44A3A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 4,
  },
  callBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },

  cardHeader: { fontSize: 15, fontWeight: '700', color: '#212529', marginBottom: 16 },

  stepRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  stepRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F4F6' },
  stepNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#EAEFF1',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 14,
  },
  stepNumText: { fontSize: 13, fontWeight: '800', color: '#212529' },
  stepText: { fontSize: 14, color: '#495057', fontWeight: '500', flex: 1 },

  scamGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  scamTile: {
    backgroundColor: '#F1F4F6',
    borderRadius: 18,
    padding: 14,
    width: '47%',
  },
  scamEmoji: { fontSize: 24, marginBottom: 8 },
  scamName: { fontSize: 13, fontWeight: '700', color: '#212529', marginBottom: 4 },
  scamDesc: { fontSize: 12, color: '#6C757D', lineHeight: 17 },

  linkRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  linkRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F4F6' },
  linkText: { fontSize: 14, fontWeight: '600', color: '#212529', flex: 1 },
  linkArrow: { fontSize: 18, color: '#ADB5BD', fontWeight: '300' },

  footerBox: { backgroundColor: '#F1F4F6', borderRadius: 16, padding: 16, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#6C757D', textAlign: 'center', lineHeight: 18, fontWeight: '500' },
});