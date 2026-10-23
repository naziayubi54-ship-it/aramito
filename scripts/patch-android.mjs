import fs from 'node:fs';
import path from 'node:path';

const manifestPath = path.resolve('android/app/src/main/AndroidManifest.xml');

if (fs.existsSync(manifestPath)) {
  let content = fs.readFileSync(manifestPath, 'utf8');

  const permissions = [
    'android.permission.POST_NOTIFICATIONS',
    'android.permission.SCHEDULE_EXACT_ALARM',
    'android.permission.RECEIVE_BOOT_COMPLETED',
    'android.permission.VIBRATE',
    'android.permission.WAKE_LOCK'
  ];

  let added = 0;
  for (const perm of permissions) {
    if (!content.includes(perm)) {
      const tag = `    <uses-permission android:name="${perm}" />\n`;
      content = content.replace('</manifest>', `${tag}</manifest>`);
      added++;
    }
  }

  fs.writeFileSync(manifestPath, content, 'utf8');
  console.log(`[Aramito] AndroidManifest.xml patched: added ${added} permissions.`);
} else {
  console.log('[Aramito] No Android project directory found yet. Run "npx cap add android" first.');
}
