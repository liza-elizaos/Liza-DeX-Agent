# 🚀 Agent0 SDK - Quick Reference Guide

## 5 Test Scripts at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│                    AGENT0 TEST SCRIPTS                          │
└─────────────────────────────────────────────────────────────────┘

1️⃣  test_registration.py
    ├─ Purpose: Create & register agent (HTTP storage)
    ├─ What it does:
    │  ├─ Initialize agent with name/description
    │  ├─ Set MCP endpoints (tools extraction)
    │  ├─ Set A2A endpoints (skills extraction)
    │  ├─ Register on-chain with HTTP URI
    │  └─ Return agentId: "11155111:123"
    │
    └─ Output: Agent registered via HTTP

2️⃣  test_registrationIpfs.py
    ├─ Purpose: Create & register agent (IPFS storage)
    ├─ What it does:
    │  ├─ Initialize agent (same as HTTP)
    │  ├─ Choose IPFS provider (Pinata/Filecoin/Node)
    │  ├─ Upload metadata to IPFS
    │  ├─ Register on-chain pointing to IPFS
    │  └─ Return IPFS hash: "ipfs://Qm..."
    │
    └─ Output: Agent registered on decentralized IPFS

3️⃣  test_feedback.py
    ├─ Purpose: Rate agents & build reputation
    ├─ What it does:
    │  ├─ Prepare feedback (score 0-100)
    │  ├─ Add optional tags & skill ratings
    │  ├─ Store on IPFS
    │  ├─ Give feedback to agent
    │  ├─ Retrieve feedback history
    │  └─ Calculate reputation summary
    │
    └─ Output: Reputation score calculated

4️⃣  test_search.py
    ├─ Purpose: Discover agents by capability
    ├─ What it does:
    │  ├─ Search by name (substring matching)
    │  ├─ Filter by MCP tools
    │  ├─ Filter by A2A skills
    │  ├─ Filter by reputation score
    │  ├─ Filter by payment support (x402)
    │  └─ Return matching agents with details
    │
    └─ Output: List of agents matching criteria

5️⃣  test_transfer.py
    ├─ Purpose: Transfer agent ownership
    ├─ What it does:
    │  ├─ Load existing agent
    │  ├─ Transfer to new wallet
    │  ├─ Update on-chain pointer
    │  ├─ New owner can manage agent
    │  └─ Re-register with updates
    │
    └─ Output: Agent ownership transferred
```

---

## Complete Agent Lifecycle Flow

```
START
  │
  ├─→ Create Agent (test_registration.py or test_registrationIpfs.py)
  │   │
  │   ├─ Name: "My AI Agent"
  │   ├─ Description: "Analyzes data"
  │   ├─ MCP: "https://mcp.example.com"
  │   ├─ A2A: "https://a2a.example.com"
  │   └─ Register on-chain
  │       └─ Result: agentId = "11155111:123"
  │
  ├─→ Advertise Capabilities (searchable)
  │   │
  │   ├─ MCP Tools: ["code_generation", "analysis"]
  │   ├─ A2A Skills: ["python", "sql"]
  │   ├─ OASF Skills: ["data_engineering/..."]
  │   └─ Metadata in IPFS or HTTP
  │
  ├─→ Get Used by Others (test_search.py)
  │   │
  │   ├─ Agent searches: "Find Python agents"
  │   ├─ Discovery: "My AI Agent" matches
  │   ├─ Gets endpoints from metadata
  │   └─ Integrates with agent
  │
  ├─→ Build Reputation (test_feedback.py)
  │   │
  │   ├─ User rates: Score 92/100
  │   ├─ Tags: "accurate", "fast"
  │   ├─ Skills rated: "python" 95/100
  │   ├─ Feedback stored on IPFS
  │   └─ Reputation = avg(92, 95, ...)
  │
  ├─→ Manage Agent (test_transfer.py)
  │   │
  │   ├─ Update: New capabilities
  │   ├─ Transfer: To new owner
  │   ├─ Re-register: Updated metadata
  │   └─ Reputation: Continues to accumulate
  │
  └─→ END (Agent is discoverable, trusted, integrated)
```

---

## 📊 Test Script Comparison Matrix

| Feature | test_registration | test_registrationIpfs | test_feedback | test_search | test_transfer |
|---------|-------------------|----------------------|---------------|-------------|---------------|
| Create Agent | ✅ | ✅ | ❌ | ❌ | ❌ |
| Set Endpoints | ✅ | ✅ | ❌ | ❌ | ❌ |
| IPFS Storage | ❌ | ✅ | ✅ | ❌ | ❌ |
| Register On-Chain | ✅ | ✅ | ❌ | ❌ | ❌ |
| Give Feedback | ❌ | ❌ | ✅ | ❌ | ❌ |
| Get Reputation | ❌ | ❌ | ✅ | ❌ | ❌ |
| Search Agents | ❌ | ❌ | ❌ | ✅ | ❌ |
| Transfer Owner | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 🔧 Quick Setup

```bash
# 1. Install
pip install jejunetwork-agent0

