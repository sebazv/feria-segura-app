// Configuración de Firebase - Feria Segura
// Reemplaza estos valores con los de tu proyecto Firebase

export const firebaseConfig = {
    apiKey: "AIzaSyTU_API_KEY_AQUI",
    authDomain: "feria-segura.firebaseapp.com",
    projectId: "feria-segura",
    storageBucket: "feria-segura.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Para desarrollo local, usa emulators:
// Descomenta las líneas siguientes para usar emuladores locales
/*
import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';
connectAuthEmulator(auth, "http://127.0.0.1:9099");
connectFirestoreEmulator(db, '127.0.0.1', 8080);
*/
