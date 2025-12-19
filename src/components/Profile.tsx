import { useState, useEffect } from 'react';
import { User, Save, Sparkles } from 'lucide-react';
import { storageService } from '../services/storage';
import { useToast } from '../hooks/useToast';
import type { Gender, StylePreference } from '../types';

const STYLE_OPTIONS: { value: StylePreference; label: string; emoji: string }[] = [
    { value: 'elegante', label: 'Elegante', emoji: '👔' },
    { value: 'casual', label: 'Casual', emoji: '👕' },
    { value: 'deportivo', label: 'Deportivo', emoji: '⚽' },
    { value: 'gotico', label: 'Gótico', emoji: '🖤' },
    { value: 'bohemio', label: 'Bohemio', emoji: '🌸' },
    { value: 'minimalista', label: 'Minimalista', emoji: '⚪' },
    { value: 'vintage', label: 'Vintage', emoji: '📻' },
    { value: 'streetwear', label: 'Streetwear', emoji: '🧢' },
];

export function Profile() {
    const [gender, setGender] = useState<Gender | ''>('');
    const [stylePreferences, setStylePreferences] = useState<StylePreference[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { success, error: showError } = useToast();

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const profile = await storageService.getUserProfile();
            if (profile) {
                if (profile.gender) {
                    setGender(profile.gender as Gender);
                }
                if (profile.style_preferences) {
                    setStylePreferences(profile.style_preferences);
                }
            }
        } catch (err) {
            console.error('Error loading profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleStyle = (style: StylePreference) => {
        setStylePreferences((prev) =>
            prev.includes(style)
                ? prev.filter((s) => s !== style)
                : [...prev, style]
        );
    };

    const handleSave = async () => {
        if (!gender) {
            showError('Por favor selecciona un género');
            return;
        }

        if (stylePreferences.length === 0) {
            showError('Por favor selecciona al menos un estilo');
            return;
        }

        setSaving(true);
        try {
            await storageService.updateUserProfile(gender, stylePreferences);
            success('Perfil actualizado exitosamente');
        } catch (err) {
            console.error('Error saving profile:', err);
            showError('Error al guardar el perfil');
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
                    <User className="w-6 h-6 text-gray-400" />
                    <h3 className="text-xl font-light text-gray-900">Mi Perfil</h3>
                </div>

                <div className="space-y-8">
                    {/* Gender Section */}
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

                    {/* Style Preferences Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-5 h-5 text-purple-500" />
                            <label className="block text-sm font-medium text-gray-700">
                                Estilos Preferidos
                            </label>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            Selecciona los estilos que más te representen (puedes elegir varios)
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {STYLE_OPTIONS.map((style) => (
                                <button
                                    key={style.value}
                                    onClick={() => toggleStyle(style.value)}
                                    className={`p-4 rounded-xl border-2 transition-all ${stylePreferences.includes(style.value)
                                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md'
                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                                        }`}
                                >
                                    <div className="text-3xl mb-2">{style.emoji}</div>
                                    <div className="font-medium text-sm text-gray-900">{style.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={saving || !gender || stylePreferences.length === 0}
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
