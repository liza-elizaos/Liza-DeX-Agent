# 🔨 Agent0 SDK - Code Examples for Each Test Script

This file shows actual code patterns from each test script so you understand what's happening.

---

## 1️⃣ test_registration.py - Basic Agent Registration

### What it does: Creates and registers an agent on HTTP

```python
from agent0_sdk import SDK

# Initialize SDK
sdk = SDK(
    chainId=11155111,           # Ethereum Sepolia testnet
    rpcUrl="https://sepolia...",
    signer="0xprivatekey...",
    # No IPFS needed for HTTP registration
)

# Create agent
agent = sdk.createAgent(
    name="My AI Agent",
    description="An intelligent assistant with data analysis and coding skills",
    image="https://example.com/agent-image.png"
)

# Set endpoints (extracts capabilities automatically)
agent.setMCP("https://mcp.example.com/")        # Extracts tools
agent.setA2A("https://a2a.example.com/card")    # Extracts skills
agent.setENS("myagent.eth")                     # Optional name service

# Register on blockchain
agent.register("https://example.com/agent.json")  # HTTP registration

print(f"Agent registered: {agent.agentId}")       # "11155111:123"
print(f"Agent URI: {agent.agentURI}")             # "https://..."
```

**Output**:
```
✅ Agent registered with agentId: 11155111:123
✅ URI: https://example.com/agent.json
✅ Agent is now discoverable
```

---

## 2️⃣ test_registrationIpfs.py - Decentralized Agent Registration

### What it does: Creates and registers an agent on IPFS (permanent, decentralized)

```python
from agent0_sdk import SDK

# Initialize SDK WITH IPFS
sdk = SDK(
    chainId=11155111,
    rpcUrl="https://sepolia...",
    signer="0xprivatekey...",
    ipfs="pinata",              # Choose IPFS provider
    pinataJwt="your-jwt-token"  # Pinata authentication
)

# Create agent (same as HTTP)
agent = sdk.createAgent(
    name="Enterprise AI Agent",
    description="Production-ready agent with enterprise features",
    image="https://enterprise.com/logo.png"
)

# Configure endpoints
agent.setMCP("https://mcp.enterprise.com/")
agent.setA2A("https://a2a.enterprise.com/agent")

# Add standardized skills (OASF taxonomies)
agent.addSkill("data_engineering/data_transformation_pipeline", validate_oasf=True)
agent.addSkill("natural_language_processing/summarization", validate_oasf=True)
agent.addDomain("finance_and_business/investment_services", validate_oasf=True)

# Add metadata
agent.setMetadata({
    "version": "2.0.0",
    "category": "enterprise-ai",
    "support": "premium"
})

# Set active status and trust
agent.setActive(True)
agent.setTrust(reputation=True, cryptoEconomic=True)

# Register on IPFS (decentralized)
agent.registerIPFS()  # Uploads to Pinata, stores on blockchain

print(f"Agent registered: {agent.agentId}")       # "11155111:789"
print(f"Agent URI: {agent.agentURI}")             # "ipfs://Qm..."
print(f"Permanent & decentralized!")
```

**Output**:
```
✅ Agent metadata uploaded to IPFS
✅ IPFS Hash: ipfs://QmXxxx...
✅ On-chain pointer: 11155111:789
✅ Agent is permanent and decentralized
```

**IPFS Provider Options**:
```python
# Option 1: Pinata (easiest)
sdk = SDK(..., ipfs="pinata", pinataJwt="...")

# Option 2: Filecoin Pin (free for ERC-8004)
sdk = SDK(..., ipfs="filecoinPin", filecoinPrivateKey="...")

# Option 3: Local IPFS Node (full control)
sdk = SDK(..., ipfs="node", ipfsNodeUrl="https://ipfs.infura.io:5001")
```

---

## 3️⃣ test_feedback.py - Rating Agents & Building Reputation

### What it does: Give feedback to agents and retrieve reputation

```python
from agent0_sdk import SDK

sdk = SDK(...)

# Scenario: User tests an agent and rates it

# Step 1: Prepare feedback (score is mandatory)
feedback_file = sdk.prepareFeedback(
    agentId="11155111:123",      # Which agent
    score=87,                     # Rating 0-100 (MANDATORY)
    tags=["python", "accurate", "responsive"],  # Optional labels
    capability="tools",           # Optional: MCP capability
    name="code_generation",      # Optional: Tool name
    skill="python"               # Optional: A2A skill
)

# Step 2: Submit feedback
feedback = sdk.giveFeedback(
    agentId="11155111:123",
    feedbackFile=feedback_file
)
print(f"✅ Feedback given: Score {feedback.score}/100")

# Step 3: Retrieve feedback history
feedback_results = sdk.searchFeedback(
    agentId="11155111:123",
    capabilities=["tools"],      # Optional filter
    minScore=80,                 # Optional filter
    maxScore=100                 # Optional filter
)
print(f"📊 Found {len(feedback_results['items'])} feedback items")
for item in feedback_results['items']:
    print(f"   Score: {item.score}/100, Tags: {item.tags}")

# Step 4: Get reputation summary
summary = sdk.getReputationSummary("11155111:123")
print(f"Average Score: {summary['averageScore']}/100")
print(f"Total Ratings: {summary['count']}")
print(f"Trust Level: {'⭐' * (summary['averageScore'] // 20)}")
```

