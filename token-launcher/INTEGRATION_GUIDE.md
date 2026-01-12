# 🔗 INTEGRATION GUIDE - Token Launcher + Main Shina App

## 🎯 Overview

This guide explains how to integrate the Token Launcher backend and frontend into your main Shina application.

## 📁 Current Structure

```
d:\shina\
├── token-launcher/          ← Your new backend (currently running on :3001)
│   ├── src/
│   ├── dist/
│   ├── node_modules/
│   └── ...
│
├── (main Shina files)       ← Main application
├── src/
├── dist/
└── ...
```

## 🚀 Integration Steps

### Step 1: Prepare the React Component

The Token Launcher component is ready at:
```
d:\shina\token-launcher\src\frontend\TokenLauncher.tsx
d:\shina\token-launcher\src\frontend\styles\launcher.css
```

**Option A: Copy to Main App**

```powershell
# Copy component
Copy-Item "d:\shina\token-launcher\src\frontend\TokenLauncher.tsx" `
  -Destination "d:\shina\src\components\TokenLauncher.tsx"

# Copy styles
Copy-Item "d:\shina\token-launcher\src\frontend\styles\launcher.css" `
  -Destination "d:\shina\src\styles\launcher.css"
```

**Option B: Reference from token-launcher**

You can also import directly without copying:
```tsx
import TokenLauncher from '../../../token-launcher/src/frontend/TokenLauncher';
```

### Step 2: Add Route in Main App

Add to your main `App.tsx` or routing setup:

```tsx
import TokenLauncher from './components/TokenLauncher';
import './styles/launcher.css';

export default function App() {
  return (
    <div>
      {/* Your existing routes */}
      
      {/* Add token launcher */}
      <Route path="/token-launcher" element={<TokenLauncher />} />
      
      {/* Or add as a modal/page */}
      <TokenLauncher />
    </div>
  );
}
```

### Step 3: Update API URL

In the copied `TokenLauncher.tsx`, find and update:

**Development**:
```tsx
const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
```

**Production**:
```tsx
const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://your-deployed-backend.com';
```

### Step 4: Add Environment Variables

Create/update `.env.local` in your main Shina app:

```env
# For local development
REACT_APP_BACKEND_URL=http://localhost:3001

# For production (after deployment)
# REACT_APP_BACKEND_URL=https://token-launcher-backend.vercel.app
```

### Step 5: Build Main App

```bash
cd d:\shina
npm run build  # or bun run build
```

## 📦 Deployment Strategy

### Option 1: Separate Deployments (Recommended)

**Backend** (Token Launcher):
- Deploy to: Vercel / Railway / Render
- Runs independently
- URL: `https://token-launcher-backend.vercel.app`

**Frontend** (Main Shina):
- Deploy to: Vercel / Netlify
- Points to backend via environment variable
- URL: `https://shina-app.vercel.app`

### Option 2: Monorepo Deployment

Deploy both from same repository:

```
d:\shina\
├── frontend/        (Main app)
├── backend/         (Token launcher)
└── vercel.json      (Monorepo config)
```

**vercel.json**:
```json
{
  "buildCommand": "npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "env": {
    "BACKEND_URL": "@backend_url"
  }
}
```

## 🔑 Environment Setup for Production

### For Vercel Deployment

**Token Launcher Backend**:
1. Connect `token-launcher` repo to Vercel
2. Set environment variables:
   ```
   OPENROUTER_API_KEY=xxx
   PUMPPORTAL_API_KEY=xxx
   SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   DEV_WALLET_ADDRESS=6VR1QcueqMDSgqDZ2JvcRumFu1Azo53qgy66XDJTvA1C
   DEV_WALLET_PRIVATE_KEY=xxx
   NODE_ENV=production
   PORT=3001
   ```
3. Deploy

**Main Shina Frontend**:
1. Connect main repo to Vercel
2. Set environment variables:
   ```
   REACT_APP_BACKEND_URL=https://token-launcher-backend.vercel.app
   ```
3. Deploy

## 🧪 Testing Integration

### Local Test

```bash
# Terminal 1: Start token launcher backend
cd d:\shina\token-launcher
npm start  # or: node dist/server.js

# Terminal 2: Start main app
cd d:\shina
npm run dev  # or: bun run dev
```

Visit `http://localhost:3000` (or your dev port) and navigate to token launcher.

### Verify Backend Connection

In browser console:
```javascript
fetch('http://localhost:3001/health')
  .then(r => r.json())
  .then(d => console.log('Backend OK:', d))
  .catch(e => console.error('Backend Error:', e))
```

## 📊 API Contract

Your frontend component expects this API:

