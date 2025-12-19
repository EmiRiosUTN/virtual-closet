-- Create outfit_chat_messages table
create table outfit_chat_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  try_on_result_id uuid references try_on_results on delete cascade not null,
  role text check (role in ('user', 'assistant')) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table outfit_chat_messages enable row level security;

-- RLS Policies
create policy "Users can view own messages"
  on outfit_chat_messages for select
  using (auth.uid() = user_id);

create policy "Users can insert own messages"
  on outfit_chat_messages for insert
  with check (auth.uid() = user_id);

-- Indexes for performance
create index idx_chat_messages_try_on on outfit_chat_messages(try_on_result_id);
create index idx_chat_messages_user on outfit_chat_messages(user_id, created_at desc);
