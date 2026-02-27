import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClothingItem } from '../types';

interface ImageModalProps {
    imageUrl: string;
    altText?: string;
    item?: ClothingItem;
    onClose: () => void;
    onTagClick?: (tag: string) => void;
}

export const ImageModal = ({ imageUrl, altText = 'Imagen', item, onClose, onTagClick }: ImageModalProps) => {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
            >
                <motion.button
                    onClick={onClose}
                    className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <X className="w-6 h-6" />
                </motion.button>

                <motion.img
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    src={imageUrl}
                    alt={altText}
                    onClick={(e) => e.stopPropagation()}
                    className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
                />

                {item && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mt-6 flex flex-wrap gap-2 justify-center max-w-3xl w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {[
                            ...(item.telas || []),
                            ...(item.colores || []),
                            ...(item.tipos_vestido || []),
                            ...(item.tipos_pantalon || []),
                            ...(item.tipos_zapatos || []),
                        ].map(tag => (
                            <button
                                key={tag}
                                onClick={() => onTagClick?.(tag)}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-full backdrop-blur-md transition-colors border border-white/20 shadow-lg"
                            >
                                #{tag}
                            </button>
                        ))}
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};
