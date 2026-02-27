import { motion } from 'framer-motion';
import { Shirt, User, Sparkles, Heart } from 'lucide-react';
import { PageHeader } from './PageHeader';

export const Guide = () => {
    const steps = [
        {
            icon: Shirt,
            title: 'Paso 1: Sube tu Ropa',
            description: 'Dirígete a "Agregar Prenda". Sube una foto de tu ropa, colócale sus características (Hashtags) como Tela o Color, y elige si la guardas en "Mi Closet" (ropa que ya tienes) o en tu "Lista de Deseos" (ropa que quieres comprar).',
            color: 'bg-blue-100 text-blue-600',
            iconColor: 'text-blue-600'
        },
        {
            icon: User,
            title: 'Paso 2: Sube Tus Fotos',
            description: 'Ve a "Mis Fotos" y sube fotografías tuyas (de frente, perfil, etc.). Asegúrate de usar ropa ajustada y un fondo claro. Esto ayudará a que la Inteligencia Artificial te reconozca a la perfección.',
            color: 'bg-purple-100 text-purple-600',
            iconColor: 'text-purple-600'
        },
        {
            icon: Sparkles,
            title: 'Paso 3: Prueba Virtual',
            description: 'Ve a la sección "Prueba Virtual". Selecciona una de tus fotos y elige de 1 a 4 prendas. ¡Puedes mezclar ropa de tu armario físico con ropa de tu lista de deseos! Luego, haz clic en generar.',
            color: 'bg-yellow-100 text-yellow-600',
            iconColor: 'text-yellow-600'
        },
        {
            icon: Heart,
            title: 'Paso 4: Guarda y Organiza',
            description: 'El resultado mágico aparecerá en la sección "Probador". Si te gustó cómo te ves, guarda ese look en "Mis Outfits" para crear carpetas personalizadas y organizar tu estilo de la semana.',
            color: 'bg-pink-100 text-pink-600',
            iconColor: 'text-pink-600'
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-6"
        >
            <PageHeader
                title="Guía de Uso"
                description="Aprende a sacarle el máximo provecho a tu clóset virtual y crea outfits increíbles usando Inteligencia Artificial en 4 sencillos pasos."
                icon={Sparkles}
            />

            <div className="bg-white rounded-3xl shadow-xl border border-neutral-200 overflow-hidden">
                <div className="p-8 sm:p-12">
                    <div className="relative border-l-2 border-neutral-100 ml-4 sm:ml-8 space-y-12">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.15 }}
                                    className="relative pl-8 sm:pl-12"
                                >
                                    {/* Timeline dot/icon */}
                                    <div className={`absolute -left-[25px] sm:-left-[31px] top-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-white ${step.color}`}>
                                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>

                                    {/* Content card */}
                                    <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
                                        <h3 className="text-xl font-semibold text-neutral-900 mb-3">{step.title}</h3>
                                        <p className="text-neutral-600 leading-relaxed font-light">
                                            {step.description}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-neutral-50 px-8 py-6 border-t border-neutral-100 text-center">
                    <p className="text-sm text-neutral-500 font-medium">
                        ¡Ya estás lista para revolucionar tu estilo diario! Disfruta de la magia. ✨
                    </p>
                </div>
            </div>
        </motion.div>
    );
};
