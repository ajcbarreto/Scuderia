-- Promove oficina@scuderiaittech.pt a admin.
-- O utilizador tem de existir em auth.users (criado em Authentication → Users).

update public.profiles
set role = 'admin',
    full_name = 'Oficina Scuderia'
where id = (
  select id from auth.users where email = 'oficina@scuderiaittech.pt' limit 1
);

-- Verifica:
-- select p.id, u.email, p.role, p.full_name
-- from public.profiles p
-- join auth.users u on u.id = p.id
-- where u.email = 'oficina@scuderiaittech.pt';
