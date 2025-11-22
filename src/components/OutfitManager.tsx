import { useState, useEffect } from 'react';
import { Heart, Trash2, Plus, X, Save, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outfit, ClothingItem } from '../types';
import { storageService } from '../services/storage';
import { ClosetView } from './ClosetView';
import { OutfitModal } from './OutfitModal';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './Toast';

export const OutfitManager = () => {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedItems, setSelectedItems] = useState<ClothingItem[]>([]);
  const [outfitName, setOutfitName] = useState('');
  const [allClothingItems, setAllClothingItems] = useState<ClothingItem[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [nameError, setNameError] = useState('');
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const { warning, toasts, removeToast } = useToast();

  useEffect(() => {
    loadOutfits();
    loadClothingItems();
  }, []);

  const loadOutfits = () => {
    const savedOutfits = storageService.getOutfits();
    setOutfits(savedOutfits);
  };

  const loadClothingItems = () => {
    const items = storageService.getClothingItems();
    setAllClothingItems(items);
  };

  useEffect(() => {
    if (outfits.length > 0) {
      loadClothingItems();
    }
  }, [outfits.length]);

  const handleItemSelect = (item: ClothingItem) => {
    setSelectedItems((prev) => {
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

  const validateName = () => {
    if (!outfitName.trim()) {
      setNameError('El nombre es requerido');
      return false;
    }
    if (outfitName.trim().length < 3) {
      setNameError('El nombre debe tener al menos 3 caracteres');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleSaveOutfit = () => {
    if (!validateName()) return;

    if (selectedItems.length === 0) {
      setNameError('Selecciona al menos una prenda');
      return;
    }

    const newOutfit: Outfit = {
      id: crypto.randomUUID(),
      name: outfitName.trim(),
      items: selectedItems.map((item) => item.id),
      createdAt: Date.now(),
    };

    storageService.saveOutfit(newOutfit);
    setOutfitName('');
    setSelectedItems([]);
    setIsCreating(false);
    setNameError('');
    loadOutfits();
  };

  const deleteOutfit = (id: string) => {
    storageService.deleteOutfit(id);
    loadOutfits();
    setDeleteConfirm(null);
  };

  const getItemsForOutfit = (outfit: Outfit): ClothingItem[] => {
    const currentItems = storageService.getClothingItems();
    return outfit.items
      .map((itemId) => currentItems.find((item) => item.id === itemId))
      .filter((item): item is ClothingItem => item !== undefined);
  };

  const cancelCreation = () => {
    setIsCreating(false);
    setSelectedItems([]);
    setOutfitName('');
    setNameError('');
  };

  return (
    <>
    <ToastContainer toasts={toasts} onClose={removeToast} />
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-3xl shadow-xl border border-neutral-200 overflow-hidden">
        <div className="bg-[#171936] px-6 sm:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Heart className="w-7 h-7 text-white" />
              <div>
                <h2 className="text-2xl font-semibold text-white">Mis Outfits</h2>
                <p className="text-white/80 text-sm">
                  {outfits.length} {outfits.length === 1 ? 'outfit' : 'outfits'} guardados
                </p>
              </div>
            </div>
            {!isCreating && (
              <motion.button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center gap-2 px-5 py-3 bg-white text-[#171936] rounded-xl font-semibold hover:bg-neutral-100 transition-all shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-5 h-5" />
                Crear Outfit
              </motion.button>
            )}
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <AnimatePresence>
            {isCreating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 overflow-hidden"
              >
                <div className="p-6 bg-[#171936]/50 rounded-2xl border-2 border-[#171936]/20 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#171936]" />
                      Crear Nuevo Outfit
                    </h3>
                    <button
                      onClick={cancelCreation}
                      className="p-2 hover:bg-white rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-neutral-500" />
                    </button>
                  </div>

                  <div>
                    <label htmlFor="outfitName" className="block text-sm font-medium text-neutral-700 mb-2">
                      Nombre del Outfit
                    </label>
                    <input
                      id="outfitName"
                      type="text"
                      value={outfitName}
                      onChange={(e) => {
                        setOutfitName(e.target.value);
                        if (nameError) setNameError('');
                      }}
                      onBlur={validateName}
                      placeholder="Ej: Look casual de viernes"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                        nameError
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                          : 'border-white focus:border-[#171936] focus:ring-teal-100'
                      } focus:ring-4 outline-none bg-white`}
                    />
                    <AnimatePresence>
                      {nameError && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-red-500 text-xs mt-2"
                        >
                          {nameError}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3">
                      Selecciona las prendas ({selectedItems.length} seleccionadas)
                    </label>
                    <div className="bg-white rounded-xl p-4 border-2 border-dashed border-[#171936]/30">
                      <ClosetView
                        onItemSelect={handleItemSelect}
                        selectedItems={selectedItems.map((item) => item.id)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      onClick={handleSaveOutfit}
                      className="flex-1 bg-[#171936] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Save className="w-5 h-5" />
                      Guardar Outfit
                    </motion.button>
                    <motion.button
                      onClick={cancelCreation}
                      className="px-6 py-3 bg-white text-neutral-600 rounded-xl font-medium hover:bg-neutral-50 transition-colors border-2 border-neutral-200"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      Cancelar
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {outfits.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 sm:py-24"
            >
              <div className="w-20 h-20 bg-[#171936] rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-[#171936]" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                No has creado outfits aún
              </h3>
              <p className="text-neutral-500 mb-8">
                ¡Comienza combinando tus prendas favoritas!
              </p>
              <motion.button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#171936] text-white rounded-xl font-medium shadow-lg hover:bg-[#14152E] hover:shadow-xl transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-5 h-5" />
                Crear mi Primer Outfit
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {outfits.map((outfit) => {
                  const items = getItemsForOutfit(outfit);
                  const isDeleting = deleteConfirm === outfit.id;
                  return (
                    <motion.div
                      key={outfit.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      whileHover={{ y: -8 }}
                      className="group bg-white border-2 border-neutral-200 rounded-2xl overflow-hidden hover:border-[#171936]/30 hover:shadow-xl transition-all cursor-pointer"
                      onClick={() => setSelectedOutfit(outfit)}
                    >
                      <div className="relative aspect-square bg-neutral-100 p-3">
                        {items.length === 0 ? (
                          <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                              <Sparkles className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
                              <p className="text-xs text-neutral-400">{outfit.items.length} items</p>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 h-full">
                            {items.slice(0, 4).map((item, index) => (
                              <div
                                key={item.id}
                                className={`rounded-xl overflow-hidden bg-white shadow-sm ${
                                  items.length === 1 ? 'col-span-2 row-span-2' : ''
                                } ${
                                  items.length === 3 && index === 0 ? 'col-span-2' : ''
                                }`}
                              >
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                              </div>
                            ))}
                            {items.length > 4 && (
                              <div className="bg-[#171936] flex items-center justify-center rounded-xl shadow-sm">
                                <span className="text-white font-semibold text-sm">
                                  +{items.length - 4}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!isDeleting ? (
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm(outfit.id);
                              }}
                              className="p-2.5 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </motion.button>
                          ) : (
                            <div className="flex gap-1">
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteOutfit(outfit.id);
                                }}
                                className="p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors text-xs font-medium"
                                whileHover={{ scale: 1.05 }}
                              >
                                ✓
                              </motion.button>
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirm(null);
                                }}
                                className="p-2 bg-neutral-500 text-white rounded-full shadow-lg hover:bg-neutral-600 transition-colors text-xs font-medium"
                                whileHover={{ scale: 1.05 }}
                              >
                                ✕
                              </motion.button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-neutral-900 mb-1 truncate">
                          {outfit.name}
                        </h4>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-neutral-500">
                            {items.length} {items.length === 1 ? 'prenda' : 'prendas'}
                          </p>
                          <Heart className="w-4 h-4 text-[#171936] fill-[#171936]" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedOutfit && (
          <OutfitModal
            outfit={selectedOutfit}
            onClose={() => setSelectedOutfit(null)}
            onUpdate={() => {
              loadOutfits();
              loadClothingItems();
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
    </>
  );
};
