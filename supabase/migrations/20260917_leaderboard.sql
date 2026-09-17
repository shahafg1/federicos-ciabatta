begin;
create table public.game_runs (
 id uuid primary key, started_at timestamptz not null default now(),
 client_hash text not null
);
create index game_runs_rate on public.game_runs(client_hash, started_at);
create table public.high_scores (
 id uuid primary key default gen_random_uuid(),
 run_id uuid not null unique references public.game_runs(id),
 player_name text not null check (char_length(player_name) between 1 and 24),
 score integer not null check (score >= 0),
 served integer not null check (served between 0 and 10000),
 created_at timestamptz not null default now()
);
create index high_scores_ranking on public.high_scores(score desc, created_at, id);
alter table public.game_runs enable row level security;
alter table public.high_scores enable row level security;
revoke all on public.game_runs, public.high_scores from anon, authenticated;
-- Only these constrained functions can access the tables. Run tokens are never listed.
create function public.start_game(p_run uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare fingerprint text;
begin
 if p_run is null then raise exception 'INVALID_RUN'; end if;
 fingerprint := md5(coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-forwarded-for','unknown') || current_date::text);
 perform pg_advisory_xact_lock(hashtext(fingerprint));
 if exists(select 1 from public.game_runs where id=p_run) then return p_run; end if;
 if (select count(*) from public.game_runs where client_hash=fingerprint and started_at>now()-interval '1 minute')>=10 then raise exception 'RATE_LIMIT'; end if;
 insert into public.game_runs(id,client_hash) values(p_run,fingerprint);
 return p_run;
end $$;
create function public.submit_score(p_run uuid,p_name text,p_score integer,p_served integer) returns uuid
language plpgsql security definer set search_path = '' as $$
declare started timestamptz; result uuid; clean_name text;
begin
 select started_at into started from public.game_runs where id=p_run for update;
 if started is null then raise exception 'INVALID_RUN'; end if;
 select id into result from public.high_scores where run_id=p_run;
 if result is not null then return result; end if;
 clean_name:=btrim(regexp_replace(p_name,'[[:space:]]+',' ','g'));
 if clean_name is null or char_length(clean_name) not between 1 and 24 or clean_name ~ '[[:cntrl:]<>]' then raise exception 'INVALID_NAME'; end if;
 if p_score is null or p_served is null or p_served not between 1 and 10000
 or p_score < 25+26*(p_served-1) or p_score > 25+60*(p_served-1)
 or (p_served=1 and p_score<>25)
 or extract(epoch from now()-started) < greatest(40,2*(p_served-1))
 or started<now()-interval '24 hours' then raise exception 'INVALID_SCORE'; end if;
 insert into public.high_scores(run_id,player_name,score,served) values(p_run,clean_name,p_score,p_served) returning id into result;
 return result;
end $$;
create function public.get_leaderboard() returns table(id uuid,player_name text,score integer,served integer,created_at timestamptz)
language sql stable security definer set search_path = '' as $$
 select id,player_name,score,served,created_at from public.high_scores order by score desc,created_at,id limit 10;
$$;
revoke all on function public.start_game(uuid), public.submit_score(uuid,text,integer,integer), public.get_leaderboard() from public;
grant execute on function public.start_game(uuid), public.submit_score(uuid,text,integer,integer), public.get_leaderboard() to anon;
commit;
