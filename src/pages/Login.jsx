import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function Login() {
    const [phone, setPhone] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (phone.length >= 8) {
            // Basic simulation, phase 1 mvp
            navigate('/');
        } else {
            alert("Ingrese un número válido");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col justify-center items-center p-6">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-red-50 p-4 rounded-full">
                        <ShieldAlert size={48} className="text-red-500" />
                    </div>
                </div>

                <h1 className="text-2xl font-black text-gray-800 mb-2">Feria Segura</h1>
                <p className="text-gray-500 text-sm mb-8">Piloto Sindicato Peñaflor</p>

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1 text-left">
                        <label className="text-xs font-bold text-gray-600 uppercase">Número de Teléfono</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">+56</span>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="9 1234 5678"
                                className="w-full pl-14 pr-4 py-4 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all font-medium text-lg"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="mt-6 w-full bg-green-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-green-700 active:scale-95 transition-all shadow-md"
                    >
                        Ingresar al Sistema
                    </button>
                </form>

                <p className="mt-8 text-xs text-gray-400">
                    Al ingresar confirmas tu pertenencia al sindicato habilitado para el uso de esta herramienta.
                </p>
            </div>
        </div>
    );
}
