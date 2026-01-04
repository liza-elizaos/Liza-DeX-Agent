# 🧪 Agent0 SDK - Test Scripts Summary

## Overview
The jejunetwork-agent0 (formerly agent0-sdk) is a Python SDK for creating agents that register, advertise capabilities, and build reputation on-chain using ERC-8004 standard with blockchain infrastructure.

---

## 📋 Test Scripts Explained

The Agent0 SDK includes 5 core test scripts located in the `tests/` directory. Here's what each one does:

### 1. **test_registration.py**
**Purpose**: Agent registration using HTTP URI

**What it tests**:
- Creating a new agent with custom properties
- Setting agent name, description, and image
- Configuring MCP (Model Context Protocol) endpoints
- Configuring A2A (Agent-to-Agent) communication endpoints
- Setting ENS (Ethereum Name Service) domain
- Registering agent with HTTP URI (no IPFS needed)
- Verifying agent is created with unique ID
- Retrieving registered agent information

**Example flow**:
```
1. Create agent "My AI Agent"
2. Set MCP endpoint (extracts tools/capabilities)
3. Set A2A endpoint (extracts skills)
4. Register via HTTP URI
5. Get agent ID: "11155111:123"
6. Verify registration succeeded
```

**Output**: Agent registered with HTTP URI, agentId returned

---

### 2. **test_registrationIpfs.py**
**Purpose**: Agent registration using IPFS storage (more decentralized)

**What it tests**:
- Similar to test_registration.py but with IPFS
- Setting up IPFS provider (Pinata, Filecoin, or local node)
- Storing agent metadata on IPFS instead of HTTP
- Blockchain registration pointing to IPFS
- Support for multiple IPFS providers
- Decentralized agent discovery

**Key differences from HTTP**:
```
HTTP: Metadata stored on centralized server
IPFS: Metadata stored on decentralized IPFS network
       → More censorship-resistant
       → Permanent content addressing
       → Better for agent marketplaces
```

**IPFS Options Tested**:
- **Pinata** (easiest, free tier available)
- **Filecoin Pin** (free for ERC-8004 agents)
- **Local IPFS Node** (full decentralization)

**Example flow**:
```
1. Create agent
2. Set IPFS provider (e.g., Pinata)
3. Publish agent metadata to IPFS
4. Register on-chain pointing to IPFS content
5. Get IPFS content hash: "ipfs://Qm..."
6. Verify blockchain references IPFS metadata
```

**Output**: Agent registered on IPFS, IPFS hash retrieved

---

### 3. **test_feedback.py**
**Purpose**: Agent feedback system and reputation building

**What it tests**:
- Giving feedback to an agent (score 0-100)
- Preparing feedback with optional tags/skills
- Storing feedback on IPFS
- Retrieving feedback history for an agent
- Searching feedback by criteria
- Getting reputation summary
- Building trust through peer feedback

**Feedback Structure**:
```json
{
  "agentId": "11155111:123",
  "score": 85,           // Mandatory (0-100)
  "tags": ["data_analyst"],  // Optional
  "capability": "tools",     // Optional: MCP capability
  "name": "code_generation", // Optional: Tool name
  "skill": "python"          // Optional: A2A skill
}
```

**Example flow**:
```
1. User tests agent's capabilities
2. Prepares feedback with score (85/100)
3. Adds tags: "python", "reliable", "fast"
4. Optionally rates specific capability (e.g., "code_generation tool")
5. Stores feedback on IPFS
6. Other agents can see and trust this feedback
7. Reputation summary built from all feedback
```

**Output**: Feedback recorded, reputation summary updated

---

### 4. **test_search.py**
**Purpose**: Discovering agents with specific capabilities

**What it tests**:
- Searching agents by name (substring matching)
- Filtering by MCP tools available
- Filtering by A2A skills
- Filtering by OASF standardized skills/domains
- Filtering by reputation/reputation score
- Filtering by x402 payment support
- Full-text search across agent database
- Getting individual agent details

**Search Examples**:
```python
# Find "AI" agents
results = sdk.searchAgents(name="AI", active=True)

# Find agents with Python coding capability
results = sdk.searchAgents(
    mcpTools=["code_generation"],
    a2aSkills=["python"],
    minReputation=80
)

# Find agents that support payments
results = sdk.searchAgents(x402support=True)

# Find agents in finance domain
results = sdk.searchAgents(
    domains=["finance_and_business/investment_services"]
)
```

**Output**: List of matching agents with capabilities

---

### 5. **test_transfer.py**
**Purpose**: Transferring agent ownership between wallets

**What it tests**:
- Loading an existing agent
- Transferring agent ownership to new wallet
- Updating agent's wallet address
- Verifying new owner can manage agent
- Re-registering after ownership change
- Updating on-chain agent pointer
- Maintaining agent identity across ownership transfer

**Example flow**:
```
1. Load agent "11155111:123"
2. Current owner: 0x123456...
3. Transfer ownership to: 0x789abc...
4. New owner can now:
   - Edit agent properties
   - Give feedback
   - Update endpoints
   - Re-register agent
5. Previous owner loses management access
```

**Use Cases**:
- Selling agent ownership
- Agent inheritance
- Team management (transfer to team wallet)
- Upgrading to new wallet

**Output**: Agent ownership transferred, new wallet set

---

## 🔄 Complete Agent Lifecycle

Here's how all tests fit together in an agent's lifecycle:

