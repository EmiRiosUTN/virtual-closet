import { useState } from 'react';
import { Upload, X, Image as ImageIcon, Check, Heart, Shirt } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClothingItem, ClothingCategory } from '../types';
import { PageHeader } from './PageHeader';
import { TAGS } from '../constants/tags';
import { storageService, fileToBase64 } from '../services/storage';

interface ClothingUploadProps {
  onUploadComplete: () => void;
}

const categories: { value: ClothingCategory; label: string }[] = [
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

export const ClothingUpload = ({ onUploadComplete }: ClothingUploadProps) => {
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory>('Remeras');
  const [itemName, setItemName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isWishlist, setIsWishlist] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; file?: string }>({});

  const [selectedTelas, setSelectedTelas] = useState<string[]>([]);
  const [selectedColores, setSelectedColores] = useState<string[]>([]);
  const [selectedTiposVestido, setSelectedTiposVestido] = useState<string[]>([]);
  const [selectedTiposPantalon, setSelectedTiposPantalon] = useState<string[]>([]);
  const [selectedTiposZapatos, setSelectedTiposZapatos] = useState<string[]>([]);

  const TagGroup = ({ title, tags, selectedTags, onChange }: { title: string, tags: string[], selectedTags: string[], onChange: (tags: string[]) => void }) => {
    const toggleTag = (tag: string) => {
      if (selectedTags.includes(tag)) {
        onChange(selectedTags.filter(t => t !== tag));
      } else {
        onChange([...selectedTags, tag]);
      }
    };

    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-700 mb-2">{title}</label>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedTags.includes(tag)
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const handleFileChange = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, file: 'Por favor selecciona una imagen válida' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, file: 'La imagen no debe superar los 5MB' });
      return;
    }

    setErrors({ ...errors, file: undefined });
    setSelectedFile(file);
    const base64 = await fileToBase64(file);
    setPreviewUrl(base64);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const validateName = (value: string) => {
    if (!value.trim()) {
      setErrors({ ...errors, name: 'El nombre es requerido' });
      return false;
    }
    if (value.trim().length < 3) {
      setErrors({ ...errors, name: 'El nombre debe tener al menos 3 caracteres' });
      return false;
    }
    setErrors({ ...errors, name: undefined });
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isNameValid = validateName(itemName);
    if (!selectedFile) {
      setErrors({ ...errors, file: 'Por favor selecciona una imagen' });
      return;
    }

    if (!isNameValid) return;

    setIsUploading(true);
    try {
      const newItem: ClothingItem = {
        id: crypto.randomUUID(),
        category: selectedCategory,
        imageUrl: '',
        name: itemName.trim(),
        telas: selectedTelas,
        colores: selectedColores,
        tipos_vestido: selectedCategory === 'Vestidos' ? selectedTiposVestido : [],
        tipos_pantalon: selectedCategory === 'Pantalones' ? selectedTiposPantalon : [],
        tipos_zapatos: selectedCategory === 'Zapatos' ? selectedTiposZapatos : [],
        isWishlist: isWishlist,
        createdAt: Date.now(),
      };

      await storageService.saveClothingItem(newItem, selectedFile);

      setItemName('');
      setPreviewUrl(null);
      setSelectedFile(null);
      setSelectedTelas([]);
      setSelectedColores([]);
      setSelectedTiposVestido([]);
      setSelectedTiposPantalon([]);
      setSelectedTiposZapatos([]);
      setIsWishlist(false);
      setErrors({});
      onUploadComplete();
    } finally {
      setIsUploading(false);
    }
  };

  const clearPreview = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setErrors({ ...errors, file: undefined });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl lg:max-w-none mx-auto"
    >
      <PageHeader
        title="Agregar Prenda"
        description="Completa los datos para sumar una nueva prenda a tu closet"
        icon={Shirt}
      />

      <div className="bg-white rounded-3xl shadow-xl border border-neutral-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Categoría
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.value;
                return (
                  <motion.button
                    key={cat.value}
                    type="button"
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`relative p-4 rounded-xl border-2 transition-all text-left ${isSelected
                      ? 'border-zinc-900 bg-zinc-900/10 shadow-md'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                      }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`text-sm font-medium ${isSelected ? 'text-[zinc-900]' : 'text-neutral-700'}`}>
                      {cat.label}
                    </div>
                    {isSelected && (
                      <motion.div
                        layoutId="selected-category"
                        className="absolute top-2 right-2 w-5 h-5 bg-zinc-900 rounded-full flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="itemName" className="block text-sm font-medium text-neutral-700 mb-2">
              Nombre de la Prenda
            </label>
            <input
              id="itemName"
              type="text"
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
                if (errors.name) validateName(e.target.value);
              }}
              onBlur={() => validateName(itemName)}
              placeholder="Ej: Blusa blanca de seda"
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${errors.name
                ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                : 'border-neutral-200 focus:border-[zinc-900] focus:ring-teal-100'
                } focus:ring-4 outline-none`}
            />
            <AnimatePresence>
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-500 text-xs mt-2"
                >
                  {errors.name}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium text-neutral-800 border-b border-neutral-100 pb-2">Características (Hashtags)</h3>
            <TagGroup title="Telas y Materiales" tags={TAGS.TELAS} selectedTags={selectedTelas} onChange={setSelectedTelas} />
            <TagGroup title="Colores" tags={TAGS.COLORES} selectedTags={selectedColores} onChange={setSelectedColores} />

            {selectedCategory === 'Vestidos' && (
              <TagGroup title="Topos de Vestidos" tags={TAGS.TIPOS_VESTIDO} selectedTags={selectedTiposVestido} onChange={setSelectedTiposVestido} />
            )}
            {selectedCategory === 'Pantalones' && (
              <TagGroup title="Tipos de Pantalón" tags={TAGS.TIPOS_PANTALON} selectedTags={selectedTiposPantalon} onChange={setSelectedTiposPantalon} />
            )}
            {selectedCategory === 'Zapatos' && (
              <TagGroup title="Tipos de Zapatos" tags={TAGS.TIPOS_ZAPATOS} selectedTags={selectedTiposZapatos} onChange={setSelectedTiposZapatos} />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Foto de la Prenda
            </label>

            {!previewUrl ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <label
                  className={`flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${dragActive
                    ? 'border-[zinc-900] bg-zinc-900/10'
                    : errors.file
                      ? 'border-red-300 bg-red-50'
                      : 'border-neutral-300 hover:border-zinc-900 hover:bg-zinc-900/5'
                    }`}
                >
                  <motion.div
                    className="flex flex-col items-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <ImageIcon className={`w-16 h-16 mb-4 ${dragActive || errors.file ? 'text-[zinc-900]' : 'text-neutral-400'}`} />
                    <span className="text-sm font-medium text-neutral-700 mb-1">
                      {dragActive ? 'Suelta la imagen aquí' : 'Click para subir o arrastra y suelta'}
                    </span>
                    <span className="text-xs text-neutral-500">
                      PNG, JPG hasta 5MB
                    </span>
                  </motion.div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileChange(file);
                    }}
                  />
                </label>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group"
              >
                <div className="relative rounded-2xl overflow-hidden bg-neutral-100">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-80 object-contain"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <motion.button
                  type="button"
                  onClick={clearPreview}
                  className="absolute top-3 right-3 p-2.5 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-red-600" />
                </motion.button>
              </motion.div>
            )}

            <AnimatePresence>
              {errors.file && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-500 text-xs mt-2"
                >
                  {errors.file}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div
            className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${isWishlist
              ? 'border-pink-200 bg-pink-50/50'
              : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 hover:border-neutral-300'
              }`}
            onClick={() => setIsWishlist(!isWishlist)}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isWishlist ? 'bg-pink-100 text-pink-600' : 'bg-white text-neutral-400 shadow-sm'
                }`}>
                <Heart className={`w-6 h-6 transition-all ${isWishlist ? 'fill-pink-500 text-pink-500' : ''}`} />
              </div>
              <div>
                <h4 className={`text-base font-semibold ${isWishlist ? 'text-pink-900' : 'text-neutral-900'}`}>
                  Lista de Deseos
                </h4>
                <p className={`text-sm mt-0.5 ${isWishlist ? 'text-pink-600/80' : 'text-neutral-500'}`}>
                  Guardar esta prenda para comprarla después
                </p>
              </div>
            </div>

            <div className={`relative w-14 h-8 flex items-center rounded-full p-1 transition-colors ${isWishlist ? 'bg-pink-500' : 'bg-neutral-300'
              }`}>
              <motion.div
                className="w-6 h-6 bg-white rounded-full shadow-md"
                animate={{ x: isWishlist ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={isUploading || !selectedFile || !itemName.trim()}
            className="w-full bg-zinc-900 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {isUploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Agregar a mi Closet
              </>
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};
