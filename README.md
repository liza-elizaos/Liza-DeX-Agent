# LIZA - Autonomous Solana AI Assistant for elizaOS

LIZA is a powerful autonomous AI agent for the elizaOS framework that provides comprehensive Solana blockchain integration and token management capabilities.

## Features

### 🚀 Core Capabilities
- **Token Launch** - Launch tokens on AutoFun bonding curves with automatic Raydium graduation
- **Swap Trading** - Execute token swaps via Jupiter Protocol with real-time price feeds
- **Portfolio Management** - Real-time wallet portfolio analysis with multi-token valuations
- **Creator Rewards** - Automated fee claiming and creator reward distribution system
- **Market Intelligence** - Trend detection and market analysis for tokens

### 🛠️ Technical Stack
- **elizaOS v1.7.0** - AI agent framework with plugin architecture
- **Solana Web3.js** - Blockchain interaction and wallet management
- **AutoFun SDK** - Bonding curve token launches
- **Jupiter Protocol** - DEX aggregation and token swaps
- **TypeScript** - Full type safety with strict mode
- **Vercel** - Serverless API backend
- **React** - Modern frontend UI with Tailwind CSS

## Getting Started

### Prerequisites
- Node.js 18+
- npm or bun
- Solana wallet with test/devnet SOL
- Environment variables configured

### Installation

```bash
# Clone repository
git clone https://github.com/liza-elizaos/liza.git
cd liza

# Install dependencies
npm install

# Build project
npm run build

# Start development server
npm run dev
```

### Environment Configuration

Create `.env.local` with:
```
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_PRIVATE_KEY=your_base58_encoded_key
SOLANA_PUBLIC_KEY=your_wallet_address
HELIUS_RPC_URL=your_helius_rpc_endpoint
API_BASE_URL=http://localhost:3001
```

## API Endpoints

### Token Management
- `POST /api/token-create` - Create new SPL token
- `POST /api/token-launch` - Launch token on AutoFun
- `POST /api/token-buy` - Execute token purchase

### Portfolio
- `GET /api/portfolio?wallet={address}` - Get wallet portfolio
- `POST /api/portfolio-analytics` - Detailed portfolio analysis

### Creator
- `GET /api/creator-rewards?wallet={address}` - Get creator rewards
- `POST /api/claim-rewards` - Claim accumulated rewards

## Building & Deployment

```bash
# Development
npm run dev

# Production build
npm run build

# Type checking
npm run type-check

# Format code
npm run format
```

## Deployment

### Vercel
```bash
npm run build
vercel deploy
```

Set environment variables in Vercel dashboard for:
- `SOLANA_RPC_URL`
- `SOLANA_PRIVATE_KEY`
- `SOLANA_PUBLIC_KEY`
- `HELIUS_API_KEY`

## Testing

ElizaOS employs a dual testing strategy:

1. **Component Tests** (`src/__tests__/*.test.ts`)

   - Run with Bun's native test runner
   - Fast, isolated tests using mocks
   - Perfect for TDD and component logic

2. **E2E Tests** (`src/__tests__/e2e/*.e2e.ts`)
   - Run with ElizaOS custom test runner
   - Real runtime with actual database (PGLite)
   - Test complete user scenarios

### Test Structure

```
src/
  __tests__/              # All tests live inside src
    *.test.ts            # Component tests (use Bun test runner)
    e2e/                 # E2E tests (use ElizaOS test runner)
      project-starter.e2e.ts  # E2E test suite
      README.md          # E2E testing documentation
  index.ts               # Export tests here: tests: [ProjectStarterTestSuite]
```

### Running Tests

- `elizaos test` - Run all tests (component + e2e)
- `elizaos test component` - Run only component tests
- `elizaos test e2e` - Run only E2E tests

### Writing Tests

Component tests use bun:test:

```typescript
// Unit test example (__tests__/config.test.ts)
describe('Configuration', () => {
  it('should load configuration correctly', () => {
    expect(config.debug).toBeDefined();
  });
});

// Integration test example (__tests__/integration.test.ts)
describe('Integration: Plugin with Character', () => {
  it('should initialize character with plugins', async () => {
    // Test interactions between components
  });
});
```

E2E tests use ElizaOS test interface:

```typescript
// E2E test example (e2e/project.test.ts)
export class ProjectTestSuite implements TestSuite {
  name = 'project_test_suite';
  tests = [
    {
      name: 'project_initialization',
      fn: async (runtime) => {
        // Test project in a real runtime
      },
    },
  ];
}

export default new ProjectTestSuite();
```

The test utilities in `__tests__/utils/` provide helper functions to simplify writing tests.

## Configuration

Customize your project by modifying:

- `src/index.ts` - Main entry point
- `src/character.ts` - Character definition