# 2. Set environment
export RPC_URL="https://sepolia.infura.io/v3/YOUR_KEY"
export PRIVATE_KEY="0x..."
export PINATA_JWT="..."  # For IPFS

# 3. Run tests
python tests/test_registration.py
python tests/test_registrationIpfs.py
python tests/test_feedback.py
python tests/test_search.py
python tests/test_transfer.py
```

---

## 💡 When to Use Which Test

```
🎯 I want to...

① Create my first agent?
   → Use: test_registration.py
   → Why: Simplest, HTTP storage, quick setup

② Create permanent agent for marketplace?
   → Use: test_registrationIpfs.py
   → Why: Decentralized, permanent, censorship-resistant

③ Get reviews & build trust?
   → Use: test_feedback.py
   → Why: Accumulate reputation scores

④ Find agents for my needs?
   → Use: test_search.py
   → Why: Search by skills, tools, reputation

⑤ Sell or transfer my agent?
   → Use: test_transfer.py
   → Why: Change ownership to new wallet
```

---

## 📈 Example: Building Agent Reputation

```
Day 1: Agent Created
├─ test_registration.py
├─ agentId: "11155111:456"
└─ Reputation: N/A (no feedback yet)

Day 2-5: Agent Gets Used
├─ User 1: test_feedback.py → Score 90/100
├─ User 2: test_feedback.py → Score 88/100
├─ User 3: test_feedback.py → Score 92/100
└─ Reputation: 90.0 (average)

Day 6+: Discovery Increases
├─ test_search.py finds: "agents with 85+ reputation"
├─ Our agent appears in results
├─ More users discover it
├─ test_feedback.py scores: 91/100, 93/100, 89/100
└─ Reputation: 91.0 (rising)

Result: High-trust agent, widely discovered! ✨
```

---

## 🎨 Agent Properties Managed

```
Agent Identity
├─ Name: "My AI Agent"
├─ Description: "What it does"
├─ Image: "https://..."
├─ Chain: 11155111 (Sepolia)
└─ Owner: "0x..."

Capabilities
├─ MCP Endpoint: "https://mcp.example.com"
│  └─ Tools: code_generation, analysis, etc.
├─ A2A Endpoint: "https://a2a.example.com"
│  └─ Skills: python, sql, data_science, etc.
├─ ENS: "myagent.eth"
└─ OASF Skills: ["data_engineering/...", ...]

Trust & Reputation
├─ Reputation Score: 85-100
├─ Feedback Count: 50+
├─ Feedback Tags: "accurate", "fast", "reliable"
├─ x402 Support: Yes/No (for payments)
└─ Active Status: True/False

Storage
├─ HTTP URI: "https://example.com/agent.json"
└─ IPFS Hash: "ipfs://Qm..."
```

---

## 📝 Key Concepts

### Agent ID
```
Format: "chainId:agentNumber"
Example: "11155111:123"
         └─ 11155111 = Ethereum Sepolia
         └─ 123 = Agent #123 on Sepolia
```

### Storage Options
```
HTTP (test_registration.py)
├─ Centralized: stored on one server
├─ Fast: quick access
├─ Risk: server could go down
└─ Use: Testing, simple agents

IPFS (test_registrationIpfs.py)
├─ Decentralized: copies on many nodes
├─ Permanent: content-addressed
├─ Better: censorship-resistant
└─ Use: Production, important agents
```

### Feedback
```
Score (required): 0-100
Tags (optional): ["accurate", "fast"]
Capability (optional): "tools"
Name (optional): "code_generation"
Skill (optional): "python"
```

### Discovery Search
```
By Name: "AI", "Python", "Assistant"
By Tools: ["code_gen"], ["analysis"]
By Skills: ["python"], ["sql"]
By Reputation: minScore=80, maxScore=100
By Payment: x402support=True
By Status: active=True
```

---

## ⚠️ Important Notes

✓ Currently: Ethereum Sepolia testnet only
✓ Alpha: v0.31, not production-ready
✓ IPFS Providers: Pinata, Filecoin, Local node
✓ Report bugs: GitHub or Telegram (@marcoderossi)

---

## 🎯 Learning Path

```
Beginner
  └─ test_registration.py (create agent)
     └─ test_search.py (find agents)
     
Intermediate
  └─ test_registrationIpfs.py (IPFS registration)
     └─ test_feedback.py (reputation)
     
Advanced
  └─ test_transfer.py (ownership)
     └─ Build agent marketplace
     └─ Create agent ecosystem
```

---

## 📚 More Info

- Docs: https://docs.jeju.network
- GitHub: https://github.com/JejuNetwork/agent0-py
- OASF: https://github.com/agntcy/oasf
- ERC-8004: Agent identity standard

---

**Start with test_registration.py! 🚀**
