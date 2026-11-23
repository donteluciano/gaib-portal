import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import './site.css';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="hc-site">
      <SiteHeader />
      <main className="flex-1 pt-[72px]">{children}</main>
      <SiteFooter />
    </div>
  );
}
