import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { storageService } from '../services/storage';
import { useToast } from '../hooks/useToast';
import type { Gender } from '../types';

export function Settings() {
    const [gender, setGender] = useState<Gender | ''>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { success, error: showError } = useToast();

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const profile = await storageService.getUserProfile();
            if (profile?.gender) {
                setGender(profile.gender as Gender);
            }
        } catch (err) {
            console.error('Error loading profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!gender) {
            showError('Por favor selecciona un género');
            return;
        }

        setSaving(true);
        try {
            await storageService.updateUserProfile(gender);
            success('Preferencias guardadas exitosamente');
        } catch (err) {
            console.error('Error saving profile:', err);
            showError('Error al guardar las preferencias');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <SettingsIcon className="w-6 h-6 text-gray-400" />
                    <h3 className="text-xl font-light text-gray-900">Configuración</h3>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Género
                        </label>
                        <p className="text-sm text-gray-500 mb-4">
                            Esta información ayuda a la IA a brindarte mejores recomendaciones de moda
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {(['masculino', 'femenino', 'otro'] as const).map((option) => (
                                <button
                                    key={option}
                                    onClick={() => setGender(option)}
                                    className={`px-6 py-4 rounded-xl border-2 transition-all font-medium text-sm ${gender === option
                                            ? 'border-black bg-black text-white shadow-lg'
                                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving || !gender}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black text-white px-8 py-3 rounded-xl hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-black/20"
                    >
                        {saving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Guardando...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>Guardar Cambios</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
