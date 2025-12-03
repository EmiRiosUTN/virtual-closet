import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Edit2, Save, Trash2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Outfit, ClothingItem } from '../types';
import { storageService } from '../services/storage';
import { ClosetView } from './ClosetView';

interface OutfitModalProps {
  outfit: Outfit;
  onClose: () => void;
  onUpdate: () => void;
}

export const OutfitModal = ({ outfit, onClose, onUpdate }: OutfitModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [outfitName, setOutfitName] = useState(outfit.name);
  const [selectedItems, setSelectedItems] = useState<ClothingItem[]>([]);
  const [allClothingItems, setAllClothingItems] = useState<ClothingItem[]>([]);
  const [showItemSelector, setShowItemSelector] = useState(false);

  useEffect(() => {
    loadClothingItems();
  }, []);

  const loadClothingItems = async () => {
    const items = await storageService.getClothingItems();
    setAllClothingItems(items);

    const outfitItems = outfit.items
      .map((itemId) => items.find((item) => item.id === itemId))
      .filter((item): item is ClothingItem => item !== undefined);
    setSelectedItems(outfitItems);
  };

  const handleSave = async () => {
    const updatedOutfit: Outfit = {
      ...outfit,
      name: outfitName.trim(),
      items: selectedItems.map((item) => item.id),
    };
    await storageService.saveOutfit(updatedOutfit);
    setIsEditing(false);
    onUpdate();
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== itemId));
  };

  const handleItemSelect = (item: ClothingItem) => {
    const exists = selectedItems.find((i) => i.id === item.id);
    if (exists) {
      setSelectedItems(selectedItems.filter((i) => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#171936] px-6 py-5 flex items-center justify-between">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={outfitName}
                onChange={(e) => setOutfitName(e.target.value)}
                className="bg-white/20 text-white placeholder-blue-200 px-4 py-2 rounded-xl border border-white/30 focus:bg-white/30 focus:border-white/50 transition-all outline-none w-full max-w-md"
                placeholder="Nombre del outfit"
              />
            ) : (
              <h2 className="text-2xl font-semibold text-white">{outfit.name}</h2>
            )}
            <p className="text-white/80 text-sm mt-1">
              {selectedItems.length} {selectedItems.length === 1 ? 'prenda' : 'prendas'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <motion.button
                  onClick={handleSave}
                  className="p-2.5 bg-white text-[#171936] rounded-full hover:bg-[#171936]/10 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Save className="w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={() => {
                    setIsEditing(false);
                    setOutfitName(outfit.name);
                    loadClothingItems();
                  }}
                  className="p-2.5 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  onClick={() => setIsEditing(true)}
                  className="p-2.5 bg-white text-[#171936] rounded-full hover:bg-neutral-100 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Edit2 className="w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={onClose}
                  className="p-2.5 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </>
            )}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isEditing && (
            <div className="mb-6">
              <button
                onClick={() => setShowItemSelector(!showItemSelector)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#171936]/10 text-[#171936] rounded-xl font-medium hover:bg-[#171936]/20 transition-colors border-2 border-[#171936]/20"
              >
                <Plus className="w-5 h-5" />
                {showItemSelector ? 'Ocultar Selector' : 'Agregar Prendas'}
              </button>

              <AnimatePresence>
                {showItemSelector && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    <ClosetView
                      onItemSelect={handleItemSelect}
                      selectedItems={selectedItems.map((item) => item.id)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {selectedItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="group relative rounded-2xl overflow-hidden bg-white border-2 border-neutral-200 hover:border-[#171936]/30 hover:shadow-lg transition-all"
                >
                  <div className="aspect-square bg-neutral-50">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {item.name}
                    </p>
                  </div>
                  {isEditing && (
                    <motion.button
                      onClick={() => handleRemoveItem(item.id)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {selectedItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-neutral-500">
                {isEditing
                  ? 'Agrega prendas a tu outfit'
                  : 'Este outfit no tiene prendas'}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};
