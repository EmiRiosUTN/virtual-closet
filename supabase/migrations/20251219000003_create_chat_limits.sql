-- Create user_chat_limits table
create table user_chat_limits (
  user_id uuid references auth.users on delete cascade primary key,
  message_count integer default 0 not null,
  reset_at timestamp with time zone default timezone('utc'::text, now() + interval '24 hours') not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table user_chat_limits enable row level security;

-- RLS Policies
create policy "Users can view own limits"
  on user_chat_limits for select
  using (auth.uid() = user_id);

create policy "Users can update own limits"
  on user_chat_limits for update
  using (auth.uid() = user_id);

create policy "Users can insert own limits"
  on user_chat_limits for insert
  with check (auth.uid() = user_id);