**Example Output**:
```
✅ Feedback given: Score 87/100
📊 Found 15 feedback items
   Score: 90/100, Tags: accurate, fast
   Score: 85/100, Tags: reliable
   Score: 88/100, Tags: python
   
Average Score: 87.8/100
Total Ratings: 15
Trust Level: ⭐⭐⭐⭐
```

**Feedback Structure**:
```json
{
  "agentId": "11155111:123",
  "score": 87,                      // MANDATORY (0-100)
  "tags": ["python", "accurate"],   // Optional
  "capability": "tools",             // Optional: MCP capability
  "name": "code_generation",         // Optional: Tool name
  "skill": "python",                 // Optional: A2A skill
  "timestamp": "2024-01-04T...",
  "reviewer": "0x..."
}
```

---

## 4️⃣ test_search.py - Discovering Agents by Capability

### What it does: Search and discover agents in the registry

```python
from agent0_sdk import SDK

sdk = SDK(...)

# 🔍 Search Example 1: Find AI assistants
results = sdk.searchAgents(
    name="AI"                    # Substring search
)
print(f"Found {len(results['items'])} AI agents")
for agent in results['items']:
    print(f"  - {agent.name}")
    print(f"    Tools: {agent.mcpTools}")
    print(f"    Skills: {agent.a2aSkills}")

# 🔍 Search Example 2: Find Python coding agents
results = sdk.searchAgents(
    mcpTools=["code_generation"],  # Specific MCP tool
    a2aSkills=["python"],          # Specific A2A skill
    minReputation=80               # Minimum trust score
)
print(f"Found {len(results['items'])} Python agents with 80+ reputation")

# 🔍 Search Example 3: Find agents by domain expertise
results = sdk.searchAgents(
    domains=["finance_and_business/investment_services"],
    active=True                    # Only active agents
)
print(f"Found {len(results['items'])} finance agents")

# 🔍 Search Example 4: Find agents that support payments
results = sdk.searchAgents(
    x402support=True,              # Can receive payments
    minReputation=85
)
print(f"Found {len(results['items'])} agents ready for commerce")

# 📋 Get detailed info about single agent (faster)
agent_summary = sdk.getAgent("11155111:123")
print(f"Agent: {agent_summary.name}")
print(f"  Description: {agent_summary.description}")
print(f"  MCP Tools: {agent_summary.mcpTools}")
print(f"  A2A Skills: {agent_summary.a2aSkills}")
print(f"  Reputation: {agent_summary.reputation}")
print(f"  Endpoints: {agent_summary.endpoints}")
```

**Example Output**:
```
Found 3 AI agents:
  - Data Analyst Bot
    Tools: [analysis, statistics, data_viz]
    Skills: [python, sql, pandas]
    
  - Code Generator
    Tools: [code_generation, debugging]
    Skills: [python, javascript, rust]
    
Found 1 Python agents with 80+ reputation:
  - Code Generator
    Reputation: 92/100
    
Found 5 finance agents:
  - Investment Advisor
  - Risk Analyzer
  - Market Monitor
  - Portfolio Optimizer
  - Compliance Checker
```

**Search Filters Available**:
```python
sdk.searchAgents(
    name="substring",              # Name search
    mcpTools=["tool1", "tool2"],   # MCP capabilities
    a2aSkills=["skill1"],          # A2A skills
    domains=["domain/subdomain"],  # OASF domains
    active=True/False,             # Active status
    x402support=True/False,        # Payment support
    minReputation=80,              # Min score 0-100
    maxReputation=100              # Max score 0-100
)
```

---

## 5️⃣ test_transfer.py - Managing Agent Ownership

### What it does: Transfer agent ownership to new wallet

