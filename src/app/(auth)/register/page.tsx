import Link from "next/link";
import { registerAction } from "@/app/actions";
import { Container } from "@/components/ui";

export default function RegisterPage() {
  return (
    <Container className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-16">
      <form action={registerAction} className="glass w-full max-w-md rounded-2xl p-8">
        <h1 className="text-3xl font-semibold">注册</h1>
        <p className="mt-3 text-sm text-[#8B95A7]">免费注册后可浏览工具、提交评论和上传付款截图。</p>
        <label className="mt-8 block text-sm">邮箱</label>
        <input name="email" type="email" required className="mt-2 w-full rounded-xl border border-white/12 bg-white/8 px-4 py-3 outline-none focus:border-[#7AA7FF]" />
        <label className="mt-5 block text-sm">密码</label>
        <input name="password" type="password" minLength={6} required className="mt-2 w-full rounded-xl border border-white/12 bg-white/8 px-4 py-3 outline-none focus:border-[#7AA7FF]" />
        <button className="mt-8 w-full rounded-full bg-[#7AA7FF] px-5 py-3 font-semibold text-[#07101f]">创建账号</button>
        <p className="mt-5 text-center text-sm text-[#8B95A7]">
          已有账号？<Link className="text-[#48F5D3]" href="/login">去登录</Link>
        </p>
      </form>
    </Container>
  );
}
