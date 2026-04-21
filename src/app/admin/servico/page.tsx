import { redirect } from "next/navigation";

/** Rota antiga — mantida para links gravados; o trabalho da oficina está em Boletins. */
export default function AdminServicoRedirectPage() {
  redirect("/admin/boletins");
}
