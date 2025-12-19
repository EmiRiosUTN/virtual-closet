-- Add style_preference column to try_on_results table
alter table try_on_results 
add column style_preference text;
