import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lineup.app',
  appName: 'lineup',
  webDir: 'dist/apps/lineup/browser',
  server: {
    androidScheme: 'https',
  },
};

export default config;
