#!/usr/bin/env node
/**
 * Cria (ou promove) um utilizador admin.
 *
 * Uso:
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   node scripts/create-admin.mjs --email admin@exemplo.pt --password 'SenhaSegura123!' --name 'Admin Scuderia'
 *
 * Se o email já existir, apenas actualiza o perfil para role=admin.
 */

import { createClient } from "@supabase/supabase-js";

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const email = String(args.email ?? "").trim().toLowerCase();
const password = String(args.password ?? "");
const fullName = String(args.name ?? "Administrador").trim();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !serviceKey) {
  console.error(
    "Define NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.",
  );
  process.exit(1);
}

if (!email || !email.includes("@")) {
  console.error("Indica --email válido.");
  process.exit(1);
}

if (!password || password.length < 8) {
  console.error("Indica --password com pelo menos 8 caracteres.");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function promoteProfile(userId) {
  const { error } = await admin
    .from("profiles")
    .update({ role: "admin", full_name: fullName })
    .eq("id", userId);

  if (error) {
    throw new Error(`Perfil actualizado falhou: ${error.message}`);
  }
}

async function main() {
  const { data: listed, error: listError } =
    await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (listError) {
    throw new Error(`Listagem de users falhou: ${listError.message}`);
  }

  const existing = listed.users.find(
    (u) => u.email?.toLowerCase() === email,
  );

  if (existing) {
    await promoteProfile(existing.id);
    console.log(`Utilizador existente promovido a admin: ${email}`);
    return;
  }

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

  if (createError || !created.user) {
    throw new Error(
      createError?.message ?? "Não foi possível criar o utilizador.",
    );
  }

  await promoteProfile(created.user.id);
  console.log(`Admin criado: ${email}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
