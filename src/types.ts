export type ClothingCategory =
  | 'Blusas'
  | 'Remeras'
  | 'Sweaters'
  | 'Pantalones'
  | 'Polleras'
  | 'Shorts'
  | 'Vestidos'
  | 'Chalecos'
  | 'Camperas'
  | 'Accesorios'
  | 'Zapatos';

export interface ClothingItem {
  id: string;
  category: ClothingCategory;
  imageUrl: string;
  name: string;
  createdAt: number;
}

export interface UserPhoto {
  id: string;
  imageUrl: string;
  angle: 'front' | 'back' | 'left' | 'right';
  createdAt: number;
}

export interface Outfit {
  id: string;
  name: string;
  items: string[];
  createdAt: number;
  imageUrl?: string;
}

export interface VirtualTryOnRequest {
  userPhotoId: string;
  clothingItemIds: string[];
  prompt: string;
}

export interface VirtualTryOnResult {
  id: string;
  imageUrl: string;
  userPhotoId: string;
  clothingItemIds: string[];
  createdAt: number;
}

export interface SavedTryOn {
  id: string;
  user_id: string;
  user_photo_id: string;
  clothing_item_ids: string[];
  result_image_url: string;
  created_at: string;
}
