# 🛡️ ScamShield — 完整启动指南

> **2–3天黑客松冲刺版本** | React Native (Expo) + Supabase | Android Only

---

## 📁 项目结构

```
scamshield/
├── App.js                          # 入口
├── package.json
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js           # 主页：实时检测 + Demo
│   │   ├── CallLogScreen.js        # 通话记录列表
│   │   ├── DetailScreen.js         # 单通电话详情
│   │   └── HelpScreen.js           # 帮助页（NSRC 资源）
│   ├── engines/
│   │   ├── patternEngine.js        # ⭐ 核心：Pattern 匹配 + Scoring
│   │   └── demoEngine.js           # Demo 模式：模拟来电 STT 流
│   ├── data/
│   │   └── patterns.json           # Pattern DB（6个规则，3语言）
│   ├── services/
│   │   └── supabase.js             # 后端 API（只上传 metadata）
│   └── navigation/
│       └── AppNavigator.js         # Tab + Stack 导航
└── supabase/
    └── schema.sql                  # 数据库建表 + 初始数据
```

---

## 🚀 第一步：环境准备

### 1. 安装 Node.js
下载：https://nodejs.org（选 LTS 版本）

### 2. 安装 Expo CLI
```bash
npm install -g expo-cli
```

### 3. 手机安装 Expo Go
- Android: 在 Google Play 搜 "Expo Go" 安装

---

## 🚀 第二步：启动项目

```bash
# 进入项目目录
cd scamshield

# 安装依赖（第一次需要，约2–3分钟）
npm install

# 启动开发服务器
npx expo start
```

终端会出现一个 **QR Code** → 用手机 Expo Go 扫描 → App 自动运行！

---

## 🗄️ 第三步：配置 Supabase（后端）

### 3.1 创建 Supabase 账号
1. 进入 https://supabase.com
2. 点 **"Start your project"** → 用 GitHub 注册（免费）
3. 点 **"New Project"** → 填写：
   - Project Name: `scamshield`
   - Database Password: 自定义一个（记下来）
   - Region: `Southeast Asia (Singapore)`
4. 等待约 1 分钟初始化完成

### 3.2 建表
1. 进入 Supabase Dashboard → 左侧 **SQL Editor**
2. 点 **"New Query"**
3. 把 `supabase/schema.sql` 的全部内容粘贴进去
4. 点 **"Run"** → 看到 "Success" 即可

### 3.3 获取 API Key
1. 左侧 **Settings → API**
2. 复制：
   - `Project URL`（格式：`https://xxxxx.supabase.co`）
   - `anon / public` key（很长的字符串）

### 3.4 填入代码
打开 `src/services/supabase.js`，替换第 6–7 行：
```js
const SUPABASE_URL = 'https://你的项目ID.supabase.co';
const SUPABASE_ANON_KEY = '你的anon key';
```

---

## 📱 第四步：Demo 演示流程

### 在 Home 页面：
1. 点 **"📞 Start Demo Call"**
2. 选择一个场景（推荐先选 **高风险-冒充警察**）
3. 观察：
   - 实时 Transcript 流式显示
   - Risk Badge 动态更新（Low → Medium → High）
   - Pattern 分数条出现
4. 通话结束 → 自动跳转可进入 **Call Log** 查看历史

### 4个演示场景：
| 场景 | 语言 | 预期风险 |
|------|------|---------|
| 高风险-冒充警察 | 中文 | 🚨 High |
| High Risk-Polis | 马来语 | 🚨 High |
| Medium Risk-Parcel | 英语 | ⚠️ Medium |
| Normal Call | 英语 | ✅ Low |

---

## ⚡ 2–3天冲刺建议（优先级排序）

### Day 1（今天）
- [x] 跑通基础 App（npm install + expo start）
- [x] 测试4个 Demo 场景
- [x] 配置 Supabase，建表成功

### Day 2
- [ ] 在 HomeScreen 完善 UI（加 loading 状态、动画）
- [ ] Call Log 页数据持久化（AsyncStorage）
- [ ] 在真实 Android 手机上运行（扫 QR）
- [ ] 录制 Demo 视频

### Day 3
- [ ] 优化 Pattern DB（可加更多关键词）
- [ ] 准备 Slides/PPT
- [ ] 准备好 Demo 脚本（现场演示用）

---

## 🎯 比赛演讲亮点（Judges 最看重的）

1. **隐私设计**：展示 "Transcript never leaves device"
2. **本地化**：3语言支持（马来西亚特色）
3. **可落地性**：React Native + Supabase 真实可部署
4. **可解释性**：Per-pattern score bar 清晰展示为何判断为诈骗
5. **官方整合**：National Scam Response Centre (997) 直接整合

---

## 🔧 常见问题

**Q: `npm install` 报错**
A: 确保 Node.js >= 18，运行 `node --version` 检查

**Q: QR 扫描后手机连不上**
A: 手机和电脑必须在同一 WiFi 下；或在 Expo 按 `w` 用网页测试

**Q: Supabase 上传失败**
A: 检查 API Key 是否正确填入 `supabase.js`；Demo 模式下失败不影响本地功能

---

## 📞 紧急联系资源（演示用）
- **NSRC Hotline**: 997
- **Royal Malaysia Police**: 999
- **BNM Fraud**: 1-300-88-5465
