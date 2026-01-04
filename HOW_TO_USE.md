# 🎯 How to Use Liza DeFi Platform

## 🌐 Access the Live Platform

**URL:** https://shina-3tqsr1jgw-naquibmirza-6034s-projects.vercel.app

---

## 💬 Chat Commands

### 1. **Order Management**

#### Place a BUY Order:
```
"Buy 100 BONK at 0.000042 SOL"
"Create a buy order for 50 SOL at 180 USD"
"Purchase 1000 HdZh1mUvCVJzHfTFaJJxZJFENhiFAkyiXLA5iZZTpump"
```

#### Place a SELL Order:
```
"Sell all my BONK"
"Create a sell order for 5 SOL at 190 USD"
"Sell 0.5 SOL for USDC"
```

#### Track Orders:
```
"Show my active orders"
"What orders do I have pending?"
"List all open orders"
```

#### Cancel Orders:
```
"Cancel order [order_id]"
"Remove my pending buy order"
"Cancel all orders"
```

---

### 2. **Price Monitoring**

#### Get Current Price:
```
"What's the current price of SOL?"
"How much is BONK worth?"
"Show me USDC price"
"Get price for [token_mint]"
```

#### Get Price Analysis:
```
"Is SOL up or down today?"
"What's the 24h change for BONK?"
"Show me BONK trading volume"
"Analyze SOL price trend"
```

#### Get Price History:
```
"Show SOL price history"
"Get last 24 hours of BONK prices"
"Display price movements for USDC"
```

---

### 3. **Automated Trading Strategies**

#### Create Strategies:

**DCA (Dollar Cost Averaging):**
```
"Create a DCA strategy to buy 0.5 SOL every week"
"Set up automatic weekly purchases of 100 BONK"
"Create a monthly DCA for 2 USDC"
```

**Momentum Trading:**
```
"Set up momentum trading for BONK (5% threshold)"
"Create a strategy that sells BONK if it pumps >3%"
"Trade SOL when it moves >2% in 24 hours"
```

**Grid Trading:**
```
"Create a grid strategy for SOL from $170 to $200"
"Set up grid trading with $5 spacing around $185"
"Build a 3-level grid for BONK"
```

#### Manage Strategies:

```
"Show all my strategies"
"Enable my DCA strategy"
"Disable momentum trading"
"Execute DCA now"
"Run the grid strategy"
"Delete strategy [strategy_id]"
```

---

## 🔌 Direct API Usage

### Using cURL

#### Example 1: Place an Order
```bash
curl -X POST https://shina-3tqsr1jgw-naquibmirza-6034s-projects.vercel.app/api/defi \
  -H "Content-Type: application/json" \
  -d '{
    "action": "place_order",
    "type": "buy",
    "tokenMint": "DezXAZ8z7PnrnRJjz3wXBoQskzw1ia8dx5WhJAu1d8b8",
    "amount": 1000,
    "price": 0.000042
  }'
```

**Response:**
```json
{
  "success": true,
  "orderId": "order_1767431018332_b78tgbrau",
  "message": "✅ BUY order created\n\n**Order ID:** order_1767431018332_b78tgbrau\n**Token:** DezXAZ8z7PnrnRJjz3wXBoQskzw1ia8dx5WhJAu1d8b8\n**Amount:** 1000\n**Price:** 0.000042 SOL\n**Status:** Pending"
}
```

