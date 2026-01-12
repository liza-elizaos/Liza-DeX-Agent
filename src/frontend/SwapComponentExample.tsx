import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { signAndSendBase64Tx } from './phantom-sign-and-send';

/**
 * Example React component showing how to:
 * 1. Call the swap API
 * 2. Detect if response contains unsigned base64 transaction
 * 3. Sign with Phantom wallet
 * 4. Submit to Solana RPC
 */
export function SwapComponent() {
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSwap() {
    if (!wallet.connected || !wallet.publicKey) {
      setResult('Please connect your Phantom wallet first');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // 1. Call your swap API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'user-' + wallet.publicKey.toBase58(),
          message: 'swap 0.01 USDC for SOL',
          context: 'trading',
          walletPublicKey: wallet.publicKey.toBase58(), // Pass user's connected wallet
        }),
      });

      const data = await response.json();
      console.log('API Response:', data);

      // 2. Check if response contains swap object with transactionBase64
      if (data.response?.includes('pending_signature')) {
        // This means the API returned an unsigned transaction
        // Parse from the response or check if it's in a structured format
        
        // If your API returns structured JSON (recommended):
        // const swapData = JSON.parse(data.response);
        // if (swapData.swap?.transactionBase64) { ... }
        
        // For now, assuming you enhance the API to return:
        // { success: true, swap: { transactionBase64: "...", ... } }
        
        setResult('Swap transaction prepared. Please sign with Phantom...');

        // 3. Sign and submit the unsigned transaction
        try {
          const txHash = await signAndSendBase64Tx(
            data.swap.transactionBase64,
            wallet
          );
          setResult(`✅ Swap successful!\nTx: ${txHash}`);
        } catch (signError) {
          setResult(`❌ Failed to sign/submit: ${signError instanceof Error ? signError.message : String(signError)}`);
        }
      } else if (data.response?.includes('Swap Successful')) {
        // Server auto-signed (only if wallet matches server key)
        setResult(data.response);
      } else {
        // Other response
        setResult(data.response || 'Unknown response');
      }
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Solana Token Swap</h2>
      <p>Wallet: {wallet.connected ? wallet.publicKey?.toBase58().slice(0, 8) + '...' : 'Not connected'}</p>
      <button onClick={handleSwap} disabled={!wallet.connected || loading}>
        {loading ? 'Processing...' : 'Swap 0.01 USDC for SOL'}
      </button>
      {result && <pre style={{ marginTop: '20px', whiteSpace: 'pre-wrap' }}>{result}</pre>}
    </div>
  );
}
