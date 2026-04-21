import { redirect } from "next/navigation";

/** O registo público está desativado — contas criadas apenas pela oficina. */
export default function RegisterPage() {
  redirect("/login");
}
