-- Prevent invisible direction overrides from spoofing names in the public table.
alter table public.high_scores add constraint player_name_no_direction_controls
check (player_name !~ U&'[\200E\200F\202A-\202E\2066-\2069]');
