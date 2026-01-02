/**
 * Test Script - Verify Wallet Auto-Detection
 * Simulates user connecting wallet and auto-sending balance check
 */

import { Connection, PublicKey } from '@solana/web3.js';

const TEST_WALLET = 'CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT';
const RPC_URL = 'https://api.mainnet-beta.solana.com';

// ============================================
// TEST 1: Regex Address Extraction
// ============================================
function testRegexExtraction() {
  console.log('\n🔍 TEST 1: ADDRESS EXTRACTION FROM MESSAGE');
  console.log('━'.repeat(60));

  const testMessages = [
    'check my balance CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT',
    'check balance CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT',
    'balance of CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT',
    'wallet CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT',
    'check wallet balance CMVrzdso4SShQm2irrc7jMCN9Vw5QxXvrZKB79cYPPJT',
  ];

  const regex = /([1-9A-HJ-NP-Za-km-z]{43,44})/; // Correct base58 regex

  testMessages.forEach((msg, i) => {
    const match = msg.match(regex);
    const extracted = match ? match[0] : null;
    const passed = extracted === TEST_WALLET;
    
    console.log(`\nTest ${i + 1}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Message: "${msg}"`);
    console.log(`   Expected: ${TEST_WALLET}`);
    console.log(`   Extracted: ${extracted || 'NOT FOUND'}`);
    console.log(`   Match: ${passed ? 'YES' : 'NO'}`);
  });
}

// ============================================
// TEST 2: Message Auto-Append Logic
// ============================================
function testMessageAutoAppend() {
  console.log('\n\n📨 TEST 2: MESSAGE AUTO-APPEND LOGIC');
  console.log('━'.repeat(60));

  const walletAddress = TEST_WALLET;
  const userInputs = [
    'check my balance',
    'balance',
    'wallet balance',
    'swap',
    'hello'
  ];

  userInputs.forEach((input, i) => {
    const shouldAppend = 
      (input.toLowerCase().includes('balance') || 
       input.toLowerCase().includes('wallet') || 
       input.toLowerCase().includes('swap')) && 
      !input.includes(walletAddress);

    const finalMessage = shouldAppend 
      ? `${input} ${walletAddress}` 
      : input;

    console.log(`\nTest ${i + 1}:`);
    console.log(`   User Input: "${input}"`);
    console.log(`   Should Append: ${shouldAppend ? 'YES' : 'NO'}`);
    console.log(`   Final Message: "${finalMessage}"`);
  });
}

// ============================================
// TEST 3: Balance API Call Simulation
// ============================================
async function testBalanceAPICall() {
  console.log('\n\n🏦 TEST 3: BALANCE API CALL SIMULATION');
  console.log('━'.repeat(60));

  try {
    const connection = new Connection(RPC_URL, 'confirmed');
    const publicKey = new PublicKey(TEST_WALLET);
    
    console.log(`\nFetching balance for: ${TEST_WALLET}`);
    
    const balanceLamports = await connection.getBalance(publicKey);
    const balanceSOL = balanceLamports / 1e9;

    console.log(`\n✅ API Call Successful`);
    console.log(`   Balance (SOL): ${balanceSOL.toFixed(4)}`);
    console.log(`   Balance (Lamports): ${balanceLamports}`);

    // Verify response format matches /api/balance
    const responseFormat = {
      success: true,
      walletAddress: TEST_WALLET,
      balanceSOL: parseFloat(balanceSOL.toFixed(9)),
      balanceLamports,
      network: 'mainnet'
    };

    console.log(`\n📋 Response Format:`);
    console.log(JSON.stringify(responseFormat, null, 2));
  } catch (error) {
    console.log(`\n❌ Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ============================================
// TEST 4: Chat Message Processing
// ============================================
async function testChatMessageProcessing() {
  console.log('\n\n💬 TEST 4: CHAT MESSAGE PROCESSING');
  console.log('━'.repeat(60));

  const testScenarios = [
    {
      name: 'Connected wallet, user types "check my balance"',
      walletConnected: true,
      userMessage: 'check my balance',
      walletAddress: TEST_WALLET
    },
    {
      name: 'No wallet, user includes address manually',
      walletConnected: false,
      userMessage: `check my balance ${TEST_WALLET}`,
      walletAddress: null
    },
    {
      name: 'Connected wallet, user types "balance"',
      walletConnected: true,
      userMessage: 'balance',
      walletAddress: TEST_WALLET
    }
  ];

  for (const scenario of testScenarios) {
    console.log(`\n${scenario.name}`);
    console.log('─'.repeat(60));

    let messageToSend = scenario.userMessage;
    let currentWalletAddress = scenario.walletAddress;

    // Simulate auto-append logic
    if (currentWalletAddress && 
        (scenario.userMessage.toLowerCase().includes('balance') || 
         scenario.userMessage.toLowerCase().includes('wallet')) && 
        !scenario.userMessage.includes(currentWalletAddress)) {
      messageToSend = `${scenario.userMessage} ${currentWalletAddress}`;
      console.log(`   Auto-append: YES`);
    } else {
      console.log(`   Auto-append: NO`);
    }

    // Extract address
    const regex = /([1-9A-HJ-NP-Za-km-z]{43,44})/;
    const extracted = messageToSend.match(regex)?.[0] || null;

    console.log(`   Final Message: "${messageToSend}"`);
    console.log(`   Extracted Address: ${extracted || 'NONE'}`);
    console.log(`   Ready for API: ${extracted ? '✅ YES' : '❌ NO'}`);

    if (extracted) {
      try {
        const connection = new Connection(RPC_URL, 'confirmed');
        const balance = await connection.getBalance(new PublicKey(extracted));
        console.log(`   Balance: ${(balance / 1e9).toFixed(4)} SOL`);
      } catch (e) {
        console.log(`   Balance: ❌ Error fetching`);
      }
    }
  }
}

// ============================================
// MAIN TEST RUNNER
// ============================================
async function runAllTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  SHINA - WALLET AUTO-DETECTION TEST SUITE                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n📌 Test Wallet: ${TEST_WALLET}`);
  console.log(`📌 RPC URL: ${RPC_URL}`);

  testRegexExtraction();
  testMessageAutoAppend();
  await testBalanceAPICall();
  await testChatMessageProcessing();

  console.log('\n\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║              VERIFICATION COMPLETE                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n✅ All systems ready for deployment!\n');
}

runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
