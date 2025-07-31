-- Insert all regions in Ghana
INSERT INTO public.locations (id, name, type, parent_id, active, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Greater Accra', 'region', NULL, true, now(), now()),
  (gen_random_uuid(), 'Ashanti', 'region', NULL, true, now(), now()),
  (gen_random_uuid(), 'Central', 'region', NULL, true, now(), now()),
  (gen_random_uuid(), 'Eastern', 'region', NULL, true, now(), now()),
  (gen_random_uuid(), 'Western', 'region', NULL, true, now(), now()),
  (gen_random_uuid(), 'Western North', 'region', NULL, true, now(), now()),
  (gen_random_uuid(), 'Volta', 'region', NULL, true, now(), now()),
  (gen_random_uuid(), 'Oti', 'region', NULL, true, now(), now()),
  (gen_random_uuid(), 'Northern', 'region', NULL, true, now(), now()),
  (gen_random_uuid(), 'Savannah', 'region', NULL, true, now(), now()),
  (gen_random_uuid(), 'North East', 'region', NULL, true, now(), now()),
  (gen_random_uuid(), 'Upper East', 'region', NULL, true, now(), now()),
  (gen_random_uuid(), 'Upper West', 'region', NULL, true, now(), now()),
  (gen_random_uuid(), 'Bono', 'region', NULL, true, now(), now()),
  (gen_random_uuid(), 'Bono East', 'region', NULL, true, now(), now()),
  (gen_random_uuid(), 'Ahafo', 'region', NULL, true, now(), now());

-- Insert major cities/towns for each region
-- Greater Accra
INSERT INTO public.locations (id, name, type, parent_id, active, created_at, updated_at)
SELECT gen_random_uuid(), city, 'city', r.id, true, now(), now()
FROM (VALUES
  ('Accra'), ('Tema'), ('Madina'), ('Teshie'), ('Nungua'), ('Dansoman'), ('Dome'), ('Adenta'), ('Ashaiman'), ('Kasoa')
) AS cities(city)
JOIN (SELECT id, name FROM public.locations WHERE type = 'region' AND name = 'Greater Accra') r ON true;

-- Ashanti
INSERT INTO public.locations (id, name, type, parent_id, active, created_at, updated_at)
SELECT gen_random_uuid(), city, 'city', r.id, true, now(), now()
FROM (VALUES
  ('Kumasi'), ('Obuasi'), ('Ejisu'), ('Konongo'), ('Mampong'), ('Asante Bekwai'), ('Effiduase'), ('Agona'), ('Offinso'), ('Asokwa')
) AS cities(city)
JOIN (SELECT id, name FROM public.locations WHERE type = 'region' AND name = 'Ashanti') r ON true;

-- Central
INSERT INTO public.locations (id, name, type, parent_id, active, created_at, updated_at)
SELECT gen_random_uuid(), city, 'city', r.id, true, now(), now()
FROM (VALUES
  ('Cape Coast'), ('Kasoa'), ('Winneba'), ('Mankessim'), ('Saltpond'), ('Swedru'), ('Elmina'), ('Assin Fosu'), ('Twifo Praso'), ('Agona Swedru')
) AS cities(city)
JOIN (SELECT id, name FROM public.locations WHERE type = 'region' AND name = 'Central') r ON true;

-- Eastern
INSERT INTO public.locations (id, name, type, parent_id, active, created_at, updated_at)
SELECT gen_random_uuid(), city, 'city', r.id, true, now(), now()
FROM (VALUES
  ('Koforidua'), ('Nkawkaw'), ('Suhum'), ('Akim Oda'), ('Nsawam'), ('Akwatia'), ('Aburi'), ('Asamankese'), ('Mpraeso'), ('New Tafo')
) AS cities(city)
JOIN (SELECT id, name FROM public.locations WHERE type = 'region' AND name = 'Eastern') r ON true;

-- Western
INSERT INTO public.locations (id, name, type, parent_id, active, created_at, updated_at)
SELECT gen_random_uuid(), city, 'city', r.id, true, now(), now()
FROM (VALUES
  ('Sekondi-Takoradi'), ('Tarkwa'), ('Axim'), ('Prestea'), ('Shama'), ('Mpohor'), ('Wiawso'), ('Bogoso'), ('Agona Nkwanta'), ('Half Assini')
) AS cities(city)
JOIN (SELECT id, name FROM public.locations WHERE type = 'region' AND name = 'Western') r ON true;

-- Volta
INSERT INTO public.locations (id, name, type, parent_id, active, created_at, updated_at)
SELECT gen_random_uuid(), city, 'city', r.id, true, now(), now()
FROM (VALUES
  ('Ho'), ('Keta'), ('Hohoe'), ('Kpando'), ('Sogakope'), ('Akatsi'), ('Anloga'), ('Denu'), ('Krachi'), ('Jasikan')
) AS cities(city)
JOIN (SELECT id, name FROM public.locations WHERE type = 'region' AND name = 'Volta') r ON true;

-- Northern
INSERT INTO public.locations (id, name, type, parent_id, active, created_at, updated_at)
SELECT gen_random_uuid(), city, 'city', r.id, true, now(), now()
FROM (VALUES
  ('Tamale'), ('Yendi'), ('Savelugu'), ('Gushegu'), ('Karaga'), ('Bimbilla'), ('Saboba'), ('Wulensi'), ('Tolon'), ('Kpandai')
) AS cities(city)
JOIN (SELECT id, name FROM public.locations WHERE type = 'region' AND name = 'Northern') r ON true;

-- Upper East
INSERT INTO public.locations (id, name, type, parent_id, active, created_at, updated_at)
SELECT gen_random_uuid(), city, 'city', r.id, true, now(), now()
FROM (VALUES
  ('Bolgatanga'), ('Bawku'), ('Navrongo'), ('Zebilla'), ('Sandema'), ('Paga'), ('Bongo'), ('Chiana'), ('Garu'), ('Tongo')
) AS cities(city)
JOIN (SELECT id, name FROM public.locations WHERE type = 'region' AND name = 'Upper East') r ON true;

-- Upper West
INSERT INTO public.locations (id, name, type, parent_id, active, created_at, updated_at)
SELECT gen_random_uuid(), city, 'city', r.id, true, now(), now()
FROM (VALUES
  ('Wa'), ('Nadowli'), ('Jirapa'), ('Tumu'), ('Lawra'), ('Lambussie'), ('Nandom'), ('Funsi'), ('Wechiau'), ('Gwollu')
) AS cities(city)
JOIN (SELECT id, name FROM public.locations WHERE type = 'region' AND name = 'Upper West') r ON true;

-- Bono
INSERT INTO public.locations (id, name, type, parent_id, active, created_at, updated_at)
SELECT gen_random_uuid(), city, 'city', r.id, true, now(), now()
FROM (VALUES
  ('Sunyani'), ('Berekum'), ('Dormaa Ahenkro'), ('Wenchi'), ('Techiman'), ('Bechem'), ('Sampa'), ('Kintampo'), ('Nsoatre'), ('Seikwa')
) AS cities(city)
JOIN (SELECT id, name FROM public.locations WHERE type = 'region' AND name = 'Bono') r ON true;

-- Bono East
INSERT INTO public.locations (id, name, type, parent_id, active, created_at, updated_at)
SELECT gen_random_uuid(), city, 'city', r.id, true, now(), now()
FROM (VALUES
  ('Techiman'), ('Kintampo'), ('Atebubu'), ('Nkoranza'), ('Yeji'), ('Prang'), ('Kwame Danso'), ('Amantin'), ('Atebubu-Amantin'), ('Ejura')
) AS cities(city)
JOIN (SELECT id, name FROM public.locations WHERE type = 'region' AND name = 'Bono East') r ON true;

-- Ahafo
INSERT INTO public.locations (id, name, type, parent_id, active, created_at, updated_at)
SELECT gen_random_uuid(), city, 'city', r.id, true, now(), now()
FROM (VALUES
  ('Goaso'), ('Hwidiem'), ('Kenyasi'), ('Bechem'), ('Duayaw Nkwanta'), ('Mim'), ('Kukuom'), ('Acherensua'), ('Yamfo'), ('Tanoso')
) AS cities(city)
JOIN (SELECT id, name FROM public.locations WHERE type = 'region' AND name = 'Ahafo') r ON true;

-- Oti
INSERT INTO public.locations (id, name, type, parent_id, active, created_at, updated_at)
SELECT gen_random_uuid(), city, 'city', r.id, true, now(), now()
FROM (VALUES
  ('Dambai'), ('Krachi Nchumuru'), ('Krachi West'), ('Krachi East'), ('Nkwanta'), ('Nkwanta South'), ('Nkwanta North'), ('Jasikan'), ('Kadjebi'), ('Biakoye')
) AS cities(city)
JOIN (SELECT id, name FROM public.locations WHERE type = 'region' AND name = 'Oti') r ON true;

-- Western North
INSERT INTO public.locations (id, name, type, parent_id, active, created_at, updated_at)
SELECT gen_random_uuid(), city, 'city', r.id, true, now(), now()
FROM (VALUES
  ('Sefwi Wiawso'), ('Bibiani'), ('Juaboso'), ('Bodi'), ('Akontombra'), ('Sefwi Bekwai'), ('Essam'), ('Enchi'), ('Adabokrom'), ('Awaso')
) AS cities(city)
JOIN (SELECT id, name FROM public.locations WHERE type = 'region' AND name = 'Western North') r ON true;

-- Savannah
INSERT INTO public.locations (id, name, type, parent_id, active, created_at, updated_at)
SELECT gen_random_uuid(), city, 'city', r.id, true, now(), now()
FROM (VALUES
  ('Damongo'), ('Bole'), ('Salaga'), ('Sawla'), ('Daboya'), ('Busunu'), ('Larabanga'), ('Tuna'), ('Labilegu'), ('Mankarigu')
) AS cities(city)
JOIN (SELECT id, name FROM public.locations WHERE type = 'region' AND name = 'Savannah') r ON true;

-- North East
INSERT INTO public.locations (id, name, type, parent_id, active, created_at, updated_at)
SELECT gen_random_uuid(), city, 'city', r.id, true, now(), now()
FROM (VALUES
  ('Nalerigu'), ('Walewale'), ('Gambaga'), ('Chereponi'), ('Bunkpurugu'), ('Yunyoo'), ('Mamprugu'), ('Langbinsi'), ('Sakogu'), ('Tinguri')
) AS cities(city)
JOIN (SELECT id, name FROM public.locations WHERE type = 'region' AND name = 'North East') r ON true; 