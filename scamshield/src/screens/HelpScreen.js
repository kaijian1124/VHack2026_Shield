import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, StyleSheet } from 'react-native';

export default function HelpScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Text style={styles.title}>🆘 Help & Resources</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>National Scam Response Centre (NSRC)</Text>
        <Text style={styles.cardBody}>Malaysia's official hotline for scam incidents. Available 24/7.</Text>
        <TouchableOpacity style={styles.hotlineBtn} onPress={() => Linking.openURL('tel:997')}>
          <Text style={styles.hotlineBtnText}>📞 Call 997</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>If You Receive a Scam Call</Text>
        {[
          '1. Stay calm — do not panic',
          '2. Hang up immediately',
          '3. Do NOT transfer any money',
          '4. Do NOT share OTP or bank details',
          '5. Block the number',
          '6. Report to NSRC (997) or polis.com.my',
          '7. Save evidence (screenshots, call records)',
        ].map((step, i) => (
          <Text key={i} style={styles.step}>{step}</Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Common Scam Types in Malaysia</Text>
        {[
          { name: 'Macau Scam', desc: 'Impersonates police/banks, demands transfer' },
          { name: 'Parcel Scam', desc: 'Fake customs fees for intercepted parcels' },
          { name: 'Love Scam', desc: 'Builds false romance then requests money' },
          { name: 'Investment Scam', desc: 'Promises high returns on fake platforms' },
        ].map((s, i) => (
          <View key={i} style={styles.scamItem}>
            <Text style={styles.scamName}>{s.name}</Text>
            <Text style={styles.scamDesc}>{s.desc}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Useful Links</Text>
        {[
          { label: 'Report at Royal Malaysia Police', url: 'https://www.rmp.gov.my' },
          { label: 'BNM Complaints (Bank Fraud)', url: 'https://www.bnm.gov.my' },
          { label: 'MCMC Cyber Crime Portal', url: 'https://aduan.mcmc.gov.my' },
        ].map((link, i) => (
          <TouchableOpacity key={i} onPress={() => Linking.openURL(link.url)}>
            <Text style={styles.link}>🔗 {link.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  title: { fontSize: 24, fontWeight: '800', color: '#1A237E', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 18, marginBottom: 16, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1A237E', marginBottom: 10 },
  cardBody: { fontSize: 14, color: '#555', marginBottom: 12 },
  hotlineBtn: { backgroundColor: '#F44336', borderRadius: 10, padding: 14, alignItems: 'center' },
  hotlineBtnText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  step: { fontSize: 14, color: '#333', marginBottom: 6 },
  scamItem: { borderBottomWidth: 1, borderBottomColor: '#EEE', paddingVertical: 8 },
  scamName: { fontSize: 14, fontWeight: '700', color: '#333' },
  scamDesc: { fontSize: 13, color: '#666', marginTop: 2 },
  link: { fontSize: 14, color: '#3F51B5', marginBottom: 10 },
});