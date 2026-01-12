import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

// Types
interface TokenDataType {
  name: string;
  symbol: string;
  description: string;
  website: string;
  twitter: string;
  discord: string;
  image: File | null;
  imagePreview: string;
}

interface EstimatedFeesType {
  marketCap: number;
  totalFee: number;
  creatorFee: number;
  protocolFee: number;
  lpFee: number;
  blockchainCost: number;
  yourChargeSOL: number;
  totalCostSOL: number;
}

interface LaunchStatusType {
  success: boolean;
  error?: string;
  mint?: string;
  tx?: string;
  explorerUrl?: string;
}

/**
 * Token Launch Platform - Multi-step form with fee calculation
 * Integrated with AutoFun bonding curve
 */

export default function TokenLaunchApp() {
  const { connected, publicKey } = useWallet();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tokenData, setTokenData] = useState<TokenDataType>({
    name: '',
    symbol: '',
    description: '',
    website: '',
    twitter: '',
    discord: '',
    image: null,
    imagePreview: '',
  });
  const [estimatedFees, setEstimatedFees] = useState<EstimatedFeesType | null>(null);
  const [launchStatus, setLaunchStatus] = useState<LaunchStatusType | null>(null);

  const totalSteps = 6;

  // Handle input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.currentTarget;
    setTokenData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image upload
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTokenData(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
    }
  };

  // Calculate fees based on market cap tiers
  const calculateFees = () => {
    // Initial market cap at launch = 28 SOL (AutoFun standard)
    const initialMarketCap = 28;
    
    const feeStructure = [
      { min: 0, max: 420, creator: 0.300, protocol: 0.930, lp: 0.020 },
      { min: 420, max: 1470, creator: 0.950, protocol: 0.050, lp: 0.200 },
      { min: 1470, max: 2460, creator: 0.900, protocol: 0.050, lp: 0.200 },
      { min: 2460, max: 3440, creator: 0.850, protocol: 0.050, lp: 0.200 },
      { min: 3440, max: 4420, creator: 0.800, protocol: 0.050, lp: 0.200 },
      { min: 4420, max: 9820, creator: 0.750, protocol: 0.050, lp: 0.200 },
      { min: 9820, max: 14740, creator: 0.700, protocol: 0.050, lp: 0.200 },
      { min: 14740, max: 19650, creator: 0.650, protocol: 0.050, lp: 0.200 },
      { min: 19650, max: 24560, creator: 0.600, protocol: 0.050, lp: 0.200 },
      { min: 24560, max: 29470, creator: 0.550, protocol: 0.050, lp: 0.200 },
      { min: 29470, max: 34380, creator: 0.500, protocol: 0.050, lp: 0.200 },
      { min: 34380, max: 39300, creator: 0.450, protocol: 0.050, lp: 0.200 },
      { min: 39300, max: 44210, creator: 0.400, protocol: 0.050, lp: 0.200 },
      { min: 44210, max: 49120, creator: 0.350, protocol: 0.050, lp: 0.200 },
      { min: 49120, max: 54030, creator: 0.300, protocol: 0.050, lp: 0.200 },
      { min: 54030, max: 58940, creator: 0.275, protocol: 0.050, lp: 0.200 },
      { min: 58940, max: 63860, creator: 0.250, protocol: 0.050, lp: 0.200 },
      { min: 63860, max: 68770, creator: 0.225, protocol: 0.050, lp: 0.200 },
      { min: 68770, max: 73681, creator: 0.200, protocol: 0.050, lp: 0.200 },
      { min: 73681, max: 78590, creator: 0.175, protocol: 0.050, lp: 0.200 },
      { min: 78590, max: 83500, creator: 0.150, protocol: 0.050, lp: 0.200 },
      { min: 83500, max: 88400, creator: 0.125, protocol: 0.050, lp: 0.200 },
      { min: 88400, max: 93330, creator: 0.100, protocol: 0.050, lp: 0.200 },
      { min: 93330, max: 98240, creator: 0.075, protocol: 0.050, lp: 0.200 },
      { min: 98240, max: Infinity, creator: 0.050, protocol: 0.050, lp: 0.200 },
    ];

    // Find tier for initial market cap
    const tier = feeStructure.find(t => initialMarketCap >= t.min && initialMarketCap < t.max);
    
    if (tier) {
      const blockchainCost = 0.0086; // SOL
      const yourChargePercent = 0.02; // 0.02%
      
      setEstimatedFees({
        marketCap: initialMarketCap,
        blockchainCost: blockchainCost,
        creatorFee: tier.creator,
        protocolFee: tier.protocol,
        lpFee: tier.lp,
        totalFee: tier.creator + tier.protocol + tier.lp,
        yourChargeSOL: (blockchainCost * yourChargePercent) / 100,
        totalCostSOL: blockchainCost + ((blockchainCost * yourChargePercent) / 100)
      });
    }
  };

  // Step 1: Basic Info
  const StepBasicInfo = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6">Step 1: Token Basics</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Token Name</label>
        <input
          type="text"
          name="name"
          value={tokenData.name}
          onChange={handleInputChange}
          placeholder="e.g., SafeMoon"
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          maxLength={32}
        />
        <p className="text-xs text-gray-400 mt-1">{tokenData.name.length}/32 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Token Symbol</label>
        <input
          type="text"
          name="symbol"
          value={tokenData.symbol.toUpperCase()}
          onChange={(e) => setTokenData({...tokenData, symbol: e.target.value})}
          placeholder="e.g., SAFE"
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          maxLength={10}
        />
        <p className="text-xs text-gray-400 mt-1">{tokenData.symbol.length}/10 characters</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <textarea
          name="description"
          value={tokenData.description}
          onChange={handleInputChange}
          placeholder="What is your token about?"
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          rows={4}
          maxLength={500}
        />
        <p className="text-xs text-gray-400 mt-1">{tokenData.description.length}/500 characters</p>
      </div>

      <button
        onClick={() => {
          if (tokenData.name && tokenData.symbol && tokenData.description) {
            setStep(2);
          }
        }}
        disabled={!tokenData.name || !tokenData.symbol || !tokenData.description}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        Next: Add Links
      </button>
    </div>
  );

  // Step 2: Links
  const StepLinks = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6">Step 2: Links & Social</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Website (Optional)</label>
        <input
          type="url"
          name="website"
          value={tokenData.website}
          onChange={handleInputChange}
          placeholder="https://example.com"
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Twitter/X (Optional)</label>
        <input
          type="text"
          name="twitter"
          value={tokenData.twitter}
          onChange={handleInputChange}
          placeholder="@yourhandle"
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Discord (Optional)</label>
        <input
          type="url"
          name="discord"
          value={tokenData.discord}
          onChange={handleInputChange}
          placeholder="https://discord.gg/..."
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setStep(1)}
          className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700"
        >
          Back
        </button>
        <button
          onClick={() => setStep(3)}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
        >
          Next: Upload Logo
        </button>
      </div>
    </div>
  );

  // Step 3: Image
  const StepImage = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6">Step 3: Token Logo</h2>
      
      <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="cursor-pointer block">
          {tokenData.imagePreview ? (
            <img src={tokenData.imagePreview} alt="Preview" className="w-32 h-32 mx-auto rounded-lg object-cover mb-4" />
          ) : (
            <div className="text-gray-400 py-8">
              <p className="text-lg">📸 Click to upload logo</p>
              <p className="text-sm mt-2">PNG, JPG (max 5MB)</p>
            </div>
          )}
        </label>
      </div>

      {tokenData.imagePreview && (
        <button
          onClick={() => setTokenData({...tokenData, image: null, imagePreview: ''})}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
        >
          Change Image
        </button>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setStep(2)}
          className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700"
        >
          Back
        </button>
        <button
          onClick={() => {
            calculateFees();
            setStep(4);
          }}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
        >
          Next: Review Fees
        </button>
      </div>
    </div>
  );

  // Step 4: Fee Preview
  const StepFees = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6">Step 4: Fee Structure</h2>
      
      {estimatedFees && (
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-xs text-gray-400">Initial Market Cap</p>
              <p className="text-xl font-bold text-white">{estimatedFees.marketCap} SOL</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-xs text-gray-400">Total Trade Fee</p>
              <p className="text-xl font-bold text-white">{estimatedFees.totalFee.toFixed(2)}%</p>
            </div>
          </div>

          <div className="space-y-3 border-t border-gray-700 pt-4">
            <div className="flex justify-between">
              <span className="text-gray-300">Creator Fee</span>
              <span className="text-green-400">{estimatedFees.creatorFee.toFixed(3)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Protocol Fee</span>
              <span className="text-blue-400">{estimatedFees.protocolFee.toFixed(3)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">LP Fee</span>
              <span className="text-yellow-400">{estimatedFees.lpFee.toFixed(3)}%</span>
            </div>
          </div>

          <div className="space-y-3 border-t border-gray-700 pt-4 bg-gray-900 p-4 rounded-lg">
            <p className="text-sm font-semibold text-gray-300">Launch Costs:</p>
            <div className="flex justify-between">
              <span className="text-gray-300">Blockchain Cost</span>
              <span className="text-white">{estimatedFees.blockchainCost} SOL (~$1.50)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Platform Fee (0.02%)</span>
              <span className="text-white">{estimatedFees.yourChargeSOL.toFixed(6)} SOL</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-700">
              <span className="text-lg font-bold text-white">Total Cost</span>
              <span className="text-lg font-bold text-green-400">{estimatedFees.totalCostSOL.toFixed(6)} SOL</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 p-3 bg-gray-900 rounded-lg">
            ℹ️ Creator fees are claimable via /claim command. Protocol fees go to protocol wallet. LP fees go to liquidity pool.
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setStep(3)}
          className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700"
        >
          Back
        </button>
        <button
          onClick={() => setStep(5)}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
        >
          Next: Preview
        </button>
      </div>
    </div>
  );

  // Step 5: Preview
  const StepPreview = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6">Step 5: Preview</h2>
      
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-8 border border-gray-700">
        <div className="flex flex-col items-center text-center space-y-4">
          {tokenData.imagePreview && (
            <img src={tokenData.imagePreview} alt={tokenData.name} className="w-24 h-24 rounded-full object-cover" />
          )}
          <div>
            <h3 className="text-3xl font-bold text-white">{tokenData.name}</h3>
            <p className="text-2xl font-semibold text-gray-300">{tokenData.symbol}</p>
          </div>
          
          <p className="text-gray-300 max-w-md">{tokenData.description}</p>

          <div className="flex gap-3 justify-center flex-wrap">
            {tokenData.website && (
              <a href={tokenData.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                🌐 Website
              </a>
            )}
            {tokenData.twitter && (
              <a href={`https://twitter.com/${tokenData.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                𝕏 Twitter
              </a>
            )}
            {tokenData.discord && (
              <a href={tokenData.discord} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                💬 Discord
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setStep(4)}
          className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700"
        >
          Back
        </button>
        <button
          onClick={() => setStep(6)}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
        >
          Next: Launch
        </button>
      </div>
    </div>
  );

  // Step 6: Launch
  const StepLaunch = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6">Step 6: Launch Token</h2>
      
      <div className="bg-blue-900 border border-blue-600 rounded-lg p-6 space-y-4">
        <div>
          <p className="text-sm text-gray-300 mb-2">Wallet: {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}</p>
          <p className="text-sm text-gray-300">Estimated Cost: {estimatedFees?.totalCostSOL.toFixed(6)} SOL</p>
        </div>

        <button
          onClick={async () => {
            setLoading(true);
            try {
              const response = await fetch('/model/token-create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: tokenData.name,
                  symbol: tokenData.symbol,
                  description: tokenData.description,
                  website: tokenData.website,
                  twitter: tokenData.twitter,
                  discord: tokenData.discord,
                  imageUrl: tokenData.imagePreview,
                  creatorWallet: publicKey?.toBase58(),
                })
              });

              const result = await response.json();
              
              if (result.success) {
                setLaunchStatus({
                  success: true,
                  mint: result.mint,
                  tx: result.transaction,
                  explorerUrl: `https://solscan.io/token/${result.mint}`
                });
                setStep(7);
              } else {
                setLaunchStatus({
                  success: false,
                  error: result.error
                });
              }
            } catch (err) {
              setLaunchStatus({
                success: false,
                error: err.message
              });
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="w-full px-6 py-4 bg-green-600 text-white text-lg font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {loading ? '🚀 Launching...' : '🚀 Launch Token'}
        </button>

        {launchStatus && !launchStatus.success && (
          <div className="bg-red-900 border border-red-600 rounded-lg p-4">
            <p className="text-red-200">Error: {launchStatus.error}</p>
          </div>
        )}
      </div>

      <button
        onClick={() => setStep(5)}
        className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700"
      >
        Back
      </button>
    </div>
  );

  // Step 7: Success
  const StepSuccess = () => (
    <div className="space-y-4 text-center">
      <h2 className="text-3xl font-bold text-white mb-6">🎉 Token Launched!</h2>
      
      {launchStatus?.success && (
        <div className="bg-green-900 border border-green-600 rounded-lg p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-300">Mint Address:</p>
            <p className="text-lg font-mono text-green-400 break-all">{launchStatus.mint}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-300">Transaction:</p>
            <p className="text-sm font-mono text-green-400 break-all">{launchStatus.tx}</p>
          </div>

          <div className="flex gap-2 pt-4">
            <a href={launchStatus.explorerUrl} target="_blank" rel="noopener noreferrer" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
              View on Solscan
            </a>
            <a href={`https://auto.fun/token/${launchStatus.mint}`} target="_blank" rel="noopener noreferrer" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
              View on AutoFun
            </a>
          </div>

          <p className="text-sm text-gray-300 pt-4 border-t border-gray-700">
            💡 You can now claim your creator fees anytime using the /claim command in Liza!
          </p>
        </div>
      )}

      <button
        onClick={() => {
          setStep(1);
          setTokenData({
            name: '',
            symbol: '',
            description: '',
            website: '',
            twitter: '',
            discord: '',
            image: null,
            imagePreview: '',
          });
          setLaunchStatus(null);
        }}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
      >
        Launch Another Token
      </button>
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🚀 AutoFun Token Launcher</h1>
          <p className="text-gray-400">Create your token in 6 simple steps</p>
          <div className="mt-4">
            <WalletMultiButton />
          </div>
        </div>

        {/* Not connected */}
        {!connected && (
          <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-6 text-center">
            <p className="text-yellow-200">Connect your Phantom wallet to launch tokens</p>
          </div>
        )}

        {/* Connected - Show steps */}
        {connected && (
          <>
            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                {[1, 2, 3, 4, 5, 6].map(s => (
                  <div
                    key={s}
                    className={`flex-1 h-2 mx-1 rounded-full ${
                      s <= step ? 'bg-blue-600' : 'bg-gray-700'
                    }`}
                  />
                ))}
              </div>
              <p className="text-center text-gray-400 text-sm">Step {step}/{totalSteps}</p>
            </div>

            {/* Step content */}
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
              {step === 1 && <StepBasicInfo />}
              {step === 2 && <StepLinks />}
              {step === 3 && <StepImage />}
              {step === 4 && <StepFees />}
              {step === 5 && <StepPreview />}
              {step === 6 && <StepLaunch />}
              {step === 7 && <StepSuccess />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
