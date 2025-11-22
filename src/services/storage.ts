import { ClothingItem, UserPhoto, Outfit, VirtualTryOnResult } from '../types';

const STORAGE_KEYS = {
  CLOTHING: 'virtualCloset_clothing',
  USER_PHOTOS: 'virtualCloset_userPhotos',
  OUTFITS: 'virtualCloset_outfits',
  TRY_ON_RESULTS: 'virtualCloset_tryOnResults',
};

export const storageService = {
  getClothingItems(): ClothingItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.CLOTHING);
    return data ? JSON.parse(data) : [];
  },

  saveClothingItem(item: ClothingItem): void {
    const items = this.getClothingItems();
    items.push(item);
    localStorage.setItem(STORAGE_KEYS.CLOTHING, JSON.stringify(items));
  },

  deleteClothingItem(id: string): void {
    const items = this.getClothingItems().filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.CLOTHING, JSON.stringify(items));
  },

  getUserPhotos(): UserPhoto[] {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PHOTOS);
    return data ? JSON.parse(data) : [];
  },

  saveUserPhoto(photo: UserPhoto): void {
    const photos = this.getUserPhotos();
    const existingIndex = photos.findIndex(p => p.angle === photo.angle);

    if (existingIndex !== -1) {
      photos[existingIndex] = photo;
    } else {
      photos.push(photo);
    }

    localStorage.setItem(STORAGE_KEYS.USER_PHOTOS, JSON.stringify(photos));
  },

  deleteUserPhoto(id: string): void {
    const photos = this.getUserPhotos().filter(photo => photo.id !== id);
    localStorage.setItem(STORAGE_KEYS.USER_PHOTOS, JSON.stringify(photos));
  },

  getOutfits(): Outfit[] {
    const data = localStorage.getItem(STORAGE_KEYS.OUTFITS);
    return data ? JSON.parse(data) : [];
  },

  saveOutfit(outfit: Outfit): void {
    const outfits = this.getOutfits();
    const existingIndex = outfits.findIndex(o => o.id === outfit.id);

    if (existingIndex !== -1) {
      outfits[existingIndex] = outfit;
    } else {
      outfits.push(outfit);
    }

    localStorage.setItem(STORAGE_KEYS.OUTFITS, JSON.stringify(outfits));
  },

  deleteOutfit(id: string): void {
    const outfits = this.getOutfits().filter(outfit => outfit.id !== id);
    localStorage.setItem(STORAGE_KEYS.OUTFITS, JSON.stringify(outfits));
  },

  getTryOnResults(): VirtualTryOnResult[] {
    const data = localStorage.getItem(STORAGE_KEYS.TRY_ON_RESULTS);
    return data ? JSON.parse(data) : [];
  },

  saveTryOnResult(result: VirtualTryOnResult): void {
    const results = this.getTryOnResults();
    results.push(result);
    localStorage.setItem(STORAGE_KEYS.TRY_ON_RESULTS, JSON.stringify(results));
  },

  deleteTryOnResult(id: string): void {
    const results = this.getTryOnResults().filter(result => result.id !== id);
    localStorage.setItem(STORAGE_KEYS.TRY_ON_RESULTS, JSON.stringify(results));
  },

  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
