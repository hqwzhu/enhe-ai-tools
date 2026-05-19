import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, UserRound } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { ButtonLink, Container } from "@/components/ui";

const navItems = [
  ["首页", "/"],
  ["电脑软件工具", "/software"],
  ["在线网页工具", "/online-tools"],
  ["会员价格", "/pricing"],
  ["使用教程", "/tutorials"],
  ["用户中心", "/user"]
] as const;

export async function SiteHeader() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080B12]/72 backdrop-blur-2xl">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center overflow-hidden rounded-2xl bg-white/6 shadow-[0_0_24px_rgba(72,245,211,0.16)]">
            <Image src="/images/enhe-logo.svg" alt="恩禾 ENHE AI" width={34} height={34} priority />
          </span>
          <span className="font-semibold">恩禾 ENHE AI</span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map(([label, href]) => (
            <Link key={href} href={href} className="rounded-full px-3 py-2 text-sm text-[#8B95A7] hover:bg-white/8 hover:text-white">
              {label}
            </Link>
          ))}
          {user?.role === "admin" ? (
            <Link href="/admin" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-[#48F5D3] hover:bg-white/8">
              <LayoutDashboard size={16} />
              后台管理
            </Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Link href="/user" className="inline-flex items-center gap-2 rounded-full border border-white/12 px-3 py-2 text-sm">
              <UserRound size={16} />
              {user.nickname ?? user.email ?? "用户"}
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden rounded-full px-4 py-2 text-sm text-[#8B95A7] sm:inline-flex">
                登录
              </Link>
              <ButtonLink href="/register">注册</ButtonLink>
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
