import { useState, useEffect, useMemo, useRef } from 'react';
import { Trash2, Shirt, Search, Sparkles, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { ClothingItem, ClothingCategory } from '../types';
import { storageService } from '../services/storage';
import { ImageModal } from './ImageModal';
import { PageHeader } from './PageHeader';

interface ClosetViewProps {
  onItemSelect?: (item: ClothingItem) => void;
  selectedItems?: string[];
  onAddItemClick?: () => void;
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
  { value: 'Chalecos y blazers', label: 'Chalecos y blazers' },
  { value: 'Abrigos y camperas', label: 'Abrigos y camperas' },
  { value: 'Accesorios', label: 'Accesorios' },
  { value: 'Zapatos', label: 'Zapatos' },
  { value: 'Otros', label: 'Otros' },
];

export const ClosetView = ({ onItemSelect, selectedItems = [], onAddItemClick }: ClosetViewProps) => {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'closet' | 'wishlist'>('closet');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<{ url: string; alt: string; item?: any } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const allItems = await storageService.getClothingItems();
    setItems(allItems);
  };

  const deleteItem = async (id: string) => {
    await storageService.deleteClothingItem(id);
    await loadItems();
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
    let result = items.filter(item => {
      const isWish = item.isWishlist === true || String(item.isWishlist) === 'true';
      if (activeTab === 'wishlist') {
        return isWish;
      } else {
        return !isWish;
      }
    });

    if (selectedCategory !== 'all') {
      result = result.filter((item) => item.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) => {
        if (item.name.toLowerCase().includes(query)) return true;
        const allTags = [
          ...(item.telas || []),
          ...(item.colores || []),
          ...(item.tipos_vestido || []),
          ...(item.tipos_pantalon || []),
          ...(item.tipos_zapatos || []),
        ].map(t => t.toLowerCase());
        return allTags.some(tag => tag.includes(query));
      });
    }

    return result;
  }, [items, selectedCategory, searchQuery, activeTab]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <PageHeader
        title={activeTab === 'closet' ? 'Mi Closet' : 'Lista de Deseos'}
        description={`${filteredItems.length} ${filteredItems.length === 1 ? 'prenda' : 'prendas'}`}
        icon={Shirt}
        action={
          <div className="flex p-1 bg-white border border-neutral-200 rounded-xl shadow-sm">
            <button
              onClick={() => setActiveTab('closet')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'closet' ? 'bg-zinc-900 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
            >
              Mi Closet
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'wishlist' ? 'bg-zinc-900 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
            >
              Lista de Deseos
            </button>
          </div>
        }
      />

      <div className="bg-white rounded-3xl shadow-xl border border-neutral-200 overflow-hidden">
        <div className="px-6 sm:px-8 py-4 border-b border-neutral-100 flex justify-end bg-neutral-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar prendas..."
              className="pl-10 pr-4 py-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all outline-none w-full sm:w-64"
            />
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
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${isSelected
                      ? 'bg-zinc-900 text-white shadow-lg'
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
              <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
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
              {!searchQuery && onAddItemClick && (
                <motion.button
                  onClick={onAddItemClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
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
                    className={`group relative rounded-2xl overflow-hidden bg-white border-2 ${isSelected
                      ? 'border-zinc-900 shadow-[0_8px_16px_rgba(24,24,27,0.3)]'
                      : 'border-[#e2e8f0] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]'
                      } ${onItemSelect ? 'cursor-pointer' : ''}`}
                    style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                    onClick={() => onItemSelect?.(item)}
                  >
                    <div
                      className="aspect-square bg-neutral-50 overflow-hidden cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEnlargedImage({ url: item.imageUrl, alt: item.name, item });
                      }}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="p-3 bg-white">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-neutral-500 mb-2">
                        {categories.find((c) => c.value === item.category)?.label}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(() => {
                          const allTags = [
                            ...(item.telas || []),
                            ...(item.colores || []),
                            ...(item.tipos_vestido || []),
                            ...(item.tipos_pantalon || []),
                            ...(item.tipos_zapatos || []),
                          ];
                          const displayTags = allTags.slice(0, 3);
                          const remainingCount = allTags.length - 3;

                          return (
                            <>
                              {displayTags.map(tag => (
                                <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded-md truncate max-w-full">
                                  #{tag}
                                </span>
                              ))}
                              {remainingCount > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded-md">
                                  +{remainingCount}
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </div>
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
                          background: isSelected ? '#18181b' : '#ffffff',
                          borderColor: isSelected ? '#18181b' : '#e2e8f0',
                          boxShadow: isSelected
                            ? '0 4px 12px rgba(24, 24, 27, 0.4)'
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

      {enlargedImage && (
        <ImageModal
          item={enlargedImage.item}
          imageUrl={enlargedImage.url}
          altText={enlargedImage.alt}
          onClose={() => setEnlargedImage(null)}
          onTagClick={(tag: string) => {
            setSearchQuery(tag);
            setEnlargedImage(null);
          }}
        />
      )}
    </motion.div>
  );
};
