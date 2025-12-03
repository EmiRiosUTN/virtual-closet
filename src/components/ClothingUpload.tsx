import { useState } from 'react';
import { Upload, X, Image as ImageIcon, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClothingItem, ClothingCategory } from '../types';
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
  { value: 'Chalecos', label: 'Chalecos' },
  { value: 'Camperas', label: 'Camperas' },
  { value: 'Accesorios', label: 'Accesorios' },
  { value: 'Zapatos', label: 'Zapatos' },
];

export const ClothingUpload = ({ onUploadComplete }: ClothingUploadProps) => {
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory>('Remeras');
  const [itemName, setItemName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; file?: string }>({});

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
        createdAt: Date.now(),
      };

      await storageService.saveClothingItem(newItem, selectedFile);

      setItemName('');
      setPreviewUrl(null);
      setSelectedFile(null);
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
      <div className="bg-white rounded-3xl shadow-xl border border-neutral-200 overflow-hidden">
        <div className="bg-zinc-900 px-8 py-6">
          <h2 className="text-2xl font-semibold text-white">Agregar Prenda</h2>
          <p className="text-white/80 text-sm mt-1">
            Completa los datos para agregar una nueva prenda a tu closet
          </p>
        </div>

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
                    className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-[zinc-900] bg-[zinc-900]/10 shadow-md'
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
                        className="absolute top-2 right-2 w-5 h-5 bg-[zinc-900] rounded-full flex items-center justify-center"
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
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                errors.name
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
                  className={`flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                    dragActive
                      ? 'border-[zinc-900] bg-[zinc-900]/10'
                      : errors.file
                      ? 'border-red-300 bg-red-50'
                      : 'border-neutral-300 hover:border-[zinc-900] hover:bg-[zinc-900]/5'
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

          <motion.button
            type="submit"
            disabled={isUploading || !selectedFile || !itemName.trim()}
            className="w-full bg-[zinc-900] text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
