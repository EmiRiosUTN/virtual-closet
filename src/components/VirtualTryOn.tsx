import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, User, AlertCircle, Heart, Maximize2, X, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClothingItem, UserPhoto, Outfit } from '../types';
import { storageService } from '../services/storage';
import { createNanoBananaService } from '../services/nanoBanana';
import { ClosetView } from './ClosetView';
import { useToast } from '../hooks/useToast';
import { PageHeader } from './PageHeader';

type SelectionMode = 'individual' | 'outfit';

interface VirtualTryOnProps {
  onNavigateToGallery?: (imageUrl?: string) => void;
}

export const VirtualTryOn = ({ onNavigateToGallery }: VirtualTryOnProps = {}) => {
  const [userPhotos, setUserPhotos] = useState<UserPhoto[]>([]);
  const [selectedUserPhoto, setSelectedUserPhoto] = useState<UserPhoto | null>(null);
  const [selectedClothingItems, setSelectedClothingItems] = useState<ClothingItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('individual');
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [allClothingItems, setAllClothingItems] = useState<ClothingItem[]>([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [stylePreference, setStylePreference] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const { warning, success } = useToast();

  useEffect(() => {
    // Scroll a little bit after step change, but also listen to DOM changes (like images loading)
    let resizeTimer: number;

    const scrollToBottom = () => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    };

    // First initial scroll
    setTimeout(scrollToBottom, 150);

    // Watch for size changes (like fetched images rendering)
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(scrollToBottom, 100);
    });

    if (document.body) {
      resizeObserver.observe(document.body);
    }

    // Cleanup observer after a reasonable time for a step transition (e.g. 1.5s)
    const cleanupTimer = setTimeout(() => {
      resizeObserver.disconnect();
    }, 1500);

    return () => {
      clearTimeout(resizeTimer);
      clearTimeout(cleanupTimer);
      resizeObserver.disconnect();
    };
  }, [currentStep, resultImage]);

  useEffect(() => {
    loadUserPhotos();
    loadOutfits();
    loadClothingItems();
  }, []);

  const loadUserPhotos = async () => {
    const photos = await storageService.getUserPhotos();
    setUserPhotos(photos);
    if (photos.length > 0 && !selectedUserPhoto) {
      setSelectedUserPhoto(photos[0]);
    }
  };

  const loadOutfits = async () => {
    const savedOutfits = await storageService.getOutfits();
    setOutfits(savedOutfits);
  };

  const loadClothingItems = async () => {
    const items = await storageService.getClothingItems();
    setAllClothingItems(items);
  };

  const getItemsForOutfit = (outfit: Outfit): ClothingItem[] => {
    return outfit.items
      .map((itemId) => allClothingItems.find((item) => item.id === itemId))
      .filter((item): item is ClothingItem => item !== undefined);
  };

  const handleOutfitSelect = (outfit: Outfit) => {
    setSelectedOutfit(outfit);
    const items = getItemsForOutfit(outfit);
    setSelectedClothingItems(items);
  };

  const handleItemSelect = (item: ClothingItem) => {
    setSelectedClothingItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        return prev.filter((i) => i.id !== item.id);
      }

      if (item.category !== 'Accesorios') {
        const categoryExists = prev.find((i) => i.category === item.category);
        if (categoryExists) {
          warning(`Solo puedes seleccionar una prenda de ${item.category}. Quita la prenda actual antes de agregar otra.`);
          return prev;
        }
      }

      return [...prev, item];
    });
  };

  const handleTryOn = async () => {
    if (!selectedUserPhoto || selectedClothingItems.length === 0) {
      setError('Por favor selecciona una foto tuya y al menos una prenda');
      return;
    }

    // Check limit
    const limitCheck = await storageService.checkAndIncrementOutfitLimit();
    if (!limitCheck.allowed) {
      setError('Has alcanzado tu límite personal de 10 generaciones de outfits.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResultImage(null);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const service = createNanoBananaService(apiKey);
      const clothingUrls = selectedClothingItems.map((item) => item.imageUrl);

      const resultUrl = await service.virtualTryOn(
        selectedUserPhoto.imageUrl,
        clothingUrls,
        stylePreference.trim() ? `${stylePreference.trim()}. ` : undefined
      );

      setResultImage(resultUrl);

      // Auto-save the generated image
      try {
        const uploadedImageUrl = await storageService.uploadTryOnImageFromUrl(resultUrl);
        await storageService.saveTryOn(
          selectedUserPhoto.id,
          selectedClothingItems.map((item) => item.id),
          uploadedImageUrl,
          stylePreference || undefined
        );
        success('Prueba virtual guardada exitosamente en tu galería');

        if (onNavigateToGallery) {
          onNavigateToGallery(uploadedImageUrl);
        }
      } catch (saveError) {
        console.error('Error auto-saving try-on:', saveError);
        warning('El outfit se generó, pero hubo un problema al guardarlo en tu galería.');
      }

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al procesar la imagen. Verifica tu API key y vuelve a intentar.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full">
      <PageHeader
        title="Prueba Virtual"
        description="Selecciona tu foto y prendas para generar una visualización con inteligencia artificial"
        icon={Sparkles}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 mb-4 border-b border-gray-100 pb-4 px-2 sm:px-4">

          {!resultImage && (
            <div className="flex items-center gap-2 sm:gap-6 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-gray-100 -z-10"></div>
              <div
                className={`absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-zinc-900 -z-10 transition-all duration-500`}
                style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
              ></div>

              {[
                { num: 1, label: 'Tu Foto' },
                { num: 2, label: 'Prendas' },
                { num: 3, label: 'Detalles' }
              ].map((step) => (
                <div key={step.num} className="flex items-center gap-2 bg-white px-2">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-colors shadow-sm ${currentStep >= step.num
                      ? 'bg-zinc-900 text-white border-2 border-zinc-900'
                      : 'bg-white text-gray-400 border-2 border-gray-100'
                      }`}
                  >
                    {step.num}
                  </div>
                  <span className={`text-xs hidden lg:block ${currentStep >= step.num ? 'text-zinc-900 font-medium' : 'text-gray-400 font-light'}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {!resultImage ? (
          <>

            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col"
                  >
                    <div className="max-h-[60vh] sm:max-h-[70vh] overflow-y-auto pr-2 space-y-6 pb-2 custom-scrollbar">
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-4">
                        <div className="flex items-start gap-3 mb-4">
                          <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <h4 className="text-sm font-medium text-amber-900">Tips para mejores resultados</h4>
                        </div>
                        <div className="space-y-3 text-sm text-amber-800 font-light">
                          <div className="flex items-start gap-2">
                            <span className="text-amber-600 font-medium mt-0.5">•</span>
                            <p><span className="font-medium">Fotos de prendas:</span> Usa un fondo liso y uniforme (blanco o claro preferiblemente). Asegúrate de que la prenda esté bien visible, extendida y sin arrugas.</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-amber-600 font-medium mt-0.5">•</span>
                            <p><span className="font-medium">Tus fotos:</span> Usa ropa ajustada o corta para obtener resultados más precisos. Una pose frontal con buena iluminación funciona mejor.</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-amber-600 font-medium mt-0.5">•</span>
                            <p><span className="font-medium">Calidad:</span> Fotos nítidas y con buena resolución producen mejores resultados en la simulación.</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-4">
                          Selecciona tu foto
                        </label>
                        {userPhotos.length === 0 ? (
                          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                            <User className="w-5 h-5 text-gray-400" />
                            <p className="text-sm text-gray-500 font-light">
                              Primero debes subir fotos tuyas en la sección "Mis Fotos"
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {userPhotos.map((photo) => (
                              <button
                                key={photo.id}
                                onClick={() => setSelectedUserPhoto(photo)}
                                className={`relative aspect-square rounded-2xl overflow-hidden transition-all ${selectedUserPhoto?.id === photo.id
                                  ? 'ring-2 ring-offset-2 ring-zinc-900 shadow-lg scale-[1.02]'
                                  : 'opacity-70 hover:opacity-100 hover:scale-[1.02]'
                                  }`}
                              >
                                <img
                                  src={photo.imageUrl}
                                  alt={photo.angle}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div> {/* <-- Cierra container scrolleable */}

                    <div className="flex justify-end pt-4 mt-4 border-t border-gray-100 shrink-0">
                      <button
                        onClick={() => setCurrentStep(2)}
                        disabled={!selectedUserPhoto}
                        className="px-8 py-3.5 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg disabled:shadow-none"
                      >
                        Siguiente Paso
                      </button>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col"
                  >
                    <div className="max-h-[60vh] sm:max-h-[70vh] overflow-y-auto pr-2 space-y-4 pb-2 custom-scrollbar">
                      <div>
                        <div className="flex gap-3 mb-4 bg-gray-50 p-1.5 rounded-2xl">
                          <button
                            onClick={() => {
                              setSelectionMode('individual');
                              setSelectedOutfit(null);
                            }}
                            className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${selectionMode === 'individual'
                              ? 'bg-white text-zinc-900 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                              }`}
                          >
                            <Sparkles className="w-4 h-4" />
                            Prendas Individuales
                          </button>
                          <button
                            onClick={() => {
                              setSelectionMode('outfit');
                              setSelectedClothingItems([]);
                            }}
                            className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${selectionMode === 'outfit'
                              ? 'bg-white text-zinc-900 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                              }`}
                          >
                            <Heart className="w-4 h-4" />
                            Mis Outfits
                          </button>
                        </div>

                        {selectionMode === 'individual' ? (
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-4 flex justify-between items-center">
                              <span>Selecciona las prendas</span>
                              <span className="text-xs font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {selectedClothingItems.length} seleccionadas
                              </span>
                            </label>
                            <ClosetView
                              onItemSelect={handleItemSelect}
                              selectedItems={selectedClothingItems.map((item) => item.id)}
                            />
                          </div>
                        ) : (
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-4">
                              Selecciona un outfit
                            </label>
                            {outfits.length === 0 ? (
                              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <Heart className="w-5 h-5 text-gray-400" />
                                <p className="text-sm text-gray-500 font-light">
                                  No tienes outfits guardados. Crea uno en la sección "Mis Outfits"
                                </p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {outfits.map((outfit) => {
                                  const items = getItemsForOutfit(outfit);
                                  const isSelected = selectedOutfit?.id === outfit.id;
                                  return (
                                    <button
                                      key={outfit.id}
                                      onClick={() => handleOutfitSelect(outfit)}
                                      className={`relative text-left rounded-2xl overflow-hidden transition-all hover:shadow-lg ${isSelected ? 'ring-2 ring-offset-2 ring-zinc-900 shadow-lg scale-[1.02]' : 'border border-gray-100 hover:scale-[1.02]'
                                        }`}
                                    >
                                      <div className="aspect-square bg-gray-50 p-2 grid grid-cols-2 gap-2">
                                        {items.slice(0, 4).map((item, index) => (
                                          <div
                                            key={item.id}
                                            className={`rounded-lg overflow-hidden ${items.length === 1 ? 'col-span-2 row-span-2' : ''
                                              } ${items.length === 3 && index === 0 ? 'col-span-2' : ''
                                              }`}
                                          >
                                            <img
                                              src={item.imageUrl}
                                              alt={item.name}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                        ))}
                                        {items.length > 4 && (
                                          <div className="bg-zinc-900 bg-opacity-80 flex items-center justify-center rounded-lg">
                                            <span className="text-white font-light text-xs">
                                              +{items.length - 4}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                      <div className="p-4 bg-white">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                          {outfit.name}
                                        </p>
                                        <p className="text-xs text-gray-500 font-light mt-1">
                                          {items.length} {items.length === 1 ? 'prenda' : 'prendas'}
                                        </p>
                                      </div>
                                      {isSelected && (
                                        <div className="absolute top-2 right-2 w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center shadow-lg">
                                          <span className="text-white text-sm font-medium">✓</span>
                                        </div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div> {/* <-- Cierra container scrolleable */}

                    <div className="flex justify-between pt-4 mt-4 border-t border-gray-100 shrink-0">
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                      >
                        Atrás
                      </button>
                      <button
                        onClick={() => setCurrentStep(3)}
                        disabled={selectedClothingItems.length === 0}
                        className="px-8 py-3.5 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg disabled:shadow-none"
                      >
                        Siguiente Paso
                      </button>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col"
                  >
                    <div className="max-h-[55vh] sm:max-h-[65vh] overflow-y-auto pr-2 space-y-6 pb-2 custom-scrollbar">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-3">
                          ¿Cómo te gustaría llevar esta prenda? <span className="text-gray-400 font-normal">(Opcional)</span>
                        </label>
                        <input
                          type="text"
                          value={stylePreference}
                          onChange={(e) => setStylePreference(e.target.value)}
                          placeholder="Ej: abrochada, desabrochada, manga larga, etc."
                          className="w-full px-4 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all font-light text-sm"
                        />
                        <p className="text-xs text-gray-500 font-light mt-3 pl-1">
                          Describe detalles específicos sobre cómo quieres que se vea la prenda
                        </p>
                      </div>

                      {error && (
                        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-red-700 font-light leading-relaxed">{error}</p>
                        </div>
                      )}
                    </div> {/* <-- Cierra container scrolleable */}

                    <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 mt-4 border-t border-gray-100 shrink-0">
                      <button
                        onClick={() => setCurrentStep(2)}
                        disabled={isProcessing}
                        className="px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        Atrás
                      </button>

                      <button
                        onClick={handleTryOn}
                        disabled={
                          isProcessing ||
                          !selectedUserPhoto ||
                          selectedClothingItems.length === 0
                        }
                        className="sm:w-auto w-full px-8 py-3.5 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-md hover:shadow-lg disabled:shadow-none"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Generando Magia...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 text-yellow-400" />
                            Generar Prueba Virtual
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-10"
          >
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">¡Outfit Generado!</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Tu prueba virtual ha sido creada con éxito. Puedes ver el resultado a continuación.
            </p>
            <button
              onClick={() => {
                setResultImage(null);
                setCurrentStep(1);
                setSelectedClothingItems([]);
                setSelectedOutfit(null);
              }}
              className="px-8 py-3 bg-gray-100 text-gray-900 rounded-xl font-medium hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
            >
              Probar Nuevo Outfit
            </button>
          </motion.div>
        )}
      </div>

      {resultImage && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h4 className="text-lg font-light text-gray-900 mb-4">Resultado</h4>
          <div className="relative max-w-md mx-auto group">
            <img
              src={resultImage}
              alt="Virtual try-on result"
              className="w-full rounded-xl cursor-pointer transition-transform hover:scale-[1.02]"
              onClick={() => setShowImageModal(true)}
            />
            <button
              onClick={() => setShowImageModal(true)}
              className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <Maximize2 className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      )}

      {createPortal(
        <AnimatePresence>
          {showImageModal && resultImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
              onClick={() => setShowImageModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="relative max-w-lg w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowImageModal(false)}
                  className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <img
                  src={resultImage}
                  alt="Virtual try-on result full size"
                  className="w-full h-auto max-h-[85vh] object-contain rounded-2xl shadow-2xl"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
