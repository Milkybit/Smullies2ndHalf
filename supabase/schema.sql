-- Doel1 — fase 6: schema voor Supabase.
-- Eén keer uitvoeren in de SQL Editor van het Supabase-project.
-- Elke tabel is van één gebruiker (user_id = auth.uid()) en RLS zorgt dat
-- niemand andermans rijen kan lezen of schrijven.

create table if not exists gerechten (
  id text primary key,
  user_id uuid not null default auth.uid(),
  naam text not null,
  soort text check (soort in ('ontbijt', 'lunch', 'diner', 'snack')),
  anker text,
  kleur1 text,
  kleur2 text,
  basis text,
  smaak text,
  porties_tekst text,
  kcal int,
  rotatie_week int check (rotatie_week between 1 and 4),
  kook_factor int default 2,
  bereiding text,
  notitie text,
  ingredienten jsonb
);

create table if not exists weekmenu (
  user_id uuid not null default auth.uid(),
  jaar_week text not null,
  dag text not null check (dag in ('ma', 'di', 'wo', 'do', 'vr', 'za', 'zo')),
  maaltijd text not null default 'diner' check (maaltijd in ('ontbijt', 'lunch', 'diner', 'snack')),
  gerecht_id text,
  porties int default 1,
  primary key (user_id, jaar_week, dag, maaltijd)
);

create table if not exists boodschappen (
  id text primary key,
  user_id uuid not null default auth.uid(),
  jaar_week text not null,
  naam text not null,
  hoeveelheid numeric,
  eenheid text,
  categorie text,
  dekt text,
  vast boolean default false,
  afgevinkt boolean default false
);

create table if not exists sessies (
  id text primary key,
  user_id uuid not null default auth.uid(),
  datum date not null,
  anker text not null check (anker in ('ma', 'di', 'wo', 'vr', 'za', 'extra', 'rust')),
  mini boolean default false
);

create table if not exists metingen (
  id text primary key,
  user_id uuid not null default auth.uid(),
  datum date not null,
  gewicht numeric,
  vet_pct numeric
);

create table if not exists droge_dagen (
  user_id uuid not null default auth.uid(),
  datum date not null,
  primary key (user_id, datum)
);

create table if not exists doelen (
  id text primary key,
  user_id uuid not null default auth.uid(),
  domein text,
  omschrijving text,
  meetlat text,
  richtdatum date,
  status text default 'actief'
);

-- Instellingen als één jsonb-rij per gebruiker (rotatiestart, doelen
-- dashboard, verdiende sloten, kcal-correctie; seed_versie blijft lokaal).
create table if not exists instellingen (
  user_id uuid primary key default auth.uid(),
  data jsonb not null default '{}'::jsonb
);

-- Row Level Security: iedereen ziet en bewerkt uitsluitend eigen rijen.
do $$
declare t text;
begin
  foreach t in array array['gerechten', 'weekmenu', 'boodschappen', 'sessies',
                           'metingen', 'droge_dagen', 'doelen', 'instellingen']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "eigen data" on %I', t);
    execute format(
      'create policy "eigen data" on %I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
  end loop;
end $$;