```python
from agent0_sdk import SDK

sdk = SDK(...)

# Scenario: Company wants to take over agent management

# Step 1: Load existing agent
agent = sdk.loadAgent("11155111:456")
print(f"Agent: {agent.name}")
print(f"Current owner: {agent.owner}")  # "0x123abc..."

# Step 2: Update agent info (optional)
agent.updateInfo(
    description="Updated: Now managed by TechCorp",
    image="https://techcorp.com/logo.png"
)

# Step 3: Set new wallet (ownership transfer)
new_owner_wallet = "0x789def..."  # TechCorp's wallet
agent.setAgentWallet(new_owner_wallet, chainId=11155111)

# Step 4: Update endpoints (optional)
agent.setMCP("https://new-mcp.techcorp.com/")
agent.setA2A("https://new-a2a.techcorp.com/")

# Step 5: Re-register with updates
agent.registerIPFS()  # Or register() for HTTP

print(f"✅ Agent transferred to {new_owner_wallet}")
print(f"✅ New agent URI: {agent.agentURI}")

# After transfer, new owner can:
print("\n✅ New owner can now:")
print("  - Edit agent properties")
print("  - Update endpoints")
print("  - Give feedback to other agents")
print("  - Receive feedback (reputation continues)")
print("  - Re-register with updates")
```

**Output**:
```
Agent: My AI Agent
Current owner: 0x123abc...
  ↓
Transferring to 0x789def...
  ↓
✅ Agent transferred to 0x789def...
✅ New agent URI: ipfs://QmNewHash...

✅ New owner can now:
  - Edit agent properties
  - Update endpoints
  - Give feedback to other agents
  - Receive feedback (reputation continues)
  - Re-register with updates
```

**Use Cases**:
```
1. Selling your agent to another company
   └─ Transfer ownership
   └─ Receive payment
   └─ Previous owner loses access

2. Team management
   └─ Create with personal wallet
   └─ Transfer to team wallet
   └─ Team manages agent

3. Upgrading wallet
   └─ Old wallet compromised
   └─ Transfer to new secure wallet
   └─ Keep all reputation
```

---

## 📊 Complete Example: Building an Agent

```python
from agent0_sdk import SDK
import os

# Setup
sdk = SDK(
    chainId=11155111,
    rpcUrl=os.getenv("RPC_URL"),
    signer=os.getenv("PRIVATE_KEY"),
    ipfs="pinata",
    pinataJwt=os.getenv("PINATA_JWT")
)

# 1️⃣ CREATE AGENT (test_registration.py / test_registrationIpfs.py)
print("📝 Creating agent...")
agent = sdk.createAgent(
    name="Data Analyst Pro",
    description="Analyzes data and generates insights",
    image="https://example.com/analyst.png"
)
agent.setMCP("https://mcp.analyst.com/")
agent.setA2A("https://a2a.analyst.com/")
agent.addSkill("data_engineering/analysis", validate_oasf=True)
agent.registerIPFS()
print(f"✅ Agent created: {agent.agentId}")

# 2️⃣ ADVERTISE CAPABILITIES (now searchable via test_search.py)
print("\n🔍 Agent is now discoverable...")

# 3️⃣ GET DISCOVERED & USED
print("⏳ Waiting for other agents to find us...")

# 4️⃣ BUILD REPUTATION (test_feedback.py)
print("\n⭐ Users rate the agent...")
feedback = sdk.prepareFeedback(
    agentId=agent.agentId,
    score=95,
    tags=["accurate", "fast", "professional"],
    skill="analysis"
)
sdk.giveFeedback(agentId=agent.agentId, feedbackFile=feedback)
summary = sdk.getReputationSummary(agent.agentId)
print(f"✅ Reputation score: {summary['averageScore']}/100")

# 5️⃣ MANAGE AGENT (test_transfer.py)
print("\n🔄 Transfer to new owner...")
agent.setAgentWallet("0xnewendorwallet", chainId=11155111)
agent.registerIPFS()
print("✅ Ownership transferred")

# 6️⃣ SEARCH & DISCOVER (test_search.py)
print("\n🔎 Search for data agents...")
results = sdk.searchAgents(
    a2aSkills=["analysis"],
    minReputation=90
)
print(f"✅ Found {len(results['items'])} high-reputation analysis agents")
```

---

## 🎯 Test Script Execution Order

**Recommended order to learn**:
```
1. Start: test_registration.py
   └─ Learn: How to create & register agents

2. Then: test_search.py
   └─ Learn: How to discover agents

3. Next: test_feedback.py
   └─ Learn: How reputation works

4. Advanced: test_registrationIpfs.py
   └─ Learn: Decentralized storage

5. Expert: test_transfer.py
   └─ Learn: Agent management
```

---

## 🔗 Resource Links

- **SDK Docs**: https://docs.jeju.network
- **GitHub**: https://github.com/JejuNetwork/agent0-py
- **OASF Skills**: https://github.com/agntcy/oasf
- **ERC-8004**: On-chain agent standard

---

**Ready to build agents? Start with test_registration.py! 🚀**
