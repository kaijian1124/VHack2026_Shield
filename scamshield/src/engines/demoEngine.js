export const DEMO_SCENARIOS = [
  {
    id: 'demo_zh_high',
    title: '高风险 - 冒充警察 (Mandarin)',
    callerNumber: '+60 12-XXX-9988',
    language: 'zh',
    transcript: '你好，我是国家警察局的侦探，你的银行账户涉及洗钱活动，必须立刻将资金转到我们指定的安全账户，否则我们会逮捕你。这件事必须保密，不要告诉任何人。',
    expectedRisk: 'High',
  },
  {
    id: 'demo_ms_high',
    title: 'High Risk - Polis Palsu (Malay)',
    callerNumber: '+60 3-XXX-2211',
    language: 'ms',
    transcript: 'Selamat pagi, saya pegawai polis dari Ibu Pejabat Polis Daerah. Akaun bank anda telah terlibat dalam kes pengubahan wang haram. Anda perlu memindahkan wang anda segera ke akaun selamat kami. Jangan beritahu sesiapa tentang perkara ini.',
    expectedRisk: 'High',
  },
  {
    id: 'demo_en_medium',
    title: 'Medium Risk - Parcel Scam (English)',
    callerNumber: '+60 11-XXX-5544',
    language: 'en',
    transcript: 'Hello, this is customs department. We have intercepted a parcel in your name containing suspicious items. You need to pay a clearance fee immediately to avoid legal action. Please transfer the payment to clear your shipment.',
    expectedRisk: 'Medium',
  },
  {
    id: 'demo_en_low',
    title: 'Low Risk - Normal Call (English)',
    callerNumber: '+60 12-XXX-1234',
    language: 'en',
    transcript: 'Hi, this is John from the pharmacy. Your prescription is ready for pickup. Our opening hours are 9am to 6pm. Please bring your identification card when you collect it.',
    expectedRisk: 'Low',
  },
];

export function simulateSTT(scenario, onWord, onComplete) {
  const chars = scenario.transcript.split('');
  let current = '';
  let index = 0;
  const interval = setInterval(() => {
    if (index >= chars.length) {
      clearInterval(interval);
      onComplete(scenario.transcript);
      return;
    }
    current += chars[index];
    index++;
    onWord(current);
  }, 60);
  return () => clearInterval(interval);
}