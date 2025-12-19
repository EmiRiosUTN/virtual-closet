-- Add onboarding fields to user_profiles table
alter table user_profiles 
add column if not exists style_preferences text[],
add column if not exists terms_accepted boolean default false,
add column if not exists terms_accepted_at timestamp with time zone,
add column if not exists onboarding_completed boolean default false,
add column if not exists onboarding_completed_at timestamp with time zone;
