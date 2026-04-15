import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAuth, connectAuthEmulator } from 'firebase/auth'

// ⚠️ IMPORTANT: Thay thế các giá trị này bằng Firebase config của bạn
// Lấy từ Firebase Console: Settings > Project Settings > Config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDummyApiKey123456789',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'financial-app.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'financial-management-app',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'financial-app.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef123456'
}

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig)

// Khởi tạo Firestore
export const db = getFirestore(app)

// Khởi tạo Auth
export const auth = getAuth(app)

// Tùy chọn: Sử dụng emulator cho development (nếu cần)
// const USE_EMULATOR = import.meta.env.DEV && !import.meta.env.VITE_DISABLE_EMULATOR
// if (USE_EMULATOR) {
//   try {
//     connectFirestoreEmulator(db, 'localhost', 8080)
//     connectAuthEmulator(auth, 'http://localhost:9099')
//   } catch (e) {
//     console.log('Emulator already connected')
//   }
// }

export default app
