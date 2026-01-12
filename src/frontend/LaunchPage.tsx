import React from 'react';
import TokenLaunchForm from './TokenLaunchForm';

export default function LaunchPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      padding: '20px',
      paddingTop: '60px',
    }}>
      <TokenLaunchForm />
    </div>
  );
}
