import Link from "next/link";
import { registerAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { PasswordInput } from "@/components/password-input";
import { Container } from "@/components/ui";
import { getOrCreateCsrfToken } from "@/lib/csrf";
import { getCurrentLocale, getDictionary } from "@/lib/i18n";

export default async function RegisterPage() {
  const locale = await getCurrentLocale();
  const t = getDictionary(locale);
  const csrfToken = await getOrCreateCsrfToken();

  return (
    <Container className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-16">
      <form action={registerAction} className="glass w-full max-w-md rounded-2xl p-8">
        <input type="hidden" name="csrfToken" value={csrfToken} />
        <h1 className="text-3xl font-semibold">{t.auth.registerTitle}</h1>
        <p className="mt-3 text-sm text-[#8B95A7]">{t.auth.registerIntro}</p>
        <label className="mt-8 block text-sm">{t.auth.email}</label>
        <input name="email" type="text" required autoComplete="username" className="mt-2 w-full rounded-xl border border-white/12 bg-white/8 px-4 py-3 outline-none focus:border-[#7AA7FF]" />
        <label className="mt-5 block text-sm">{t.auth.password}</label>
        <PasswordInput
          name="password"
          minLength={6}
          required
          autoComplete="new-password"
          showLabel={t.auth.showPassword}
          hideLabel={t.auth.hidePassword}
          wrapperClassName="mt-2"
          className="w-full rounded-xl border border-white/12 bg-white/8 px-4 py-3 outline-none focus:border-[#7AA7FF]"
        />
                <label className="mt-5 block text-sm">{locale === "en" ? "Newsletter email (optional)" : "推送邮箱（选填）"}</label>
        <input name="newsletterEmail" type="email" autoComplete="email" placeholder={locale === "en" ? "Receive monthly product digest" : "用于接收网站资讯，留空则不订阅"} className="mt-2 w-full rounded-xl border border-white/12 bg-white/8 px-4 py-3 outline-none focus:border-[#7AA7FF]" />
        <label className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-[#F6FAFF]">
          <input type="hidden" name="acceptEmailUpdates" value="false" />
          <input name="acceptEmailUpdates" type="checkbox" defaultChecked className="h-4 w-4 accent-[#7AA7FF]" value="true" />
          {locale === "en" ? "I want to receive ENHE AI monthly product digest" : "我愿意接收 ENHE AI 月度产品简报和更新资讯"}
        </label>

        <FormSubmitButton className="mt-8 w-full bg-[#7AA7FF] text-base text-[#07101f]" pendingLabel="创建中...">{t.auth.createAccount}</FormSubmitButton>
        <p className="mt-5 text-center text-sm text-[#8B95A7]">
          {t.auth.hasAccount}<Link className="text-[#48F5D3]" href="/login">{t.auth.goLogin}</Link>
        </p>
      </form>
    </Container>
  );
}