#### Example 2: Get Active Orders
```bash
curl "https://shina-3tqsr1jgw-naquibmirza-6034s-projects.vercel.app/api/defi?action=get_active_orders"
```

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "id": "order_1767431018332_b78tgbrau",
      "type": "buy",
      "tokenMint": "DezXAZ8z7PnrnRJjz3wXBoQskzw1ia8dx5WhJAu1d8b8",
      "amount": 1000,
      "price": 0.000042,
      "status": "pending",
      "createdAt": "2026-01-03T09:03:38.332Z"
    }
  ],
  "message": "📋 Active Orders (1):\n\n• **BUY** 1000 units at 0.000042 SOL"
}
```

#### Example 3: Get Token Price
```bash
curl "https://shina-3tqsr1jgw-naquibmirza-6034s-projects.vercel.app/api/defi?action=get_price&mint=So11111111111111111111111111111111111111111"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "mint": "So11111111111111111111111111111111111111111",
    "symbol": "SOL",
    "price": 185.5,
    "change24h": 2.5,
    "volume24h": 1500000000,
    "timestamp": "2026-01-03T09:03:38.332Z"
  },
  "message": "✅ Current price for So11111111111111111111111111111111111111111"
}
```

#### Example 4: Create Trading Strategy
```bash
curl -X POST https://shina-3tqsr1jgw-naquibmirza-6034s-projects.vercel.app/api/defi \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_strategy",
    "name": "Weekly SOL DCA",
    "type": "dca",
    "tokenMint": "So11111111111111111111111111111111111111112",
    "parameters": {
      "amount": 1,
      "interval": 604800000
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "strategyId": "strategy_1767431018539_lkpm2yl07",
  "message": "✅ Strategy created: Weekly SOL DCA\n\n**Type:** dca\n**Token:** So11111111111111111111111111111111111111112\n**Status:** Inactive (enable to start trading)"
}
```

#### Example 5: Execute Strategy
```bash
curl -X POST https://shina-3tqsr1jgw-naquibmirza-6034s-projects.vercel.app/api/defi \
  -H "Content-Type: application/json" \
  -d '{
    "action": "execute_strategy",
    "strategyId": "strategy_1767431018539_lkpm2yl07"
  }'
```

---

## 📱 Example Workflows

### Workflow 1: Manual Trading Session

```
User: "What's the SOL price?"
Liza: SOL is trading at $185.50 USD
      24h volume: $1.5B
      Trend: +2.5% in last 24h

User: "Place a buy order for 2 SOL at $180"
Liza: ✅ BUY order created
      Order ID: order_xyz
      Amount: 2 SOL
      Price: $180
      Status: Pending

User: "Show my orders"
Liza: 📋 Active Orders (1):
      • BUY 2 SOL at $180

User: "If SOL hits $190, I'll sell"
Liza: I'll monitor. When ready, just say:
      "Sell 2 SOL at $190"

User: "Sell 2 SOL at $190"
Liza: ✅ SELL order created
      Order ID: order_abc
      Amount: 2 SOL
      Price: $190
      Status: Pending

User: "Cancel my sell order"
Liza: ✅ Order cancelled: order_abc
```

### Workflow 2: Automated DCA Setup

```
User: "I want to invest in SOL weekly"
Liza: I can set up a DCA (Dollar Cost Averaging) strategy.
      How much per week?

User: "0.5 SOL every week"
Liza: ✅ Strategy created: Weekly SOL DCA
      Type: DCA
      Token: SOL
      Amount: 0.5 SOL/week
      Status: Ready to enable

User: "Enable the strategy"
Liza: ✅ Strategy enabled: Weekly SOL DCA
      Your wallet will automatically buy 0.5 SOL every 7 days

User: "Execute it now"
Liza: 💰 DCA Order placed
      Order ID: order_xyz
      Amount: 0.5 SOL
      Status: Pending

User: "What's my strategy status?"
Liza: Strategy: Weekly SOL DCA
      Type: DCA
      Status: Active ✓
      Next execution: In 7 days
      Total orders placed: 1
```

### Workflow 3: Momentum Trading

```
User: "Set up momentum trading for BONK"
Liza: Great! Momentum trading buys on dips and sells on pumps.
      What threshold? (I recommend 3-5%)

User: "Use 5%"
Liza: ✅ Strategy created: Momentum Trader
      Threshold: 5%
      Token: BONK
      Status: Ready to enable

