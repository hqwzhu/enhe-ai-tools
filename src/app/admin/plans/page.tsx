import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { upsertVipPlanAction } from "@/app/admin/actions";
import { AdminSection, Field, inputClass, selectClass, SubmitButton, textareaClass } from "@/app/admin/admin-ui";

export default async function AdminPlansPage() {
  const plans = await prisma.vipPlan.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <AdminSection title="会员套餐管理" intro="支持新增、编辑、启用、禁用和设置推荐套餐。推荐套餐保存时会自动取消其他套餐推荐状态。">
      <PlanForm />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.id} className="glass rounded-2xl p-6">
            <p className="text-xl font-semibold">{plan.name}</p>
            <p className="mt-2 text-[#FFB86B]">{formatCurrency(plan.price.toString())}</p>
            <p className="mt-2 text-sm text-[#8B95A7]">{plan.durationDays || "永久"} 天 · {plan.status} · {plan.isRecommended ? "推荐" : "普通"}</p>
            <form action={upsertVipPlanAction} className="mt-5 grid gap-3">
              <input type="hidden" name="id" value={plan.id} />
              <Field label="名称"><input name="name" defaultValue={plan.name} className={inputClass} /></Field>
              <Field label="价格"><input name="price" type="number" step="0.01" defaultValue={plan.price.toString()} className={inputClass} /></Field>
              <Field label="原价"><input name="originalPrice" type="number" step="0.01" defaultValue={plan.originalPrice?.toString() ?? ""} className={inputClass} /></Field>
              <Field label="天数"><input name="durationDays" type="number" defaultValue={plan.durationDays} className={inputClass} /></Field>
              <Field label="排序"><input name="sortOrder" type="number" defaultValue={plan.sortOrder} className={inputClass} /></Field>
              <Field label="状态">
                <select name="status" defaultValue={plan.status} className={selectClass}>
                  <option value="active">启用</option>
                  <option value="disabled">禁用</option>
                </select>
              </Field>
              <label className="inline-flex items-center gap-2 text-sm"><input name="isRecommended" type="checkbox" defaultChecked={plan.isRecommended} /> 推荐套餐</label>
              <Field label="描述"><textarea name="description" defaultValue={plan.description ?? ""} className={textareaClass} /></Field>
              <SubmitButton>保存套餐</SubmitButton>
            </form>
          </div>
        ))}
      </div>
    </AdminSection>
  );
}

function PlanForm() {
  return (
    <form action={upsertVipPlanAction} className="glass grid gap-4 rounded-2xl p-6 md:grid-cols-3">
      <Field label="套餐名称"><input name="name" required className={inputClass} /></Field>
      <Field label="价格"><input name="price" type="number" step="0.01" required className={inputClass} /></Field>
      <Field label="原价"><input name="originalPrice" type="number" step="0.01" className={inputClass} /></Field>
      <Field label="有效天数"><input name="durationDays" type="number" defaultValue={30} className={inputClass} /></Field>
      <Field label="排序"><input name="sortOrder" type="number" defaultValue={0} className={inputClass} /></Field>
      <Field label="状态">
        <select name="status" className={selectClass}>
          <option value="active">启用</option>
          <option value="disabled">禁用</option>
        </select>
      </Field>
      <label className="inline-flex items-center gap-2 text-sm"><input name="isRecommended" type="checkbox" /> 推荐套餐</label>
      <Field label="描述" className="md:col-span-3"><textarea name="description" className={textareaClass} /></Field>
      <div className="md:col-span-3"><SubmitButton>新增套餐</SubmitButton></div>
    </form>
  );
}
