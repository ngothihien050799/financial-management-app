# Financial Dashboard - Advanced Mobile Build Guide

## 🔧 Building Native APK for Android

### Option 1: Using Capacitor (Recommended)

Capacitor allows you to wrap your web app as a native Android/iOS app.

#### Installation:

```bash
# Install Capacitor CLI
npm install -g @capacitor/cli

# Add Capacitor to project
npm install @capacitor/core @capacitor/cli

# Initialize
npx cap init
```

#### Configure:

```bash
# Create capacitor.config.ts
cat > capacitor.config.ts << 'EOF'
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.financialapp.dashboard',
  appName: 'Financial Dashboard',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;
EOF
```

#### Add Android:

```bash
# Add Android platform
npm install @capacitor/android
npx cap add android

# Open in Android Studio
npx cap open android
```

#### Build APK:

In Android Studio:

1. Build → Build Bundle(s) / APK(s) → Build APK(s)
2. Wait for build to complete
3. APK will be in `android/app/release/` folder

### Option 2: Using Apache Cordova

#### Installation:

```bash
# Install Cordova
npm install -g cordova

# Create Cordova project
cordova create financial-app com.financialapp.dashboard "Financial Dashboard"

# Add Android platform
cd financial-app
cordova platform add android

# Copy build files
xcopy dist\*.* www
xcopy dist\assets\* www\assets
xcopy public\service-worker.js www
xcopy public\manifest.json www
```

#### Build APK:

```bash
cordova build android --release
```

APK location: `platforms/android/app/build/outputs/apk/`

### Option 3: Using React Native or Flutter

For more advanced features, consider:

- **React Native:** Use `expo` for easy builds
- **Flutter:** More performant native experience

Note: Would require rewriting the app in those frameworks.

## 🖥️ Building for Windows/macOS App

### Using Electron:

```bash
# Install Electron
npm install electron --save-dev

# Create main.js
cat > electron-main.js << 'EOF'
const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    }
  });

  mainWindow.loadURL('file://' + path.join(__dirname, 'dist/index.html'));
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
EOF
```

#### Build executable:

```bash
npm install electron-builder --save-dev

# Update package.json
{
  "build": {
    "appId": "com.financialapp.dashboard",
    "files": ["dist/**/*", "electron-main.js"],
    "directories": {
      "buildResources": "public"
    },
    "win": {
      "target": ["nsis"]
    },
    "mac": {
      "target": ["dmg"]
    }
  }
}

# Build
npm run electron-builder
```

## 📊 App Store Distribution

### Google Play Store:

1. **Create Developer Account:** $25 one-time fee at play.google.com/developer
2. **Prepare APK:** Build using above methods
3. **Create app listing:** App details, images, description
4. **Upload APK:** Release → Create release → Upload APK
5. **Review:** Wait for Google approval (24-48 hours)

### Apple App Store:

1. **Enroll in Apple Developer Program:** $99/year
2. **Build IPA:** Use Xcode or Capacitor
3. **Create app listing:** App information and images
4. **Submit for review:** Apple reviews carefully
5. **Approval:** Can take 1-3 days

## 🔑 Signing & Certificates

### Android Signing:

```bash
# Create keystore
keytool -genkey -v -keystore my-release-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias

# Sign APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore app-release-unsigned.apk alias_name

# Zip align
zipalign -v 4 app-release-unsigned.apk app-release.apk
```

### iOS Signing:

Use Xcode's certificate management or fastlane:

```bash
npm install -g fastlane
fastlane ios build
```

## 📦 Size Optimization

### Current Build Size: ~2.5 MB

Reduce further with:

```bash
# Update vite.config.ts
{
  build: {
    rollupOptions: {
      output: {
        manualChunks: id => {
          if (id.includes('node_modules/chart.js')) return 'chart';
          if (id.includes('node_modules/vuetify')) return 'vuetify';
          if (id.includes('node_modules/vue')) return 'vue';
        }
      }
    },
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000
  }
}
```

### Gzip Compression:

Server should enable gzip for CSS/JS:

```nginx
# Nginx config
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

## 🧪 Testing Before Publishing

### Local Testing:

```bash
# Start dev server
npm run dev

# Test with mobile device on same network
# Visit http://your-computer-ip:5173
```

### Production build testing:

```bash
npm run build
npm run preview

# Visit http://localhost:4173
```

### DevTools:

- **Chrome:** DevTools → Device Toolbar for mobile simulation
- **Firefox:** Responsive Design Mode (Ctrl+Shift+M)
- **Safari:** Develop → Enter Responsive Design Mode

## 📈 Analytics Integration

Track app usage with Firebase Analytics:

```bash
npm install firebase
```

```typescript
// src/main.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
```

## 🔐 Security Checklist

- [x] HTTPS enabled on all servers
- [x] Service Worker configured correctly
- [x] Manifest.json validated
- [x] No sensitive data in localStorage
- [x] API endpoints secured
- [x] Content Security Policy headers set
- [x] Code minified and obfuscated
- [x] Dependencies kept up-to-date

## 🚀 CI/CD Pipeline Example

Using GitHub Actions:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"

      - run: npm ci
      - run: npm run build

      - uses: webfactory/ssh-deploy@master
        with:
          key: ${{ secrets.DEPLOY_KEY }}
          known_hosts: ${{ secrets.KNOWN_HOSTS }}
          source: dist/
          target: /var/www/html/
```

---

**Happy deploying! 🎉**
