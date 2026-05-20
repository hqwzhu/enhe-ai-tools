import Link from "next/link";
import { loginAction } from "@/app/actions";
import { Container } from "@/components/ui";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";

export default async function LoginPage() {
  const locale = await getCurrentLocale();
  const t = getDictionary(locale);

  return (
    <Container className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-16">
      <form action={loginAction} className="glass w-full max-w-md rounded-2xl p-8">
        <h1 className="text-3xl font-semibold">{t.auth.loginTitle}</h1>
        <p className="mt-3 text-sm text-[#8B95A7]">{t.auth.loginIntro}</p>
        <label className="mt-8 block text-sm">{t.auth.email}</label>
        <input name="email" type="email" required className="mt-2 w-full rounded-xl border border-white/12 bg-white/8 px-4 py-3 outline-none focus:border-[#7AA7FF]" />
        <label className="mt-5 block text-sm">{t.auth.password}</label>
        <input name="password" type="password" required className="mt-2 w-full rounded-xl border border-white/12 bg-white/8 px-4 py-3 outline-none focus:border-[#7AA7FF]" />
        <button className="mt-8 w-full rounded-full bg-[#7AA7FF] px-5 py-3 font-semibold text-[#07101f]">{t.auth.loginButton}</button>
        <p className="mt-5 text-center text-sm text-[#8B95A7]">
          {t.auth.noAccount}<Link className="text-[#48F5D3]" href="/register">{t.auth.registerNow}</Link>
        </p>
      </form>
    </Container>
  );
}
