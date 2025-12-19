import { supabase } from '../lib/supabase';
import { ClothingItem, UserPhoto, Outfit, VirtualTryOnResult, SavedTryOn, UserProfile, ChatMessage, ChatLimit } from '../types';

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
      createdAt: new Date(item.created_at).getTime(),
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
      angle: photo.name as 'front' | 'back' | 'left' | 'right',
      createdAt: new Date(photo.created_at).getTime(),
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
      createdAt: new Date(outfit.created_at).getTime(),
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

  async getSavedTryOns(): Promise<SavedTryOn[]> {
    const { data, error } = await supabase
      .from('try_on_results')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved try-ons:', error);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      user_id: item.user_id,
      user_photo_id: item.user_photo_id,
      clothing_item_ids: item.clothing_item_ids || [],
      result_image_url: item.result_image_url,
      style_preference: item.style_preference,
      created_at: item.created_at,
    }));
  },

  async saveTryOn(
    userPhotoId: string,
    clothingItemIds: string[],
    imageUrl: string,
    stylePreference?: string
  ): Promise<void> {
    const userId = await getCurrentUserId();

    const { error } = await supabase
      .from('try_on_results')
      .insert({
        result_image_url: imageUrl,
        user_photo_id: userPhotoId,
        clothing_item_ids: clothingItemIds,
        style_preference: stylePreference,
        user_id: userId,
      });

    if (error) {
      console.error('Error saving try-on:', error);
      throw error;
    }
  },

  async uploadTryOnImageFromUrl(imageUrl: string): Promise<string> {
    const userId = await getCurrentUserId();

    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const file = new File([blob], `tryon-${Date.now()}.png`, { type: 'image/png' });

    const fileName = `${userId}/tryons/${Date.now()}.png`;
    return await uploadImage(file, 'try-on-results', fileName);
  },

  async deleteSavedTryOn(id: string): Promise<void> {
    const { error } = await supabase
      .from('try_on_results')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting saved try-on:', error);
      throw error;
    }
  },

  // User Profile methods
  async getUserProfile(): Promise<UserProfile | null> {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  },

  async updateUserProfile(gender: string, stylePreferences?: string[]): Promise<void> {
    const userId = await getCurrentUserId();

    const updateData: any = {
      id: userId,
      gender,
      updated_at: new Date().toISOString(),
    };

    if (stylePreferences) {
      updateData.style_preferences = stylePreferences;
    }

    const { error } = await supabase
      .from('user_profiles')
      .upsert(updateData);

    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Chat methods
  async getChatMessages(tryOnResultId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('outfit_chat_messages')
      .select('*')
      .eq('try_on_result_id', tryOnResultId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }

    return data || [];
  },

  async saveChatMessage(
    tryOnResultId: string,
    role: 'user' | 'assistant',
    content: string
  ): Promise<void> {
    const userId = await getCurrentUserId();

    const { error } = await supabase
      .from('outfit_chat_messages')
      .insert({
        user_id: userId,
        try_on_result_id: tryOnResultId,
        role,
        content,
      });

    if (error) {
      console.error('Error saving chat message:', error);
      throw error;
    }
  },

  async getChatLimit(): Promise<ChatLimit | null> {
    const userId = await getCurrentUserId();
    const { data, error } = await supabase
      .from('user_chat_limits')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching chat limit:', error);
      return null;
    }

    return data;
  },

  async checkAndIncrementChatLimit(): Promise<{ allowed: boolean; remaining: number }> {
    const userId = await getCurrentUserId();
    const now = new Date();

    // Get or create chat limit record
    let { data: limit, error } = await supabase
      .from('user_chat_limits')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching chat limit:', error);
      return { allowed: false, remaining: 0 };
    }

    // If no record exists, create one
    if (!limit) {
      const { error: insertError } = await supabase
        .from('user_chat_limits')
        .insert({
          user_id: userId,
          message_count: 1,
          reset_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        });

      if (insertError) {
        console.error('Error creating chat limit:', insertError);
        return { allowed: false, remaining: 0 };
      }

      return { allowed: true, remaining: 14 };
    }

    // Check if we need to reset
    const resetAt = new Date(limit.reset_at);
    if (now >= resetAt) {
      const { error: updateError } = await supabase
        .from('user_chat_limits')
        .update({
          message_count: 1,
          reset_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          updated_at: now.toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error resetting chat limit:', updateError);
        return { allowed: false, remaining: 0 };
      }

      return { allowed: true, remaining: 14 };
    }

    // Check if limit exceeded
    if (limit.message_count >= 15) {
      return { allowed: false, remaining: 0 };
    }

    // Increment count
    const { error: updateError } = await supabase
      .from('user_chat_limits')
      .update({
        message_count: limit.message_count + 1,
        updated_at: now.toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error incrementing chat limit:', updateError);
      return { allowed: false, remaining: 0 };
    }

    return { allowed: true, remaining: 15 - (limit.message_count + 1) };
  },

  async completeOnboarding(
    gender: string,
    stylePreferences: string[],
    termsAccepted: boolean
  ): Promise<void> {
    const userId = await getCurrentUserId();
    const now = new Date().toISOString();

    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        gender,
        style_preferences: stylePreferences,
        terms_accepted: termsAccepted,
        terms_accepted_at: termsAccepted ? now : null,
        onboarding_completed: true,
        onboarding_completed_at: now,
        updated_at: now,
      });

    if (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  },

  async checkOnboardingStatus(): Promise<boolean> {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from('user_profiles')
      .select('onboarding_completed')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }

    return data?.onboarding_completed || false;
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
