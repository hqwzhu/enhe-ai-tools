import { prisma } from "@/lib/db";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({ include: { memberships: true }, orderBy: { createdAt: "desc" } });
  return <AdminTable title="用户管理" rows={users.map((user) => [user.email ?? user.phone ?? user.id, user.nickname ?? "-", user.role, user.status, `${user.memberships.length} 个会员记录`])} />;
}

function AdminTable({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <div>
      <h1 className="text-3xl font-semibold">{title}</h1>
      <div className="glass mt-8 overflow-hidden rounded-2xl">
        {rows.map((row, index) => <div key={index} className="grid gap-3 border-b border-white/10 p-4 text-sm text-[#8B95A7] md:grid-cols-5">{row.map((cell) => <span key={cell}>{cell}</span>)}</div>)}
      </div>
    </div>
  );
}
