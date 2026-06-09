-- Promove um utilizador existente a admin (substitui o email).
-- O utilizador tem de existir em auth.users (registo ou convite já aceite).

update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'admin@scuderiaittech.pt' limit 1
);

-- Verifica:
-- select p.id, u.email, p.role, p.full_name
-- from public.profiles p
-- join auth.users u on u.id = p.id
-- where u.email = 'admin@scuderiaittech.pt';
