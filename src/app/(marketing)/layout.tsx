import { FloatingWhatsApp } from "@/components/marketing/floating-whatsapp";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getProfile } from "@/lib/auth";
import { accountAreaHref, accountAreaLabel } from "@/lib/post-login-redirect";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  const role = profile?.role ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PageViewTracker />
      <SiteHeader
        accountHref={accountAreaHref(role)}
        accountLabel={accountAreaLabel(role)}
      />
      <FloatingWhatsApp />
      <main className="flex-1 pt-[73px]">{children}</main>
      <SiteFooter />
    </div>
  );
}
