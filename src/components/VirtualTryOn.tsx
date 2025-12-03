import { useState, useEffect } from 'react';
import { Sparkles, User, AlertCircle, Heart, Maximize2, X, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClothingItem, UserPhoto, Outfit } from '../types';
import { storageService } from '../services/storage';
import { createNanoBananaService } from '../services/nanoBanana';
import { ClosetView } from './ClosetView';
import { useToast } from '../hooks/useToast';
import { SaveTryOnModal } from './SaveTryOnModal';

type SelectionMode = 'individual' | 'outfit';

export const VirtualTryOn = () => {
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
  const [showSaveModal, setShowSaveModal] = useState(false);
  const { warning, success } = useToast();

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

  const handleSaveTryOn = async (name: string) => {
    if (!selectedUserPhoto || !resultImage) return;

    try {
      const uploadedImageUrl = await storageService.uploadTryOnImageFromUrl(resultImage);

      await storageService.saveTryOn(
        name,
        selectedUserPhoto.id,
        selectedClothingItems.map((item) => item.id),
        uploadedImageUrl
      );

      success('Prueba virtual guardada exitosamente');
    } catch (error) {
      console.error('Error saving try-on:', error);
      throw error;
    }
  };

  const handleTryOn = async () => {
    if (!selectedUserPhoto || selectedClothingItems.length === 0) {
      setError('Por favor selecciona una foto tuya y al menos una prenda');
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
        clothingUrls
      );

      const result = {
        id: crypto.randomUUID(),
        imageUrl: resultUrl,
        userPhotoId: selectedUserPhoto.id,
        clothingItemIds: selectedClothingItems.map((item) => item.id),
        createdAt: Date.now(),
      };

      await storageService.saveTryOnResult(result);

      setResultImage(resultUrl);
      setShowSaveModal(true);
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
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-gray-400" />
          <h3 className="text-xl font-light text-gray-900">Prueba Virtual</h3>
        </div>

        <div className="mb-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
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

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-light text-gray-700 mb-3">
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
              <div className="grid grid-cols-4 gap-3">
                {userPhotos.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => setSelectedUserPhoto(photo)}
                    className={`aspect-square rounded-xl overflow-hidden transition-all ${
                      selectedUserPhoto?.id === photo.id
                        ? 'ring-2 ring-gray-900'
                        : 'opacity-60 hover:opacity-100'
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

          <div>
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => {
                  setSelectionMode('individual');
                  setSelectedOutfit(null);
                }}
                className={`flex-1 px-4 py-3 rounded-xl font-light transition-colors flex items-center justify-center gap-2 ${
                  selectionMode === 'individual'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                className={`flex-1 px-4 py-3 rounded-xl font-light transition-colors flex items-center justify-center gap-2 ${
                  selectionMode === 'outfit'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart className="w-4 h-4" />
                Mis Outfits
              </button>
            </div>

            {selectionMode === 'individual' ? (
              <div>
                <label className="block text-sm font-light text-gray-700 mb-3">
                  Selecciona las prendas ({selectedClothingItems.length} seleccionadas)
                </label>
                <ClosetView
                  onItemSelect={handleItemSelect}
                  selectedItems={selectedClothingItems.map((item) => item.id)}
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-light text-gray-700 mb-3">
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
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {outfits.map((outfit) => {
                      const items = getItemsForOutfit(outfit);
                      const isSelected = selectedOutfit?.id === outfit.id;
                      return (
                        <button
                          key={outfit.id}
                          onClick={() => handleOutfitSelect(outfit)}
                          className={`relative text-left rounded-xl overflow-hidden transition-all hover:shadow-lg ${
                            isSelected ? 'ring-2 ring-gray-900' : ''
                          }`}
                        >
                          <div className="aspect-square bg-gray-50 p-2 grid grid-cols-2 gap-2">
                            {items.slice(0, 4).map((item, index) => (
                              <div
                                key={item.id}
                                className={`rounded-lg overflow-hidden ${
                                  items.length === 1 ? 'col-span-2 row-span-2' : ''
                                } ${
                                  items.length === 3 && index === 0 ? 'col-span-2' : ''
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
                              <div className="bg-gray-900 bg-opacity-80 flex items-center justify-center rounded-lg">
                                <span className="text-white font-light text-xs">
                                  +{items.length - 4}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="p-3 bg-white">
                            <p className="text-sm font-light text-gray-900 truncate">
                              {outfit.name}
                            </p>
                            <p className="text-xs text-gray-500 font-light">
                              {items.length} {items.length === 1 ? 'prenda' : 'prendas'}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="absolute inset-0 bg-gray-900 bg-opacity-10 flex items-center justify-center">
                              <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">✓</span>
                              </div>
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

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-light">{error}</p>
            </div>
          )}

          <button
            onClick={handleTryOn}
            disabled={
              isProcessing ||
              !selectedUserPhoto ||
              selectedClothingItems.length === 0
            }
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-light hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Probar Outfit
              </>
            )}
          </button>
        </div>
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

      <AnimatePresence>
        {showImageModal && resultImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 left-0 right-0 bottom-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          style={{ position: 'fixed' }}
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
      </AnimatePresence>

      {resultImage && (
        <SaveTryOnModal
          isOpen={showSaveModal}
          imageUrl={resultImage}
          onSave={handleSaveTryOn}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </div>
  );
};
