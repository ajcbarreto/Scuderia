import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { GaragemChrome } from "@/components/garagem/garagem-chrome";

export default async function GaragemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/garagem");
  }

  return <GaragemChrome>{children}</GaragemChrome>;
}
