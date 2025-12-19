import { supabase } from '../lib/supabase';

export interface CreateUserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: 'user' | 'admin';
}

export interface UserListItem {
    id: string;
    email: string;
    role: string;
    created_at: string;
    onboarding_completed: boolean;
}

export const adminService = {
    async createUser(data: CreateUserData): Promise<{ success: boolean; error?: string }> {
        try {
            // Save current session to restore later
            const { data: { session: currentSession } } = await supabase.auth.getSession();

            // Create user using signUp
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    emailRedirectTo: undefined,
                    data: {
                        first_name: data.firstName,
                        last_name: data.lastName,
                    },
                },
            });

            if (authError) {
                throw authError;
            }

            if (!authData.user) {
                throw new Error('User creation failed');
            }

            // Sign out the newly created user immediately
            await supabase.auth.signOut();

            // Restore admin session
            if (currentSession) {
                await supabase.auth.setSession({
                    access_token: currentSession.access_token,
                    refresh_token: currentSession.refresh_token,
                });
            }

            // Create user profile with role
            const { error: profileError } = await supabase
                .from('user_profiles')
                .upsert({
                    id: authData.user.id,
                    first_name: data.firstName,
                    last_name: data.lastName,
                    role: data.role || 'user',
                    terms_accepted: false,
                    onboarding_completed: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                });

            if (profileError) {
                console.error('Error creating profile:', profileError);
                // Don't throw, user is already created in Auth
            }

            return { success: true };
        } catch (error) {
            console.error('Error creating user:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },

    async listUsers(): Promise<UserListItem[]> {
        try {
            console.log('Fetching users from user_profiles...');
            const { data, error } = await supabase
                .from('user_profiles')
                .select('id, first_name, last_name, role, onboarding_completed, created_at')
                .order('created_at', { ascending: false });

            console.log('Query result:', { data, error });

            if (error) {
                console.error('Error fetching users:', error);
                throw error;
            }

            if (!data || data.length === 0) {
                console.warn('No users found in database');
                return [];
            }

            // Map profiles to UserListItem format
            const users = data.map(profile => ({
                ...profile,
                email: profile.first_name && profile.last_name
                    ? `${profile.first_name} ${profile.last_name}`
                    : profile.id.substring(0, 8) + '...',
            }));

            console.log('Mapped users:', users);
            return users;
        } catch (error) {
            console.error('Error listing users:', error);
            return [];
        }
    },
};
