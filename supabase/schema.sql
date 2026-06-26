-- Tabla de ingresos
create table if not exists ingresos (
  id uuid default gen_random_uuid() primary key,
  fecha text not null,
  dia text not null,
  hora text not null,
  genero text not null check (genero in ('Hombre', 'Mujer')),
  rango_edad text not null,
  created_at timestamptz default now()
);

-- Tabla de bonos
create table if not exists bonos (
  id uuid default gen_random_uuid() primary key,
  fecha text not null,
  dia text not null,
  hora text not null,
  actividad text not null check (actividad in ('Actividad 1 – Grito de Gol', 'Actividad 2 – Gol James')),
  valor_bono integer not null check (valor_bono in (20000, 50000)),
  created_at timestamptz default now()
);

-- Habilitar RLS (Row Level Security) con acceso público para el evento
alter table ingresos enable row level security;
alter table bonos enable row level security;

-- Políticas para acceso público (todos pueden leer y escribir durante el evento)
create policy "public read ingresos" on ingresos for select using (true);
create policy "public insert ingresos" on ingresos for insert with check (true);

create policy "public read bonos" on bonos for select using (true);
create policy "public insert bonos" on bonos for insert with check (true);

-- Habilitar realtime en las tablas
alter publication supabase_realtime add table ingresos;
alter publication supabase_realtime add table bonos;
