import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
    const apiKey = env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

  return {
    plugins: [react()],
    define: {
      'process.env.NEXT_PUBLIC_GEMINI_API_KEY': JSON.stringify(apiKey)
    }
  };
});