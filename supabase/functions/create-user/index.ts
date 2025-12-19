/*import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Get the authorization header
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('No authorization header')
        }

        // Create Supabase client with user's token
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: authHeader },
                },
            }
        )

        // Verify the user is authenticated and is an admin
        const {
            data: { user },
            error: userError,
        } = await supabaseClient.auth.getUser()

        if (userError || !user) {
            throw new Error('Unauthorized')
        }

        // Check if user is admin
        const { data: profile, error: profileError } = await supabaseClient
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profileError || profile?.role !== 'admin') {
            throw new Error('Forbidden: Admin access required')
        }

        // Parse request body
        const { email, password, role = 'user' } = await req.json()

        if (!email || !password) {
            throw new Error('Email and password are required')
        }

        // Create admin client with service role key
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        )

        // Create the user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm email
        })

        if (createError) {
            throw createError
        }

        // Create user profile with role
        const { error: profileCreateError } = await supabaseAdmin
            .from('user_profiles')
            .insert({
                id: newUser.user.id,
                role: role,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })

        if (profileCreateError) {
            // If profile creation fails, delete the user
            await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
            throw profileCreateError
        }

        return new Response(
            JSON.stringify({
                success: true,
                user: {
                    id: newUser.user.id,
                    email: newUser.user.email,
                    role: role,
                },
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: error.message.includes('Forbidden') ? 403 : 400,
            }
        )
    }
})
*/