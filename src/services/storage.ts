import { supabase } from '../lib/supabase';
import { ClothingItem, UserPhoto, Outfit, VirtualTryOnResult } from '../types';

async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  return user.id;
}

async function uploadImage(file: File, bucket: string, path: string): Promise<string> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
}

async function deleteImage(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    console.error('Error deleting image:', error);
  }
}

export const storageService = {
  async getClothingItems(): Promise<ClothingItem[]> {
    const { data, error } = await supabase
      .from('clothing_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching clothing items:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      imageUrl: item.image_url,
    }));
  },

  async saveClothingItem(item: ClothingItem, imageFile?: File): Promise<void> {
    const userId = await getCurrentUserId();
    let imageUrl = item.imageUrl;

    if (imageFile) {
      const fileName = `${userId}/${item.id}-${Date.now()}.${imageFile.name.split('.').pop()}`;
      imageUrl = await uploadImage(imageFile, 'clothing-images', fileName);
    }

    const { error } = await supabase
      .from('clothing_items')
      .insert({
        id: item.id,
        name: item.name,
        category: item.category,
        image_url: imageUrl,
        user_id: userId,
      });

    if (error) {
      console.error('Error saving clothing item:', error);
      throw error;
    }
  },

  async deleteClothingItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('clothing_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting clothing item:', error);
      throw error;
    }
  },

  async getUserPhotos(): Promise<UserPhoto[]> {
    const { data, error } = await supabase
      .from('user_photos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user photos:', error);
      return [];
    }

    return data.map(photo => ({
      id: photo.id,
      name: photo.name,
      imageUrl: photo.image_url,
      angle: photo.name as 'front' | 'side' | 'back',
    }));
  },

  async saveUserPhoto(photo: UserPhoto, imageFile?: File): Promise<void> {
    const userId = await getCurrentUserId();
    let imageUrl = photo.imageUrl;

    if (imageFile) {
      const fileName = `${userId}/${photo.angle}-${Date.now()}.${imageFile.name.split('.').pop()}`;
      imageUrl = await uploadImage(imageFile, 'user-photos', fileName);
    }

    const existing = await supabase
      .from('user_photos')
      .select('id')
      .eq('name', photo.angle)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing.data) {
      const { error } = await supabase
        .from('user_photos')
        .update({
          image_url: imageUrl,
        })
        .eq('id', existing.data.id);

      if (error) {
        console.error('Error updating user photo:', error);
        throw error;
      }
    } else {
      const { error } = await supabase
        .from('user_photos')
        .insert({
          id: photo.id,
          name: photo.angle,
          image_url: imageUrl,
          user_id: userId,
        });

      if (error) {
        console.error('Error saving user photo:', error);
        throw error;
      }
    }
  },

  async deleteUserPhoto(id: string): Promise<void> {
    const { error } = await supabase
      .from('user_photos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting user photo:', error);
      throw error;
    }
  },

  async getOutfits(): Promise<Outfit[]> {
    const { data, error } = await supabase
      .from('outfits')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching outfits:', error);
      return [];
    }

    return data.map(outfit => ({
      id: outfit.id,
      name: outfit.name,
      items: outfit.clothing_item_ids || [],
    }));
  },

  async saveOutfit(outfit: Outfit): Promise<void> {
    const userId = await getCurrentUserId();
    const existing = await supabase
      .from('outfits')
      .select('id')
      .eq('id', outfit.id)
      .maybeSingle();

    if (existing.data) {
      const { error } = await supabase
        .from('outfits')
        .update({
          name: outfit.name,
          clothing_item_ids: outfit.items,
        })
        .eq('id', outfit.id);

      if (error) {
        console.error('Error updating outfit:', error);
        throw error;
      }
    } else {
      const { error } = await supabase
        .from('outfits')
        .insert({
          id: outfit.id,
          name: outfit.name,
          clothing_item_ids: outfit.items,
          user_id: userId,
        });

      if (error) {
        console.error('Error saving outfit:', error);
        throw error;
      }
    }
  },

  async deleteOutfit(id: string): Promise<void> {
    const { error } = await supabase
      .from('outfits')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting outfit:', error);
      throw error;
    }
  },

  async getTryOnResults(): Promise<VirtualTryOnResult[]> {
    const { data, error } = await supabase
      .from('try_on_results')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching try-on results:', error);
      return [];
    }

    return data.map(result => ({
      id: result.id,
      imageUrl: result.result_image_url,
      userPhotoId: result.user_photo_id,
      clothingItemIds: result.clothing_item_ids || [],
      createdAt: new Date(result.created_at).getTime(),
    }));
  },

  async saveTryOnResult(result: VirtualTryOnResult): Promise<void> {
    const userId = await getCurrentUserId();
    const { error } = await supabase
      .from('try_on_results')
      .insert({
        id: result.id,
        result_image_url: result.imageUrl,
        user_photo_id: result.userPhotoId,
        clothing_item_ids: result.clothingItemIds,
        user_id: userId,
      });

    if (error) {
      console.error('Error saving try-on result:', error);
      throw error;
    }
  },

  async deleteTryOnResult(id: string): Promise<void> {
    const { error } = await supabase
      .from('try_on_results')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting try-on result:', error);
      throw error;
    }
  },

  async clearAll(): Promise<void> {
    await Promise.all([
      supabase.from('clothing_items').delete().neq('id', ''),
      supabase.from('user_photos').delete().neq('id', ''),
      supabase.from('outfits').delete().neq('id', ''),
      supabase.from('try_on_results').delete().neq('id', ''),
    ]);
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
