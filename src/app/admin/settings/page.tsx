import { prisma } from "@/lib/db";

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSetting.findMany({ orderBy: { key: "asc" } });
  return (
    <div>
      <h1 className="text-3xl font-semibold">网站设置</h1>
      <p className="mt-3 text-[#8B95A7]">支付宝/微信收款码、网站名称、Logo、首页文案、用户协议、隐私政策、退款规则均存储在 site_settings。</p>
      <div className="mt-8 space-y-3">
        {settings.map((setting) => (
          <div key={setting.id} className="glass rounded-2xl p-5">
            <p className="font-semibold">{setting.key}</p>
            <p className="mt-2 text-sm text-[#8B95A7]">{setting.description}</p>
            <p className="mt-3 break-all text-sm">{setting.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
