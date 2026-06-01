import Link from "next/link";
import { loginAction } from "@/app/actions";
import { PasswordInput } from "@/components/password-input";
import { Container } from "@/components/ui";
import { getOrCreateCsrfToken } from "@/lib/csrf";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const locale = await getCurrentLocale();
  const t = getDictionary(locale);
  const csrfToken = await getOrCreateCsrfToken();
  const params = await searchParams;

  const errorMessages: Record<string, string> = {
    invalid: t.auth.loginErrorInvalid,
    "login-limited": t.auth.loginErrorLimited,
    "account-exists": t.auth.loginErrorAccountExists
  };

  const errorMessage = params.message ? errorMessages[params.message] || t.auth.loginErrorDefault : null;

  return (
    <Container className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-16">
      <form action={loginAction} className="glass w-full max-w-md rounded-2xl p-8">
        <input type="hidden" name="csrfToken" value={csrfToken} />
        <h1 className="text-3xl font-semibold">{t.auth.loginTitle}</h1>
        <p className="mt-3 text-sm text-[#8B95A7]">{t.auth.loginIntro}</p>
        {errorMessage && (
          <div className="mt-4 rounded-lg bg-red-500/20 border border-red-500/30 px-4 py-3 text-sm text-red-400">
            {errorMessage}
          </div>
        )}
        <label className="mt-6 block text-sm">{t.auth.email}</label>
        <input name="email" type="text" required autoComplete="username" className="mt-2 w-full rounded-xl border border-white/12 bg-white/8 px-4 py-3 outline-none focus:border-[#7AA7FF]" />
        <label className="mt-5 block text-sm">{t.auth.password}</label>
        <PasswordInput
          name="password"
          required
          autoComplete="current-password"
          showLabel={t.auth.showPassword}
          hideLabel={t.auth.hidePassword}
          wrapperClassName="mt-2"
          className="w-full rounded-xl border border-white/12 bg-white/8 px-4 py-3 outline-none focus:border-[#7AA7FF]"
        />
        <button className="mt-8 w-full rounded-full bg-[#7AA7FF] px-5 py-3 font-semibold text-[#07101f]">{t.auth.loginButton}</button>
        <p className="mt-5 text-center text-sm text-[#8B95A7]">
          {t.auth.noAccount}<Link className="text-[#48F5D3]" href="/register">{t.auth.registerNow}</Link>
        </p>
      </form>
    </Container>
  );
}
