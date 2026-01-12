import React from 'react';
import { createRoot } from 'react-dom/client';
import TokenCreationChat from './TokenCreationChat';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<TokenCreationChat />);
}