User: "Enable it"
Liza: ✅ Strategy enabled: Momentum Trader

User: "Run momentum check now"
Liza: 📊 Checking BONK momentum...
      Current 24h change: +5.2%
      Threshold: 5%
      📈 Momentum triggered (5.20%)
      
      ✅ SELL order created
      Order ID: order_123
      Amount: 100000 BONK
      Price: $0.000042
      Status: Pending

User: "Show strategy details"
Liza: Strategy: Momentum Trader
      Type: momentum
      Status: Active ✓
      Threshold: 5%
      Last execution: Just now
      Orders executed: 1
```

### Workflow 4: Grid Trading

```
User: "Set up grid trading for SOL"
Liza: Grid trading places buy/sell orders at regular intervals.
      What price range? Base price?

User: "Base price $185, spacing $5, 3 levels"
Liza: ✅ Strategy created: SOL Grid Trader
      Base: $185
      Grid spacing: $5
      Levels: 3
      
      Buy orders at: $180, $175, $170
      Sell orders at: $190, $195, $200
      Status: Ready to enable

User: "Enable and run it"
Liza: ✅ Strategy enabled: SOL Grid Trader
      
      ✅ Grid strategy executed with 3 orders
      
      BUY orders created:
      • 5 SOL @ $170
      • 5 SOL @ $175
      • 5 SOL @ $180

User: "Monitor this strategy"
Liza: 📊 Grid Trader Status:
      Buy orders: 3 (pending)
      Sell orders: Ready (when price rises)
      Total profit potential: Based on volatility
```

---

## 🎯 Token Reference

### Mainnet Supported Tokens:
| Token | Mint | Decimals | Category |
|-------|------|----------|----------|
| SOL | So11111... | 9 | Native |
| USDC | EPjFWd... | 6 | Stablecoin |
| BONK | DezXAZ... | 5 | Meme |
| Custom | [any mint] | Varies | Any SPL token |

### Using Contract Addresses:
```
"Buy 100 DezXAZ8z7PnrnRJjz3wXBoQskzw1ia8dx5WhJAu1d8b8"
"Show price for EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
"Create DCA for So11111111111111111111111111111111111111112"
```

---

## ⚠️ Important Notes

1. **Demo Mode:** Current price data is simulated for testing
   - In production, integrate Birdeye or similar for real prices
   - Orders are tracked in-memory (not on-chain by default)

2. **Trading is Disabled by Default:**
   - Set `AUTO_TRADING_ENABLED=true` in `.env` to enable automatic execution
   - Manual order creation always works

3. **Security:**
   - API key is handled server-side (secure)
   - No private keys exposed in APIs
   - All transactions are auditable

4. **Rate Limits:**
   - None specified (adjust in production)
   - Price updates every 60 seconds

---

## 🆘 Troubleshooting

### Issue: Orders not appearing
**Solution:** Refresh the page, check browser console for errors

### Issue: API returns 500 error
**Solution:** Check `.env` configuration, restart server

### Issue: Strategy not executing
**Solution:** Ensure strategy is enabled first, check parameters

### Issue: Price data seems old
**Solution:** Normal - prices update every 60 seconds (configurable)

---

## 📞 Support

**Production URL:** https://shina-3tqsr1jgw-naquibmirza-6034s-projects.vercel.app

**For Issues:**
1. Check documentation: `DEFI_PLUGIN_COMPLETE.md`
2. Review test results: `test-defi-plugin.ts`
3. Check configuration: `.env`
4. Review logs on Vercel dashboard

---

## 🚀 Ready to Start?

1. Go to: https://shina-3tqsr1jgw-naquibmirza-6034s-projects.vercel.app
2. Chat with Liza
3. Try: "What's the SOL price?"
4. Create an order or strategy
5. Monitor your portfolio

**Happy trading! 🎯**

---

**Version:** 1.0.0  
**Status:** Production Live 🚀  
**Last Updated:** 2026-01-03
