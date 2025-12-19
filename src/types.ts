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
  style_preference?: string;
  created_at: string;
}

export type Gender = 'masculino' | 'femenino' | 'otro';

export type StylePreference =
  | 'elegante'
  | 'casual'
  | 'deportivo'
  | 'gotico'
  | 'bohemio'
  | 'minimalista'
  | 'vintage'
  | 'streetwear';

export interface UserProfile {
  id: string;
  gender?: Gender;
  style_preferences?: StylePreference[];
  terms_accepted: boolean;
  terms_accepted_at?: string;
  onboarding_completed: boolean;
  onboarding_completed_at?: string;
  created_at: string;
  updated_at: string;
}

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  user_id: string;
  try_on_result_id: string;
  role: ChatRole;
  content: string;
  created_at: string;
}

export interface ChatLimit {
  user_id: string;
  message_count: number;
  reset_at: string;
  updated_at: string;
}
