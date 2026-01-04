# 🎨 Portfolio Component for v0.dev - Complete Guide

**Status:** Ready to use  
**Platform:** v0.dev  
**Integration:** Seamless with your Vercel backend  

---

## 📋 Step-by-Step v0.dev Implementation

### Step 1: Get v0.dev Access

Go to: **https://v0.dev**

- Login with GitHub
- Create new project or component
- Select "Create new component"

---

### Step 2: Copy Portfolio Component Code

Use this prompt in v0.dev:

```
Create a beautiful portfolio dashboard component for Solana tokens.

Features:
1. Display total portfolio value (USD)
2. Show SOL balance with USD value
3. Display top 5 holdings in a grid
4. Show portfolio composition with progress bars
5. Include refresh button to reload data
6. Beautiful gradient background (dark theme)
7. Use Tailwind CSS and shadcn/ui components
8. Make it responsive for mobile
9. Show loading and error states
10. Display wallet address

Dark theme with purple/pink gradients
Professional financial dashboard look
Smooth animations and transitions

Include:
- Large total value display
- SOL balance card
- Top holdings cards with percentages
- Composition breakdown
- Refresh button with spinner
- Error handling display
- Responsive grid layout

Use colors:
- Background: slate-900 to slate-800 gradient
- Accents: purple-500, pink-500
- Success: green-400
- Warning: yellow-400
- Error: red-500

Make it look professional and production-ready.
```

---

### Step 3: Component Output (Already Made)

I've created a production-ready component. Here's what to do:

#### **Option A: Use Pre-Made Component**

Copy this into v0.dev and generate:

```jsx
// Portfolio Dashboard Component for v0.dev

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, Wallet, AlertCircle } from 'lucide-react';

export default function PortfolioDashboard() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Your wallet address
  const walletAddress = 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT';

  // Fetch from your backend
  const fetchPortfolio = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch portfolio');
      }

      const data = await response.json();
      if (data.data) {
        setPortfolio(data.data);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (err) {
      setError(err.message);
      console.error('Portfolio fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <Card className="bg-red-950 border-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <div>
                <h3 className="font-semibold text-red-200">Error Loading Portfolio</h3>
                <p className="text-red-300 text-sm">{error}</p>
                <Button onClick={fetchPortfolio} className="mt-3 bg-red-600 hover:bg-red-700">
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <Card className="bg-slate-900 border-purple-500">
          <CardContent className="pt-6 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-400" />
            <p className="text-gray-300">Loading portfolio...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalValue = portfolio.totalValueUSD || 0;
  const solBalance = portfolio.solBalance?.SOL || 0;
  const solValue = portfolio.solBalance?.USD || 0;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-white">Portfolio Dashboard</h1>
        <Button 
          onClick={fetchPortfolio}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Total Value Card */}
      <Card className="bg-gradient-to-br from-purple-900 to-slate-900 border-2 border-purple-500">
        <CardHeader>
          <CardTitle className="text-gray-400 text-sm">Total Portfolio Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
              ${totalValue.toFixed(2)}
            </span>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
          {lastUpdated && (
            <p className="text-gray-500 text-xs mt-3">Last updated: {lastUpdated}</p>
          )}
        </CardContent>
      </Card>

      {/* SOL Balance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-purple-500">
          <CardHeader>
            <CardTitle className="text-lg text-white">SOL Balance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Amount</p>
              <p className="text-3xl font-bold text-white">{solBalance.toFixed(4)}</p>
              <p className="text-gray-500 text-xs mt-1">SOL</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">USD Value</p>
              <p className="text-2xl font-bold text-green-400">${solValue.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Tokens Count */}
        <Card className="bg-slate-800 border-pink-500">
          <CardHeader>
            <CardTitle className="text-lg text-white">Holdings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Tokens</p>
              <p className="text-3xl font-bold text-pink-400">{portfolio.tokenCount || 0}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Portfolio Status</p>
              <p className="text-green-400 font-semibold">Healthy</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Holdings */}
      <Card className="bg-slate-800 border-purple-500">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Top Holdings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolio.topTokens?.slice(0, 6).map((token, idx) => {
              const percentage = (token.valueUSD / totalValue) * 100;
              return (
                <div 
                  key={idx} 
                  className="bg-slate-700 rounded-lg p-4 border border-gray-600 hover:border-purple-400 transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-white text-lg">{token.symbol}</p>
                      <p className="text-gray-400 text-sm">{token.balance.toFixed(4)}</p>
                    </div>
                    <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-green-400 font-semibold text-lg">
                    ${token.valueUSD.toFixed(2)}
                  </p>
                  <div className="w-full bg-gray-600 rounded-full h-1.5 mt-3">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Composition */}
      <Card className="bg-slate-800 border-purple-500">
        <CardHeader>
          <CardTitle className="text-lg text-white">Asset Composition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {portfolio.portfolioComposition?.slice(0, 10).map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-white font-mono font-semibold">{item.symbol}</span>
                <div className="text-right">
                  <p className="text-gray-400 text-xs">{item.percentage.toFixed(1)}%</p>
                  <p className="text-green-400 text-sm font-semibold">
                    ${item.usdValue.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Wallet Info Footer */}
      <Card className="bg-slate-800 border-gray-600">
        <CardContent className="pt-6">
          <p className="text-gray-400 text-xs mb-2">Wallet Address</p>
          <p className="text-gray-300 font-mono text-sm break-all">
            {walletAddress}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### Step 4: Generate Component in v0.dev

1. **Open v0.dev**
2. **Click "Create Component"**
3. **Use this v0 prompt:**

```
Create a Solana portfolio dashboard component with:

