-- Database schema for the themes created by the teacher (Neon Postgres).
-- Idempotent: run it again on a new branch or after adding a statement.

-- Photos, addressed by the SHA-256 of their bytes: the same photo is stored once
-- and its URL never changes, so browsers and the CDN can cache it forever.
create table if not exists images (
  id         text primary key check (id ~ '^[0-9a-f]{64}$'),
  data       bytea not null,
  created_at timestamptz not null default now()
);

create table if not exists themes (
  id         uuid primary key,
  grade      text not null check (grade in ('5e', '4e', '3e')),
  name       text not null check (length(name) between 1 and 80),
  -- [{ "word": "el perro", "imageId": "<sha256>" }, ...] in display order.
  words      jsonb not null check (jsonb_typeof(words) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Failed teacher logins, to slow down password guessing (per IP address).
create table if not exists login_failures (
  ip text        not null,
  at timestamptz not null default now()
);
create index if not exists login_failures_ip_at on login_failures (ip, at);