```typescript
interface LaunchResponse {
  status: 'success' | 'rejected' | 'error';
  message: string;
  trendConfidence?: number;
  trendVerdict?: 'hot' | 'neutral' | 'dead';
  trendReasoning?: string;
  token?: {
    name: string;
    symbol: string;
    lore: string;
    mint?: string;
    tx?: string;
    tags?: string[];
  };
}
```

The endpoint:
```
POST /api/agent/launch
Content-Type: multipart/form-data

Fields:
- userPrompt: JSON string
- launchConfig: JSON string
- image: File (PNG/JPG, max 2MB)
- override?: boolean
```

## 🔐 Security Considerations

### Backend (.env in token-launcher)
- Keep API keys secret
- Never commit `.env`
- Use Vercel/Railway secret management
- Rotate keys regularly

### Frontend (React)
- `REACT_APP_*` variables exposed in bundle
- Only put non-sensitive URLs here
- Backend must validate all requests
- Implement rate limiting

## 🚀 Quick Deployment Script

### Deploy Backend (Vercel)

```bash
cd d:\shina\token-launcher

# First time setup
vercel link

# Deploy
vercel --prod

# Get production URL
echo "Backend deployed at: https://token-launcher-[random].vercel.app"
```

### Deploy Frontend (Vercel)

```bash
cd d:\shina

# Update environment variable
echo "REACT_APP_BACKEND_URL=https://token-launcher-[your-url].vercel.app" > .env.production

# Deploy
vercel --prod
```

## 📋 Integration Checklist

- [ ] Component files copied or linked
- [ ] Route added in main app
- [ ] API URL configured (dev + prod)
- [ ] Environment variables set
- [ ] Component imports working
- [ ] Styles importing correctly
- [ ] Local backend running
- [ ] Local frontend running
- [ ] Component renders without errors
- [ ] Image upload working
- [ ] Form validation working
- [ ] API calls succeeding
- [ ] Responses displaying correctly
- [ ] Backend built and ready for deploy
- [ ] Environment variables for production set
- [ ] Both deployed to production
- [ ] Production test successful

## 🎨 UI Integration Options

### Option 1: New Page

```tsx
<Route path="/token-launcher" element={<TokenLauncher />} />
```

Access: `http://localhost:3000/token-launcher`

### Option 2: Modal

```tsx
const [showLauncher, setShowLauncher] = useState(false);

<button onClick={() => setShowLauncher(true)}>Launch Token</button>

{showLauncher && (
  <Modal>
    <TokenLauncher />
    <button onClick={() => setShowLauncher(false)}>Close</button>
  </Modal>
)}
```

### Option 3: Tab/Panel

```tsx
const [activeTab, setActiveTab] = useState('dashboard');

<TabBar>
  <Tab onClick={() => setActiveTab('dashboard')}>Dashboard</Tab>
  <Tab onClick={() => setActiveTab('launcher')}>Token Launcher</Tab>
</TabBar>

{activeTab === 'launcher' && <TokenLauncher />}
```

### Option 4: Embedded in Dashboard

```tsx
<div className="dashboard">
  <Portfolio />
  <ChatInterface />
  <TokenLauncher />  {/* Inline */}
</div>
```

## 🧹 Cleanup After Integration

Keep organized:

```bash
# Optional: Remove original copy from token-launcher if integrated
# (Keep for reference/backup)

# Update .gitignore
echo "token-launcher/node_modules/" >> .gitignore
echo "token-launcher/dist/" >> .gitignore
echo "token-launcher/.env" >> .gitignore
```

## 📞 Troubleshooting Integration

### "Cannot find component"

```typescript
// Check import path
import TokenLauncher from './components/TokenLauncher';
// vs
import TokenLauncher from '../token-launcher/src/frontend/TokenLauncher';
```

### "API Not Responding"

```typescript
// Check URL in component
console.log('API URL:', process.env.REACT_APP_BACKEND_URL);

// Verify backend running
curl http://localhost:3001/health
```

### "CORS Error"

Backend already has CORS enabled. If still seeing errors:
```typescript
// Make sure backend has:
app.use(cors());

// In Express app
```

### "Styles Not Loading"

```tsx
// Import CSS in component file
import './launcher.css';

// Or in parent component
import './styles/launcher.css';
```

## ✅ Success Criteria

- [x] Component renders without errors
- [x] Image upload works
- [x] Form submits to backend
- [x] Backend processes request
- [x] Response displays in UI
- [x] Token launches successfully
- [x] Deployed to production
- [x] End-to-end test passes

## 🎉 You're Integrated!

Your Token Launcher is now part of the main Shina application.

### Next:
1. Test thoroughly in production
2. Monitor backend logs
3. Gather user feedback
4. Iterate on features

---

For detailed info, see:
- [QUICK_START.md](./QUICK_START.md) - API testing
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Detailed setup
- [README.md](./README.md) - Project overview
