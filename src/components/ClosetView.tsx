import { useState, useEffect, useMemo, useRef } from 'react';
import { Trash2, Shirt, Search, Sparkles, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { ClothingItem, ClothingCategory } from '../types';
import { storageService } from '../services/storage';

interface ClosetViewProps {
  onItemSelect?: (item: ClothingItem) => void;
  selectedItems?: string[];
}

const categories: { value: ClothingCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'Blusas', label: 'Blusas' },
  { value: 'Remeras', label: 'Remeras' },
  { value: 'Sweaters', label: 'Sweaters' },
  { value: 'Pantalones', label: 'Pantalones' },
  { value: 'Polleras', label: 'Polleras' },
  { value: 'Shorts', label: 'Shorts' },
  { value: 'Vestidos', label: 'Vestidos' },
  { value: 'Chalecos', label: 'Chalecos' },
  { value: 'Camperas', label: 'Camperas' },
  { value: 'Accesorios', label: 'Accesorios' },
  { value: 'Zapatos', label: 'Zapatos' },
];

export const ClosetView = ({ onItemSelect, selectedItems = [] }: ClosetViewProps) => {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = () => {
    const allItems = storageService.getClothingItems();
    setItems(allItems);
  };

  const deleteItem = (id: string) => {
    storageService.deleteClothingItem(id);
    loadItems();
    setDeleteConfirm(null);
  };

  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 1
      );
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
      return () => {
        container.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
      };
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (selectedCategory !== 'all') {
      result = result.filter((item) => item.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [items, selectedCategory, searchQuery]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-3xl shadow-xl border border-neutral-200 overflow-hidden">
        <div className="bg-[#171936] px-6 sm:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Shirt className="w-7 h-7 text-white" />
              <div>
                <h2 className="text-2xl font-semibold text-white">Mi Closet</h2>
                <p className="text-white/80 text-sm">
                  {filteredItems.length} {filteredItems.length === 1 ? 'prenda' : 'prendas'}
                </p>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar prendas..."
                className="pl-10 pr-4 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-blue-200 focus:bg-white/30 focus:border-white/50 transition-all outline-none w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="relative mb-6">
            {showLeftArrow && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-neutral-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-neutral-700" />
              </button>
            )}
            {showRightArrow && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-neutral-100 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-neutral-700" />
              </button>
            )}
          <div ref={scrollContainerRef} className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.value;
              return (
                <motion.button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-[#171936] text-white shadow-lg'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>{cat.label}</span>
                </motion.button>
              );
            })}
          </div>
          </div>

          {filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 sm:py-24"
            >
              <div className="w-20 h-20 bg-[#171936] rounded-full flex items-center justify-center mx-auto mb-6">
                <Shirt className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                {searchQuery
                  ? 'No se encontraron prendas'
                  : selectedCategory === 'all'
                  ? 'Tu closet está vacío'
                  : 'No hay prendas en esta categoría'}
              </h3>
              <p className="text-neutral-500 mb-8">
                {searchQuery
                  ? 'Intenta con otra búsqueda'
                  : '¡Comienza agregando tus primeras prendas!'}
              </p>
              {!searchQuery && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#171936] text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  <Sparkles className="w-5 h-5" />
                  Agregar Prenda
                </motion.button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredItems.map((item) => {
                  const isSelected = selectedItems.includes(item.id);
                  const isDeleting = deleteConfirm === item.id;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={!isSelected ? { y: -5, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } } : {}}
                      className={`group relative rounded-2xl overflow-hidden bg-white border-2 ${
                        isSelected
                          ? 'border-[#667eea] shadow-[0_8px_16px_rgba(102,126,234,0.3)]'
                          : 'border-[#e2e8f0] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]'
                      } ${onItemSelect ? 'cursor-pointer' : ''}`}
                      style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                      onClick={() => onItemSelect?.(item)}
                    >
                      <div className="aspect-square bg-neutral-50 overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="p-3 bg-white">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {categories.find((c) => c.value === item.category)?.label}
                        </p>
                      </div>

                      {!onItemSelect && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!isDeleting ? (
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm(item.id);
                              }}
                              className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
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
                                  deleteItem(item.id);
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
                      )}

                      {onItemSelect && (
                        <motion.div
                          className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center z-10"
                          animate={{
                            scale: isSelected ? 1.1 : 1,
                            background: isSelected ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#ffffff',
                            borderColor: isSelected ? '#667eea' : '#e2e8f0',
                            boxShadow: isSelected
                              ? '0 4px 12px rgba(102, 126, 234, 0.4)'
                              : '0 2px 8px rgba(0,0,0,0.15)',
                          }}
                          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                          style={{
                            border: '2px solid',
                          }}
                        >
                          <Check
                            className="w-4 h-4"
                            style={{
                              color: isSelected ? '#ffffff' : '#cbd5e1',
                              transition: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                          />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
