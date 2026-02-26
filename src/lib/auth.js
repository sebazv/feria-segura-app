import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase/config';

// Generar email desde RUT (sin puntos, sin guion)
export const rutToEmail = (rut) => {
    return `${rut.replace(/[^0-9kK]/g, '').toLowerCase()}@feria-segura.cl`;
};

// Registro de nuevo usuario feriante
export const registerFeriante = async ({ 
    nombre, 
    rut, 
    telefono, 
    puestoNumero,
    password 
}) => {
    try {
        const email = rutToEmail(rut);
        
        // Crear usuario en Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Actualizar perfil con nombre
        await updateProfile(user, { displayName: nombre });

        // Guardar datos adicionales en Firestore
        await setDoc(doc(db, 'usuarios', user.uid), {
            nombre,
            rut: rut.replace(/[^0-9kK]/g, '').toLowerCase(),
            telefono,
            puestoNumero,
            role: 'feriante',
            activo: true,
            createdAt: serverTimestamp(),
            ultimoAcceso: serverTimestamp()
        });

        return { success: true, user };
    } catch (error) {
        console.error('Error en registro:', error);
        return { success: false, error: error.message };
    }
};

// Login de feriante
export const loginFeriante = async (rut, password) => {
    try {
        const email = rutToEmail(rut);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Actualizar último acceso
        await setDoc(doc(db, 'usuarios', userCredential.user.uid), {
            ultimoAcceso: serverTimestamp()
        }, { merge: true });

        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Error en login:', error);
        return { success: false, error: error.message };
    }
};

// Cerrar sesión
export const logoutFeriante = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Obtener datos del usuario desde Firestore
export const getUsuarioDatos = async (uid) => {
    try {
        const docSnap = await getDoc(doc(db, 'usuarios', uid));
        if (docSnap.exists()) {
            return { success: true, datos: docSnap.data() };
        }
        return { success: false, error: 'Usuario no encontrado' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Observer de autenticación
export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};

// Validar RUT chileno
export const validarRUT = (rut) => {
    rut = rut.replace(/[^0-9kK]/g, '');
    if (rut.length < 8) return false;
    
    const num = rut.slice(0, -1);
    const dv = rut.slice(-1);
    
    let sum = 0;
    let mul = 2;
    
    for (let i = num.length - 1; i >= 0; i--) {
        sum += parseInt(num[i]) * mul;
        mul = mul === 7 ? 2 : mul + 1;
    }
    
    const rest = sum % 11;
    const expectedDv = rest === 0 ? '0' : rest === 1 ? 'k' : String(11 - rest);
    
    return dv.toLowerCase() === expectedDv;
};
