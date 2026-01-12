import React from 'react';
import dynamic from 'next/dynamic';

const PumpFunAILauncher = dynamic(() => import('../components/PumpFunAILauncher'), { ssr: false });

export default function LaunchPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">AI Token Launcher</h1>
        <PumpFunAILauncher apiBase="/api" />
      </main>
    </div>
  );
}
