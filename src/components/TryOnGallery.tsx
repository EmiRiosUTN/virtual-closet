import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Trash2, Maximize2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SavedTryOn } from '../types';
import { storageService } from '../services/storage';
import { useToast } from '../hooks/useToast';

export const TryOnGallery = () => {
  const [savedTryOns, setSavedTryOns] = useState<SavedTryOn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<SavedTryOn | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { success, warning } = useToast();

  useEffect(() => {
    loadSavedTryOns();
  }, []);

  const loadSavedTryOns = async () => {
    setIsLoading(true);
    const tryOns = await storageService.getSavedTryOns();
    setSavedTryOns(tryOns);
    setIsLoading(false);
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      await storageService.deleteSavedTryOn(deleteConfirmId);
      setSavedTryOns((prev) => prev.filter((tryOn) => tryOn.id !== deleteConfirmId));
      success('Prueba virtual eliminada');
      setSelectedImage(null);
    } catch (error) {
      console.error('Error deleting try-on:', error);
      warning('Error al eliminar la prueba virtual');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (savedTryOns.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-gray-400" />
          <h3 className="text-xl font-light text-gray-900">Probador Virtual</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Sparkles className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500 font-light mb-2">
            No tienes pruebas virtuales guardadas
          </p>
          <p className="text-sm text-gray-400 font-light">
            Ve a "Prueba Virtual" para generar y guardar tus primeras pruebas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-gray-400" />
          <h3 className="text-xl font-light text-gray-900">
            Probador Virtual ({savedTryOns.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {savedTryOns.map((tryOn) => (
            <motion.div
              key={tryOn.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group relative bg-gray-50 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg"
              onClick={() => setSelectedImage(tryOn)}
            >
              <div className="aspect-[3/4] relative">
                <img
                  src={tryOn.result_image_url}
                  alt="Prueba virtual"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(tryOn);
                  }}
                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                >
                  <Maximize2 className="w-4 h-4 text-gray-700" />
                </button>

                <button
                  onClick={(e) => handleDeleteClick(tryOn.id, e)}
                  className="absolute bottom-3 right-3 p-2 bg-red-500/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="p-4 bg-white">
                <h4 className="font-medium text-gray-900 truncate mb-1">Prueba Virtual</h4>
                <p className="text-xs text-gray-500 font-light">
                  {new Date(tryOn.created_at).toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {createPortal(
        <AnimatePresence>
          {selectedImage && (
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={selectedImage.result_image_url}
                  alt="Prueba virtual"
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
                <div className="p-6 border-t border-gray-100">
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    Prueba Virtual
                  </h3>
                  <p className="text-sm text-gray-500 font-light">
                    Guardado el {new Date(selectedImage.created_at).toLocaleDateString('es-AR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <button
                    onClick={(e) => handleDeleteClick(selectedImage.id, e)}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {createPortal(
        <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
            onClick={handleCancelDelete}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Eliminar prueba virtual
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    ¿Estás seguro de que deseas eliminar esta prueba virtual? Esta acción no se puede deshacer.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelDelete}
                      className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
