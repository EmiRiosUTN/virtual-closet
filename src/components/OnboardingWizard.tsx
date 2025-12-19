import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, Sparkles, Heart, Shield } from 'lucide-react';
import { storageService } from '../services/storage';
import { useToast } from '../hooks/useToast';
import type { Gender, StylePreference } from '../types';

interface OnboardingWizardProps {
    onComplete: () => void;
}

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

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [gender, setGender] = useState<Gender | ''>('');
    const [stylePreferences, setStylePreferences] = useState<StylePreference[]>([]);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [saving, setSaving] = useState(false);
    const { error: showError, success } = useToast();

    const totalSteps = 4;

    const toggleStyle = (style: StylePreference) => {
        setStylePreferences((prev) =>
            prev.includes(style)
                ? prev.filter((s) => s !== style)
                : [...prev, style]
        );
    };

    const canProceed = () => {
        switch (currentStep) {
            case 0:
                return true; // Welcome step
            case 1:
                return gender !== '';
            case 2:
                return stylePreferences.length > 0;
            case 3:
                return termsAccepted;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (canProceed() && currentStep < totalSteps - 1) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleFinish = async () => {
        console.log('handleFinish called');
        console.log('canProceed:', canProceed());
        console.log('gender:', gender);
        console.log('stylePreferences:', stylePreferences);
        console.log('termsAccepted:', termsAccepted);

        if (!canProceed()) {
            console.log('Cannot proceed - validation failed');
            return;
        }

        setSaving(true);
        try {
            console.log('Calling completeOnboarding...');
            await storageService.completeOnboarding(
                gender as Gender,
                stylePreferences,
                termsAccepted
            );
            console.log('Onboarding completed successfully');
            success('¡Configuración completada!');
            onComplete();
        } catch (err) {
            console.error('Error completing onboarding:', err);
            showError('Error al guardar la configuración');
        } finally {
            setSaving(false);
        }
    };

    const steps = [
        // Step 0: Welcome
        <div key="welcome" className="text-center space-y-6">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto flex items-center justify-center"
            >
                <Sparkles className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold text-gray-900">
                ¡Bienvenido a Chicas Guapas AI!
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
                Vamos a configurar tu perfil para brindarte la mejor experiencia personalizada
            </p>
        </div>,

        // Step 1: Gender
        <div key="gender" className="space-y-6">
            <div className="text-center mb-8">
                <Heart className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    ¿Cómo te identificas?
                </h2>
                <p className="text-gray-600">
                    Esto nos ayuda a darte mejores recomendaciones de moda
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                {(['masculino', 'femenino', 'otro'] as const).map((option) => (
                    <button
                        key={option}
                        onClick={() => setGender(option)}
                        className={`p-6 rounded-2xl border-2 transition-all font-medium text-lg ${gender === option
                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg scale-105'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                            }`}
                    >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                ))}
            </div>
        </div>,

        // Step 2: Style Preferences
        <div key="styles" className="space-y-6">
            <div className="text-center mb-8">
                <Sparkles className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    ¿Cuál es tu estilo?
                </h2>
                <p className="text-gray-600">
                    Puedes seleccionar varios estilos que te representen
                </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {STYLE_OPTIONS.map((style) => (
                    <button
                        key={style.value}
                        onClick={() => toggleStyle(style.value)}
                        className={`p-6 rounded-2xl border-2 transition-all ${stylePreferences.includes(style.value)
                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                            }`}
                    >
                        <div className="text-4xl mb-2">{style.emoji}</div>
                        <div className="font-medium text-gray-900">{style.label}</div>
                        {stylePreferences.includes(style.value) && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="mt-2"
                            >
                                <Check className="w-5 h-5 text-purple-500 mx-auto" />
                            </motion.div>
                        )}
                    </button>
                ))}
            </div>
        </div>,

        // Step 3: Terms
        <div key="terms" className="space-y-6">
            <div className="text-center mb-8">
                <Shield className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Términos y Condiciones
                </h2>
                <p className="text-gray-600">
                    Por favor, lee y acepta nuestros términos para continuar
                </p>
            </div>
            <div className="max-w-2xl mx-auto">
                <div className="bg-gray-50 rounded-2xl p-8 space-y-4">
                    <label className="flex items-start gap-4 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            className="mt-1 w-5 h-5 text-purple-500 rounded border-gray-300 focus:ring-purple-500"
                        />
                        <span className="text-gray-700 text-sm leading-relaxed">
                            Acepto los{' '}
                            <a
                                href="https://chicasguapas.ai/terminos-y-condiciones-de-uso"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-500 hover:text-purple-600 underline font-medium"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Términos y Condiciones de Uso
                            </a>{' '}
                            y las{' '}
                            <a
                                href="https://chicasguapas.ai/politicas-de-privacidad"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-500 hover:text-purple-600 underline font-medium"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Políticas de Privacidad
                            </a>
                        </span>
                    </label>
                </div>
            </div>
        </div>,
    ];

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50 z-50 overflow-auto">
            <div className="min-h-screen flex flex-col">
                {/* Progress Indicator */}
                <div className="bg-white border-b border-gray-200 px-4 py-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            {Array.from({ length: totalSteps }).map((_, index) => (
                                <div key={index} className="flex items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${index < currentStep
                                            ? 'bg-purple-500 text-white'
                                            : index === currentStep
                                                ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-110'
                                                : 'bg-gray-200 text-gray-400'
                                            }`}
                                    >
                                        {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
                                    </div>
                                    {index < totalSteps - 1 && (
                                        <div
                                            className={`w-16 h-1 mx-2 rounded transition-all ${index < currentStep ? 'bg-purple-500' : 'bg-gray-200'
                                                }`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="text-center text-sm text-gray-500">
                            Paso {currentStep + 1} de {totalSteps}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
                    <div className="w-full max-w-5xl">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {steps[currentStep]}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Navigation */}
                <div className="bg-white border-t border-gray-200 px-4 py-6">
                    <div className="max-w-4xl mx-auto flex justify-between gap-4">
                        <button
                            onClick={handlePrevious}
                            disabled={currentStep === 0}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Anterior
                        </button>

                        {currentStep < totalSteps - 1 ? (
                            <button
                                onClick={handleNext}
                                disabled={!canProceed()}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-purple-500/30"
                            >
                                Siguiente
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={handleFinish}
                                disabled={!canProceed() || saving}
                                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-purple-500/30"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-5 h-5" />
                                        Finalizar
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
