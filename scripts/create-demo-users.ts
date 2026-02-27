import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://rgfpmpimbexaamvxqume.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZnBtcGltYmV4YWFtdnhxdW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODg5MjksImV4cCI6MjA4MDM2NDkyOX0.ID4xeu-gcsewOffHzbwhhW2NO-b9wz7c2eZyJ6igD6Q';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin service (copied from src/services/admin.ts)
interface CreateUserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: 'user' | 'admin';
}

const adminService = {
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
};

// List of emails
const users = [
    { email: 'Lucia@chicasguapas.tv', firstName: 'Lucia', lastName: 'Demo' },
    { email: 'arianadelafuent@gmail.com', firstName: 'Ariana', lastName: 'De la Fuente' },
    { email: 'Info.catale@gmail.com', firstName: 'Catale', lastName: 'Info' },
    { email: 'fiorellaacri@gmail.com', firstName: 'Fiorella', lastName: 'Acri' },
    { email: 'puppa.careaga@gmail.com', firstName: 'Puppa', lastName: 'Careaga' },
    { email: 'sandrabarreraj@gmail.com', firstName: 'Sandra', lastName: 'Barrera' },
    { email: 'solmacaluso@gmail.com', firstName: 'Solma', lastName: 'Caluso' },
    { email: 'Antomaglietti@gmail.com', firstName: 'Anto', lastName: 'Maglietti' },
    { email: 'Info@andreinaespino.com', firstName: 'Andreina', lastName: 'Espino' },
    { email: 'snesi@itimegroup.com.ar', firstName: 'Snesi', lastName: 'ITime' },
    { email: 'CFigari@hotmail.com', firstName: 'C', lastName: 'Figari' },
    { email: 'joseibarramia@icloud.com', firstName: 'Jose', lastName: 'Ibarramia' },
    { email: 'Andrea@thetourismlab.com', firstName: 'Andrea', lastName: 'Tourism' },
    { email: 'jackie@longevitypragency.com', firstName: 'Jackie', lastName: 'Longevity' },
    { email: 'Cristianfabianalidelaflor@gmail.com', firstName: 'Cristian', lastName: 'De la Flor' },
    { email: 'Sm@unicoin.com', firstName: 'SM', lastName: 'Unicoin' },
    { email: 'Waiteagustina@gmail.com', firstName: 'Agustina', lastName: 'Waite' }
];

// Generic password for all users
const GENERIC_PASSWORD = 'Demo2026@';

async function createUser(userData: { email: string; firstName: string; lastName: string }) {
    try {
        console.log(`Creating user: ${userData.email}...`);

        const result = await adminService.createUser({
            email: userData.email.toLowerCase().trim(),
            password: GENERIC_PASSWORD,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: 'user'
        });

        if (result.success) {
            console.log(`✅ User created successfully: ${userData.email}`);
            return { success: true, email: userData.email };
        } else {
            console.error(`❌ Error creating user ${userData.email}:`, result.error);
            return { success: false, email: userData.email, error: result.error };
        }
    } catch (error) {
        console.error(`❌ Unexpected error creating user ${userData.email}:`, error);
        return { success: false, email: userData.email, error: String(error) };
    }
}

async function createAllUsers() {
    console.log('🚀 Starting user creation process...');
    console.log(`📧 Creating ${users.length} users with password: ${GENERIC_PASSWORD}\n`);

    const results = [];

    for (const userData of users) {
        const result = await createUser(userData);
        results.push(result);
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log('═'.repeat(50));
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`✅ Successfully created: ${successful.length} users`);
    console.log(`❌ Failed: ${failed.length} users`);

    if (failed.length > 0) {
        console.log('\n❌ Failed users:');
        failed.forEach(f => {
            console.log(`   - ${f.email}: ${f.error}`);
        });
    }

    console.log('\n✨ Done!');
    console.log(`\n🔑 All users can login with password: ${GENERIC_PASSWORD}`);
}

// Run the script
createAllUsers().catch(console.error);

