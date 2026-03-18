# 🛡️ ScamShield

A real-time phone scam detection app built with React Native (Expo) + Supabase.
Detects scam patterns in calls across **3 languages** — English, Bahasa Melayu, and Mandarin.

> Built for VHack 2026 Hackathon

---

## 📱 Features

- 🎙️ Real-time call transcript analysis (on-device)
- 🧠 Pattern matching across 6 scam categories
- 📊 Per-pattern fraud scoring (0–100)
- 🚨 Risk level detection: Low / Medium / High
- 🔒 Privacy-first: transcript never leaves your device
- 📋 Call log with detailed breakdown
- 🆘 Integrated NSRC (997) hotline & action steps
- 🌐 3-language support: English, Bahasa Melayu, 中文

---

## 🗂️ Project Structure
```
scamshield/
├── App.js
├── app.json
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js        # Live detection + demo
│   │   ├── CallLogScreen.js     # Call history
│   │   ├── DetailScreen.js      # Per-call breakdown
│   │   └── HelpScreen.js        # NSRC resources
│   ├── engines/
│   │   ├── patternEngine.js     # Core scoring algorithm
│   │   └── demoEngine.js        # Demo STT simulation
│   ├── data/
│   │   └── patterns.json        # 6 scam patterns, 3 languages
│   ├── services/
│   │   └── supabase.js          # Backend API (metadata only)
│   └── navigation/
│       └── AppNavigator.js      # Tab + Stack navigation
└── supabase/
    └── schema.sql               # Database schema
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Expo Go app on your Android phone

### Installation
```bash
git clone https://github.com/YOUR_USERNAME/scamshield.git
cd scamshield
npm install --legacy-peer-deps
npx expo start --clear
```

Scan the QR code with Expo Go on your phone.

---

## 🗄️ Supabase Setup

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project (Region: Southeast Asia)
3. Go to **SQL Editor** → paste contents of `supabase/schema.sql` → Run
4. Go to **Settings → API** → copy your Project URL and anon key
5. Paste them into `src/services/supabase.js`

---

## 🧠 Scam Patterns Detected

| ID | Pattern | Weight |
|----|---------|--------|
| P001 | Police impersonation | 40 |
| P002 | Urgent money transfer | 35 |
| P003 | Threat of arrest | 30 |
| P004 | Parcel scam | 20 |
| P005 | Money laundering accusation | 35 |
| P006 | Secrecy pressure | 25 |

---

## 🔒 Privacy

- Audio and transcripts are processed **on-device only**
- Only anonymised metadata (scores, risk level) is uploaded
- Caller numbers are hashed before storage
- Temporary data deleted after call ends

---

## 🛠️ Tech Stack

- **Frontend**: React Native (Expo SDK 54)
- **Navigation**: React Navigation v6
- **Backend**: Supabase (Postgres + Auth + Edge Functions)
- **Pattern Engine**: Custom keyword matching + scoring algorithm

---

## 📞 Emergency Resources (Malaysia)

- **NSRC Hotline**: 997
- **Royal Malaysia Police**: 999
- **BNM Fraud Line**: 1-300-88-5465