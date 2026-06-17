import Link from "next/link";
import { loginAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { PasswordInput } from "@/components/password-input";
import { Container } from "@/components/ui";
import { getOrCreateCsrfToken } from "@/lib/csrf";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string; payment?: string }>;
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
  const paymentSuccess = params.payment === "success";

  return (
    <Container className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-16">
      <form action={loginAction} className="surface-panel w-full max-w-md p-8">
        <input type="hidden" name="csrfToken" value={csrfToken} />
        <h1 className="text-3xl font-black text-[var(--marketing-text)]">{t.auth.loginTitle}</h1>
        <p className="mt-3 text-sm font-medium text-[var(--marketing-muted)]">{t.auth.loginIntro}</p>
        {paymentSuccess && (
          <div className="status-success mt-4">
            购买成功，请返回网页或者手机登入账号查看下载链接。
          </div>
        )}
        {errorMessage && (
          <div className="status-danger mt-4">
            {errorMessage}
          </div>
        )}
        <label className="mt-6 block text-sm font-semibold text-[var(--marketing-text)]">{t.auth.email}</label>
        <input name="email" type="text" required autoComplete="username" className="form-control-dark mt-2" />
        <label className="mt-5 block text-sm font-semibold text-[var(--marketing-text)]">{t.auth.password}</label>
        <PasswordInput
          name="password"
          required
          autoComplete="current-password"
          showLabel={t.auth.showPassword}
          hideLabel={t.auth.hidePassword}
          wrapperClassName="mt-2"
          className="form-control-dark"
        />
        <FormSubmitButton className="mt-8 w-full text-base" pendingLabel="登录中...">{t.auth.loginButton}</FormSubmitButton>
        <p className="mt-5 text-center text-sm text-[var(--marketing-muted)]">
          {t.auth.noAccount}<Link className="font-semibold text-[var(--marketing-accent)]" href="/register">{t.auth.registerNow}</Link>
        </p>
      </form>
    </Container>
  );
}