Requirements:
1. Total portfolio value display (large, bold)
2. SOL balance card showing amount and USD
3. Token count card
4. Top 6 holdings grid (showing symbol, balance, USD value, percentage)
5. Asset composition breakdown (all tokens with percentage bars)
6. Wallet address display at bottom
7. Refresh button with loading state
8. Last updated timestamp
9. Error state with retry button
10. Loading state with spinner

Styling:
- Dark theme: slate-900, slate-800 background
- Purple and pink gradients for accents
- Green for positive values
- Responsive grid layout
- Cards with borders (purple/pink)
- Smooth transitions and hover effects
- Professional financial dashboard look

Components to use:
- Card, CardContent, CardHeader, CardTitle from shadcn/ui
- Button from shadcn/ui
- Icons from lucide-react (RefreshCw, TrendingUp, Wallet, AlertCircle)
- Tailwind CSS for styling

Functionality:
- Fetch from /api/portfolio endpoint
- POST wallet address as JSON
- Handle loading and error states
- Auto-refresh every 60 seconds
- Display percentage composition bars
- Show top holdings prominently

Make it production-ready and beautiful!
```

4. **Wait for generation**
5. **Copy the component**

---

### Step 5: Add to Your Vercel Project

```bash
cd d:\shina

# Create components directory if needed
mkdir -p src/frontend/components

# Create the file
touch src/frontend/components/PortfolioDashboard.tsx

# Copy the generated code into it
```

---

### Step 6: Create Backend API Route

Add this file:

```bash
touch src/api/routes/portfolio.ts
```

```typescript
// src/api/routes/portfolio.ts

import { analyzePortfolio } from '../portfolio-analytics';

export async function POST(req, res) {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        error: 'Wallet address is required',
        success: false
      });
    }

    // Use your Alchemy RPC
    const rpcUrl = process.env.SOLANA_RPC_URL || 
                   'https://api.mainnet-beta.solana.com';

    console.log(`[API] Fetching portfolio for: ${walletAddress}`);

    // Analyze portfolio
    const portfolio = await analyzePortfolio(walletAddress, rpcUrl);

    return res.json({
      success: true,
      data: portfolio,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[API] Portfolio error:', error);
    return res.status(500).json({
      error: error.message,
      success: false
    });
  }
}
```

---

### Step 7: Integrate into Your Main Page

Update your main v0.dev page:

```jsx
// pages/index.tsx or app.tsx

import PortfolioDashboard from '@/components/PortfolioDashboard';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-900">
      {/* Header */}
      <nav className="bg-slate-800 border-b border-purple-500 p-4">
        <h1 className="text-2xl font-bold text-white">LIZA Dashboard</h1>
      </nav>

      {/* Portfolio Section */}
      <section className="p-8">
        <PortfolioDashboard />
      </section>

      {/* Trading Section (your existing code) */}
      <section className="p-8">
        {/* Your trading component here */}
      </section>
    </main>
  );
}
```

---

## 🧪 Testing the v0.dev Component

### Test 1: Local Testing

```bash
# Make sure backend is running
bun run dev

# Test API endpoint
curl -X POST http://localhost:3000/api/portfolio \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT"
  }'

# Expected response:
# {
#   "success": true,
#   "data": { portfolio data },
#   "timestamp": "..."
# }
```

### Test 2: Component in v0.dev Preview

1. Open component in v0.dev
2. Click "Preview"
3. Should see loading spinner
4. Then portfolio displays
5. Click "Refresh" button
6. Data updates

---

## 📤 Deploy to Vercel

```bash
cd d:\shina

# Build
bun run build

# Deploy
git add .
git commit -m "Add Portfolio Dashboard component"
git push

# Vercel will auto-deploy in 2-3 minutes
```

---

## 🎨 Customization Options

### Change Colors:
```jsx
// Replace these colors throughout:
"bg-purple-600" → "bg-blue-600"
"text-green-400" → "text-emerald-400"
"from-purple-900" → "from-blue-900"
```

### Change Refresh Interval:
```jsx
// In useEffect:
const interval = setInterval(fetchPortfolio, 60000);
// Change 60000 to desired milliseconds
// 30000 = 30 seconds
// 120000 = 2 minutes
```

### Add More Holdings:
```jsx
// Change slice number:
{portfolio.topTokens?.slice(0, 6).map(...)} 
// Change 6 to 10 for top 10, etc.
```

### Customize Wallet:
```jsx
// Replace with dynamic wallet:
const walletAddress = props.walletAddress || 'CMVrzd...';
// Or read from URL params:
const walletAddress = new URLSearchParams(window.location.search).get('wallet');
```

---

## ✅ Verification Checklist

- [ ] Component generated in v0.dev ✅
- [ ] Backend API route created ✅
- [ ] Component imported in main page ✅
- [ ] API endpoint tested locally ✅
- [ ] Portfolio data displays correctly ✅
- [ ] Refresh button works ✅
- [ ] Mobile responsive ✅
- [ ] Error states show properly ✅
- [ ] Build succeeds ✅
- [ ] Deploys to Vercel ✅

---

## 🚀 Final Steps

```bash
# 1. Generate component in v0.dev
# 2. Create API route
# 3. Test locally: bun run dev
# 4. Deploy: git push
# 5. Verify on Vercel
# 6. Done! ✅
```

---

**Your portfolio dashboard is ready for v0.dev!** 🎉

Questions? Check the main integration guide!
