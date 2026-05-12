import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyCItiUpxYqnQbpZfK9KXfmItUh4GimKrmY',
  authDomain: 'airtellecta-1d1ca.firebaseapp.com',
  projectId: 'airtellecta-1d1ca',
  storageBucket: 'airtellecta-1d1ca.firebasestorage.app',
  messagingSenderId: '12963178872',
  appId: '1:12963178872:web:8c57bea94661675f09c08d',
  measurementId: 'G-S70V2ZKK2H',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
