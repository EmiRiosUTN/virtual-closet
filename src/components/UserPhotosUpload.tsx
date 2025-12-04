import { useState, useEffect } from 'react';
import { Upload, User, X } from 'lucide-react';
import { UserPhoto } from '../types';
import { storageService, fileToBase64 } from '../services/storage';

const angles: Array<{ value: UserPhoto['angle']; label: string }> = [
  { value: 'front', label: 'Frente' },
  { value: 'back', label: 'Espalda' },
  { value: 'left', label: 'Lado Izquierdo' },
  { value: 'right', label: 'Lado Derecho' },
];

export const UserPhotosUpload = () => {
  const [userPhotos, setUserPhotos] = useState<UserPhoto[]>([]);
  const [selectedAngle, setSelectedAngle] = useState<UserPhoto['angle']>('front');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    const photos = await storageService.getUserPhotos();
    setUserPhotos(photos);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const base64 = await fileToBase64(file);
      setPreviewUrl(base64);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const newPhoto: UserPhoto = {
        id: crypto.randomUUID(),
        imageUrl: '',
        angle: selectedAngle,
        createdAt: Date.now(),
      };

      await storageService.saveUserPhoto(newPhoto, selectedFile);

      setPreviewUrl(null);
      setSelectedFile(null);
      await loadPhotos();
    } finally {
      setIsUploading(false);
    }
  };

  const deletePhoto = async (id: string) => {
    await storageService.deleteUserPhoto(id);
    await loadPhotos();
  };

  const getPhotoForAngle = (angle: UserPhoto['angle']) => {
    return userPhotos.find((p) => p.angle === angle);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-6 h-6 text-gray-400" />
          <h3 className="text-xl font-light text-gray-900">Mis Fotos</h3>
        </div>

        <p className="text-sm text-gray-500 font-light mb-6">
          Sube fotos tuyas desde diferentes ángulos para obtener mejores resultados en las pruebas virtuales
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-light text-gray-700 mb-2">
              Ángulo
            </label>
            <select
              value={selectedAngle}
              onChange={(e) => setSelectedAngle(e.target.value as UserPhoto['angle'])}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all font-light"
            >
              {angles.map((angle) => (
                <option key={angle.value} value={angle.value}>
                  {angle.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            {!previewUrl ? (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-400 transition-colors">
                <Upload className="w-12 h-12 text-gray-300 mb-3" />
                <span className="text-sm text-gray-400 font-light">
                  Click para subir foto
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-64 object-contain rounded-xl bg-gray-50"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl(null);
                    setSelectedFile(null);
                  }}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isUploading || !selectedFile}
            className="w-full bg-zinc-900 text-white py-4 rounded-xl font-light hover:bg-zinc-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Guardando...' : 'Guardar Foto'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h4 className="text-lg font-light text-gray-900 mb-4">Fotos Guardadas</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {angles.map((angle) => {
            const photo = getPhotoForAngle(angle.value);
            return (
              <div key={angle.value} className="space-y-2">
                <p className="text-sm text-gray-600 font-light text-center">
                  {angle.label}
                </p>
                {photo ? (
                  <div className="relative group">
                    <img
                      src={photo.imageUrl}
                      alt={angle.label}
                      className="w-full aspect-square object-cover rounded-xl bg-gray-50"
                    />
                    <button
                      onClick={() => deletePhoto(photo.id)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                ) : (
                  <div className="w-full aspect-square rounded-xl bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-200">
                    <User className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
