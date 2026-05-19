import Link from "next/link";
import { legalPages } from "@/lib/legal";
import { Container } from "@/components/ui";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 py-10 text-sm text-[#8B95A7]">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-semibold text-[#E8EEF8]">恩禾 ENHE AI工具站</p>
            <p className="mt-2">© 2026 恩禾 ENHE AI工具站</p>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-3">
            {legalPages.map((page) => (
              <Link key={page.slug} href={`/legal/${page.slug}`} className="transition hover:text-[#48F5D3]">
                {page.title}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}
