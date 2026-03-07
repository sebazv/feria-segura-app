import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from '../../lib/supabase/client';
import BackButton from '../../components/BackButton';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const customIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function AttendancePage() {
    const navigate = useNavigate();
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [todayCheckedIn, setTodayCheckedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const savedUserId = localStorage.getItem('feria_user_id');
        const savedUserData = localStorage.getItem('feria_user_data');
        
        if (savedUserId && savedUserData) {
            const data = JSON.parse(savedUserData);
            setUser({ id: savedUserId });
            setUserData({ id: savedUserId, ...data });
            checkTodayAttendance(savedUserId);
        }
        
        getLocation();
    }, []);

    const checkTodayAttendance = async (userId) => {
        const today = new Date().toISOString().split('T')[0];
        const { data } = await supabase
            .from('asistencia')
            .select('id')
            .eq('usuario_id', userId)
            .eq('fecha', today)
            .single();
        
        if (data) setTodayCheckedIn(true);
        setLoading(false);
    };

    const getLocation = () => {
        if (!navigator.geolocation) {
            setError('GPS no disponible');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
                setLoading(false);
            },
            (err) => {
                setError('No se pudo obtener ubicación');
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleCheckIn = async () => {
        if (!location) {
            setError('Necesitamos tu ubicación');
            return;
        }

        if (location.accuracy > 100) {
            setError('Precisión GPS muy baja. Acércate al recinto.');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const today = new Date().toISOString().split('T')[0];
            
            const { error: insertError } = await supabase
                .from('asistencia')
                .insert({
                    usuario_id: user.id,
                    fecha: today,
                    lat: location.lat,
                    lng: location.lng,
                    precision_gps: location.accuracy,
                    estado: 'PRESENTE'
                });

            if (insertError) throw insertError;

            // Update user points
            const nuevosPuntos = (userData.puntos || 0) + 10;
            await supabase
                .from('usuarios')
                .update({ 
                    puntos: nuevosPuntos,
                    ultimo_registro_asistencia: new Date().toISOString()
                })
                .eq('id', user.id);

            setSuccess(true);
            
            // Update local storage
            userData.puntos = nuevosPuntos;
            localStorage.setItem('feria_user_data', JSON.stringify(userData));
            
            setTimeout(() => {
                navigate(-1);
            }, 2000);

        } catch (err) {
            console.error(err);
            setError('Error al registrar asistencia');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-6">
                <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-6">
                    <span className="text-5xl">✓</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">¡Asistencia Registrada!</h2>
                <p className="text-emerald-400">+10 puntos acumulados</p>
            </div>
        );
    }

    const mapCenter = location ? [location.lat, location.lng] : [-33.4489, -70.6693];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-4 pb-24">
            <div className="flex items-center gap-4 mb-6">
                <BackButton />
                <h1 className="text-2xl font-bold text-white">📍 Registrar Asistencia</h1>
            </div>

            {todayCheckedIn ? (
                <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-6 text-center">
                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">✓</span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Ya registraste tu asistencia</h2>
                    <p className="text-emerald-400">Hoy has acumulado 10 puntos</p>
                </div>
            ) : (
                <>
                    {/* Map */}
                    <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden mb-4">
                        <div className="h-64">
                            <MapContainer center={mapCenter} zoom={16} style={{ height: '100%', width: '100%' }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                {location && <Marker position={[location.lat, location.lng]} icon={customIcon} />}
                            </MapContainer>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400">Estado GPS</span>
                            <span className={location?.accuracy < 50 ? 'text-emerald-400' : 'text-yellow-400'}>
                                {location ? (location.accuracy < 50 ? '🟢 Preciso' : '🟡 Moderado') : '🔴 Sin señal'}
                            </span>
                        </div>
                        {location && (
                            <p className="text-xs text-slate-500 font-mono">
                                Precisión: ±{Math.round(location.accuracy)}m
                            </p>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 mb-4">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Check-in Button */}
                    <button
                        onClick={handleCheckIn}
                        disabled={saving || !location}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white py-4 rounded-2xl font-bold text-lg transition-colors"
                    >
                        {saving ? 'Registrando...' : '✅ Registrar Mi Asistencia'}
                    </button>

                    <p className="text-center text-slate-500 text-sm mt-4">
                        +10 puntos por registrar asistencia
                    </p>
                </>
            )}
        </div>
    );
}
