import { FloatingWhatsApp } from "@/components/marketing/floating-whatsapp";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#0e0e0e]">
      <SiteHeader />
      <FloatingWhatsApp />
      <main className="flex-1 pt-[73px]">{children}</main>
      <SiteFooter />
    </div>
  );
}
