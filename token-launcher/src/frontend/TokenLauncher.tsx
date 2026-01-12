import React, { useState } from 'react';
import '../styles/launcher.css';

interface LaunchResponse {
  status: 'success' | 'rejected' | 'error';
  message: string;
  trendConfidence: number;
  trendVerdict?: 'hot' | 'neutral' | 'dead';
  trendReasoning?: string;
  token?: {
    name: string;
    symbol: string;
    lore: string;
    mint: string;
    tx: string;
    tags: string[];
  };
}

export default function TokenLauncher() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [idea, setIdea] = useState('');
  const [tone, setTone] = useState('degen');
  const [symbolHint, setSymbolHint] = useState('');
  const [notes, setNotes] = useState('');
  const [devBuySol, setDevBuySol] = useState(0.5);
  const [override, setOverride] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LaunchResponse | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!image) {
      alert('❌ Please select an image');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();

      formData.append(
        'userPrompt',
        JSON.stringify({
          idea,
          tone,
          symbolHint,
          notes,
        })
      );

      formData.append(
        'launchConfig',
        JSON.stringify({
          devBuySol,
          slippage: 10,
          priorityFee: 0.0005,
          pool: 'pump',
        })
      );

      formData.append('image', image);
      formData.append('override', override ? 'true' : 'false');

      const response = await fetch('http://localhost:3001/api/agent/launch', {
        method: 'POST',
        body: formData,
      });

      const data: LaunchResponse = await response.json();
      setResult(data);

      if (data.status === 'success') {
        alert('✅ Token launched successfully!');
      } else if (data.status === 'rejected') {
        alert(`⚠️ ${data.message}`);
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setResult({
        status: 'error',
        message: `Error: ${message}`,
        trendConfidence: 0,
      });
      alert(`❌ Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = image && idea && symbolHint;
  const canLaunch = isFormValid && (result?.status === 'success' || override);

  return (
    <div className="token-launcher">
      <div className="launcher-container">
        {/* Header */}
        <div className="launcher-header">
          <h1>🚀 Pump.fun Token Launcher</h1>
          <p>AI-powered token creation with trend validation</p>
        </div>

        <form onSubmit={handleLaunch} className="launcher-form">
          {/* Image Section */}
          <div className="form-section">
            <label className="section-title">📸 Token Image (Required)</label>

            <div className="image-upload">
              {preview ? (
                <div className="image-preview">
                  <img src={preview} alt="Preview" />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setPreview('');
                    }}
                    className="btn-remove"
                  >
                    ✕ Remove
                  </button>
                </div>
              ) : (
                <label className="upload-box">
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  <div className="upload-content">
                    <span className="upload-icon">📁</span>
                    <p>Click to upload PNG/JPG</p>
                    <small>Max 2MB</small>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Prompt Section */}
          <div className="form-section">
            <label className="section-title">💡 Token Concept</label>

            <div className="form-group">
              <label>Idea (What's your token concept?)</label>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="e.g., AI terminal girl meme with cult vibes"
                rows={3}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tone</label>
                <select value={tone} onChange={(e) => setTone(e.target.value)}>
                  <option value="degen">🎲 Degen</option>
                  <option value="meta">🧠 Meta</option>
                  <option value="cute">😊 Cute</option>
                  <option value="edgy">⚡ Edgy</option>
                  <option value="serious">💼 Serious</option>
                </select>
              </div>

              <div className="form-group">
                <label>Symbol Hint (3-5 chars)</label>
                <input
                  type="text"
                  value={symbolHint}
                  onChange={(e) => setSymbolHint(e.target.value.toUpperCase())}
                  placeholder="e.g., AI, CAT, BOT"
                  maxLength={5}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Additional Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any other details that matter?"
                rows={2}
              />
            </div>
          </div>

          {/* Launch Config */}
          <div className="form-section">
            <label className="section-title">⚙️ Launch Config</label>

            <div className="form-group">
              <label>Dev Buy Amount (SOL)</label>
              <input
                type="number"
                value={devBuySol}
                onChange={(e) => setDevBuySol(parseFloat(e.target.value))}
                min={0.1}
                max={5}
                step={0.1}
              />
              <small>Initial buy at launch (0.1 - 5 SOL)</small>
            </div>

            <div className="form-check">
              <input
                type="checkbox"
                id="override"
                checked={override}
                onChange={(e) => setOverride(e.target.checked)}
              />
              <label htmlFor="override">🔥 Force launch (bypass trend check)</label>
            </div>
          </div>

          {/* Validation Result */}
          {result && (
            <div className={`result-box result-${result.status}`}>
              <div className="result-header">
                {result.status === 'success' && '✅ Ready to Launch!'}
                {result.status === 'rejected' && '⚠️ Validation Failed'}
                {result.status === 'error' && '❌ Error'}
              </div>

              <div className="result-content">
                <p>{result.message}</p>

                {result.trendConfidence !== undefined && (
                  <div className="confidence-meter">
                    <div className="confidence-label">
                      Trend Confidence: {result.trendConfidence}%
                    </div>
                    <div className="confidence-bar">
                      <div
                        className="confidence-fill"
                        style={{
                          width: `${result.trendConfidence}%`,
                          backgroundColor:
                            result.trendConfidence > 70
                              ? '#10b981'
                              : result.trendConfidence > 40
                                ? '#f59e0b'
                                : '#ef4444',
                        }}
                      />
                    </div>
                  </div>
                )}

                {result.trendVerdict && (
                  <div className="trend-verdict">
                    <span className="verdict-badge">{result.trendVerdict.toUpperCase()}</span>
                    {result.trendReasoning && <p className="reasoning">{result.trendReasoning}</p>}
                  </div>
                )}

                {result.token && (
                  <div className="token-preview">
                    <h3>Generated Token</h3>
                    <div className="token-info">
                      <div>
                        <span className="label">Name:</span>
                        <span className="value">{result.token.name}</span>
                      </div>
                      <div>
                        <span className="label">Symbol:</span>
                        <span className="value">${result.token.symbol}</span>
                      </div>
                      <div>
                        <span className="label">Lore:</span>
                        <span className="value">{result.token.lore}</span>
                      </div>
                      {result.token.mint && (
                        <div>
                          <span className="label">Mint:</span>
                          <span className="value mono">
                            <a
                              href={`https://solscan.io/token/${result.token.mint}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {result.token.mint.substring(0, 20)}...
                            </a>
                          </span>
                        </div>
                      )}
                      {result.token.tx && (
                        <div>
                          <span className="label">Transaction:</span>
                          <span className="value mono">
                            <a
                              href={`https://solscan.io/tx/${result.token.tx}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {result.token.tx.substring(0, 20)}...
                            </a>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="form-buttons">
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className="btn btn-primary"
            >
              {loading ? '⏳ Processing...' : '🚀 Validate & Launch'}
            </button>

            <button
              type="reset"
              onClick={() => {
                setImage(null);
                setPreview('');
                setIdea('');
                setSymbolHint('');
                setNotes('');
                setResult(null);
              }}
              className="btn btn-secondary"
            >
              🔄 Clear
            </button>
          </div>

          {/* Info Box */}
          <div className="info-box">
            <p>
              <strong>ℹ️ How it works:</strong>
            </p>
            <ol>
              <li>Upload a token image (PNG/JPG)</li>
              <li>Describe your token concept & tone</li>
              <li>AI analyzes current market trends</li>
              <li>Validates narrative fit</li>
              <li>Generates token name & lore</li>
              <li>Launches on Pump.fun with dev buy</li>
            </ol>
          </div>
        </form>
      </div>
    </div>
  );
}
