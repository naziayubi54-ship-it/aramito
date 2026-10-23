import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ir.aramito.app',
  appName: 'آرامیتو',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#8FAE9B',
      sound: 'beep.wav',
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: false,
      backgroundColor: '#FFFFFF',
      androidScaleType: 'CENTER_INSIDE',
      useDialog: false,
      androidSplashResourceName: 'splash',
      showSpinner: false
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#F6F3EE',
      overlaysWebView: false
    }
  }
};

export default config;
