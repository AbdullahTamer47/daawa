import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBBkETpxJauEJcfW-CgqK_VRTQfBspi5VE',
  authDomain: 'ramdany-app.firebaseapp.com',
  projectId: 'ramdany-app',
  storageBucket: 'ramdany-app.firebasestorage.app',
  messagingSenderId: '873813954868',
  appId: '1:873813954868:web:59c4a29723b8bda4cc5561',
  measurementId: 'G-M53DZXC03M',
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