```
1. CREATE AGENT (test_registration.py / test_registrationIpfs.py)
   └─ Initialize agent with identity
   └─ Set capabilities (MCP/A2A endpoints)
   └─ Register on-chain
   └─ Get agentId

2. ADVERTISE CAPABILITIES (test_search.py)
   └─ Other agents search for this agent
   └─ Find by name, tools, skills
   └─ Discover endpoints
   └─ Integration ready

3. BUILD REPUTATION (test_feedback.py)
   └─ Users test agent
   └─ Give feedback scores
   └─ Write reviews/tags
   └─ Reputation accumulates
   └─ Trust score increases

4. MANAGE AGENT (test_transfer.py)
   └─ Update agent properties
   └─ Transfer ownership if needed
   └─ Re-register with updates
   └─ Maintain on-chain presence

5. DISCOVER & TRUST (test_search.py)
   └─ Other agents search by capability
   └─ See reputation scores
   └─ Filter by trust level
   └─ Decide to integrate
```

---

## 🛠️ Running the Tests

### Prerequisites
```bash
pip install jejunetwork-agent0

# Set environment variables
export RPC_URL="https://sepolia.infura.io/v3/YOUR_KEY"
export PRIVATE_KEY="0x..."
export PINATA_JWT="pinata_jwt_..."  # For IPFS tests
```

### Run Individual Tests
```bash
# Basic registration (HTTP)
python tests/test_registration.py

# IPFS registration
python tests/test_registrationIpfs.py

# Feedback & reputation
python tests/test_feedback.py

# Search agents
python tests/test_search.py

# Transfer ownership
python tests/test_transfer.py
```

### Run All Tests
```bash
pytest tests/
```

---

## 📊 Key Concepts

### Agent ID Format
```
"11155111:123"
├─ 11155111 = Ethereum Sepolia chain ID
└─ 123 = Unique agent number on that chain
```

### Agent URI
```
"ipfs://QmXxxx..." or "https://example.com/agent.json"
└─ Points to agent metadata stored on IPFS or HTTP
```

### Endpoints
```
MCP (Model Context Protocol):
  └─ Tools: code_generation, analysis, data_processing
  └─ Prompts: Pre-built conversations
  └─ Resources: Data sources

A2A (Agent-to-Agent):
  └─ Skills: python, sql, data_science
  └─ Capabilities: What agent can do
  └─ Contact methods: How to communicate
```

### OASF (Open Agentic Schema Framework)
```
Standardized taxonomies for skills and domains:
└─ Skills: 136 standard skills (e.g., data_transformation, summarization)
└─ Domains: 204 standard domains (e.g., finance, technology)
└─ Purpose: Better discovery and interoperability
```

### Reputation
```
Score: 0-100 (average of all feedback)
Feedback: Individual ratings with tags
Trust: Built through consistent good performance
```

---

## 💡 Real-World Examples

### Example 1: AI Agent Marketplace
```
1. Developer creates AI agent (test_registration.py)
   └─ Sets capabilities: code_generation, analysis

2. Agent registers with IPFS (test_registrationIpfs.py)
   └─ Decentralized, permanent registration

3. Users rate agent (test_feedback.py)
   └─ Score: 92/100
   └─ Tags: "accurate", "fast", "reliable"

4. Other agents search (test_search.py)
   └─ Find: Python code agents with 90+ reputation
   └─ Results: Our agent appears #1

5. Company buys agent (test_transfer.py)
   └─ Transfer ownership to company wallet
   └─ Company now manages agent
```

### Example 2: Agent Ecosystem
```
Agent A (Data Processor)
  └─ Searches for agents with analysis skills
  └─ Finds Agent B via test_search.py
  └─ Calls Agent B for complex analysis
  └─ Rates Agent B via test_feedback.py

Agent B (Analyzer)
  └─ Receives work from Agent A
  └─ Executes analysis
  └─ Returns results
  └─ Reputation increases (Agent A gave 95/100 score)
```

---

## ⚠️ Important Notes

### Alpha Release
- Still in development (v0.31)
- Not production-ready yet
- May have bugs
- Active testing ongoing
- Report issues to GitHub or Telegram: @marcoderossi

### Supported Chains
- Currently: Ethereum Sepolia testnet only
- Coming soon: More chains

### IPFS Providers
- **Pinata**: Easiest, recommended for beginners
- **Filecoin Pin**: Free for ERC-8004 agents
- **Local IPFS Node**: Full control, more complex

---

## 🎯 When to Use Each Test

| Test | Use Case |
|------|----------|
| `test_registration.py` | Quick agent setup, HTTP storage |
| `test_registrationIpfs.py` | Permanent agents, decentralized |
| `test_feedback.py` | Build reputation, get reviews |
| `test_search.py` | Find agents by capability |
| `test_transfer.py` | Change agent ownership |

---

## 📚 Next Steps

1. **Install SDK**: `pip install jejunetwork-agent0`
2. **Set environment variables**: RPC_URL, PRIVATE_KEY
3. **Run test_registration.py**: Create first agent
4. **Run test_feedback.py**: Build reputation
5. **Run test_search.py**: Verify discovery works
6. **Build your agent**: Use patterns from tests

---

## 🔗 Resources

- **GitHub**: github.com/JejuNetwork/agent0-py
- **Docs**: docs.jeju.network
- **OASF Spec**: agntcy/oasf
- **Report Issues**: GitHub or Telegram (@marcoderossi)

---

## 📝 Summary

The Agent0 SDK provides:
- ✅ On-chain agent identity (ERC-8004)
- ✅ Capability advertising (MCP/A2A endpoints)
- ✅ Decentralized discovery (search by skills/tools)
- ✅ Reputation system (feedback & scoring)
- ✅ Ownership management (transfer capabilities)
- ✅ IPFS integration (permanent, decentralized)

**Perfect for**: Building agent marketplaces, enabling agent cooperation, creating trust networks in agentic economies.

---

**Ready to build agents?** Start with test_registration.py! 🚀
