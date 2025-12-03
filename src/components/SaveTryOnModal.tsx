import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SaveTryOnModalProps {
  isOpen: boolean;
  imageUrl: string;
  onSave: (name: string) => Promise<void>;
  onClose: () => void;
}

export function SaveTryOnModal({ isOpen, imageUrl, onSave, onClose }: SaveTryOnModalProps) {
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      await onSave(name.trim());
      setName('');
      onClose();
    } catch (error) {
      console.error('Error saving try-on:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-xl font-semibold text-neutral-900">
                ¿Guardar prueba virtual?
              </h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
                disabled={isSaving}
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="relative rounded-xl overflow-hidden bg-neutral-100">
                <img
                  src={imageUrl}
                  alt="Prueba virtual"
                  className="w-full h-auto"
                />
              </div>

              <div>
                <label htmlFor="tryon-name" className="block text-sm font-medium text-neutral-700 mb-2">
                  Nombre de la prueba
                </label>
                <input
                  id="tryon-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Outfit para entrevista"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  disabled={isSaving}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && name.trim()) {
                      handleSave();
                    }
                  }}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={!name.trim() || isSaving}
                  className="flex-1 flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-xl hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-black/20"
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Guardar</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleClose}
                  disabled={isSaving}
                  className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                >
                  No guardar
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
