-- Create user_usage_limits table
create table user_usage_limits (
  user_id uuid references auth.users on delete cascade primary key,
  chat_message_count integer default 0 not null,
  outfit_generation_count integer default 0 not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table user_usage_limits enable row level security;

-- RLS Policies
create policy "Users can view own usage limits"
  on user_usage_limits for select
  using (auth.uid() = user_id);

create policy "Users can update own usage limits"
  on user_usage_limits for update
  using (auth.uid() = user_id);

create policy "Users can insert own usage limits"
  on user_usage_limits for insert
  with check (auth.uid() = user_id);

-- Drop old table if exists
drop table if exists user_chat_limits;
