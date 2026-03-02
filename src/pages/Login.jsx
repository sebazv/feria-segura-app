/**
 * Login.jsx
 * Redirige al registro simplificado
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const navigate = useNavigate();
    
    useEffect(() => {
        // Redirigir a registro
        navigate('/registro');
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando...</p>
            </div>
        </div>
    );
}
