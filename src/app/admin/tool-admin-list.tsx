import Link from "next/link";
import { deleteToolAction, upsertToolAction } from "@/app/admin/actions";
import { DangerButton, Field, inputClass, selectClass, SubmitButton, textareaClass } from "@/app/admin/admin-ui";
import { getAdminToolBasePath, getAdminToolEditPath, getAdminToolNewPath } from "@/lib/admin-tool-routes";

type AdminToolType = "software" | "online";

type ToolItem = {
  id: string;
  name: string;
  slug: string;
  type: AdminToolType;
  status: string;
  sortOrder: number;
  shortDescription: string;
  content: string;
  coverImage: string | null;
  screenshots: string[];
  version: string | null;
  systemRequirement: string | null;
  isVipRequired: boolean;
  isDownloadPaid: boolean;
  downloadPrice: unknown;
  onlineUrl: string | null;
  downloadFileId: string | null;
  categoryId: string | null;
  category?: { name: string } | null;
};

type ToolCategoryItem = { id: string; name: string; type: string };
type FileItem = { id: string; fileName: string; fileUrl: string | null };
type Notice = Record<string, string | undefined>;

const statusText: Record<string, string> = {
  draft: "草稿",
  published: "发布",
  offline: "下架"
};

const statusClass: Record<string, string> = {
  draft: "border-white/15 bg-white/8 text-[#8B95A7]",
  published: "border-[#48F5D3]/30 bg-[#48F5D3]/10 text-[#48F5D3]",
  offline: "border-amber-300/30 bg-amber-300/10 text-amber-100"
};

function NoticeBar({ notice }: { notice?: Notice }) {
  if (notice?.saved) {
    return <p className="mt-4 rounded-xl border border-[#48F5D3]/30 bg-[#48F5D3]/10 px-4 py-3 text-sm text-[#48F5D3]">保存成功。</p>;
  }
  if (notice?.deleted) {
    return <p className="mt-4 rounded-xl border border-[#48F5D3]/30 bg-[#48F5D3]/10 px-4 py-3 text-sm text-[#48F5D3]">删除成功。</p>;
  }
  if (notice?.error) {
    return <p className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">操作失败：{notice.error}</p>;
  }
  return null;
}

function formatPrice(price: unknown) {
  const value = Number(price ?? 0);
  return Number.isFinite(value) ? `¥${value.toFixed(2)}` : "¥0.00";
}

function Badge({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
  return <span className={`rounded-full border px-3 py-1 text-xs ${className}`}>{children}</span>;
}

export function ToolAdminList({
  title,
  type,
  tools,
  notice
}: {
  title: string;
  type: AdminToolType;
  tools: ToolItem[];
  notice?: Notice;
}) {
  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#8B95A7]">
            以清单模式管理已保存工具，点击查看/编辑进入单独详情页后再修改、上下架或删除。
          </p>
        </div>
        <Link href={getAdminToolNewPath(type)} className="rounded-full bg-[#7AA7FF] px-5 py-3 text-sm font-semibold text-[#07101f]">
          新增工具
        </Link>
      </div>

      <NoticeBar notice={notice} />

      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/12 bg-white/6">
        <div className="grid min-w-[900px] grid-cols-[1.6fr_0.9fr_0.7fr_0.8fr_0.6fr] gap-4 border-b border-white/10 px-5 py-3 text-xs uppercase tracking-wide text-[#8B95A7]">
          <span>工具</span>
          <span>分类</span>
          <span>状态</span>
          <span>权限/价格</span>
          <span className="text-right">操作</span>
        </div>

        {tools.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-[#8B95A7]">暂无工具，先新增一个工具。</div>
        ) : (
          <div className="min-w-[900px] divide-y divide-white/10">
            {tools.map((tool) => (
              <div key={tool.id} className="grid grid-cols-[1.6fr_0.9fr_0.7fr_0.8fr_0.6fr] gap-4 px-5 py-4 text-sm transition hover:bg-white/5">
                <div>
                  <p className="font-semibold text-[#E8EEF8]">{tool.name}</p>
                  <p className="mt-1 text-xs text-[#8B95A7]">{tool.slug}</p>
                </div>
                <div className="text-[#C5D0E2]">{tool.category?.name ?? "未分类"}</div>
                <div>
                  <Badge className={statusClass[tool.status] ?? statusClass.draft}>{statusText[tool.status] ?? tool.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tool.isVipRequired ? <Badge className="border-[#7AA7FF]/30 bg-[#7AA7FF]/10 text-[#AFC8FF]">VIP</Badge> : <Badge className="border-white/15 bg-white/8 text-[#C5D0E2]">免费</Badge>}
                  {type === "software" && tool.isDownloadPaid ? (
                    <Badge className="border-[#FFB86B]/40 bg-[#FFB86B]/10 text-[#FFB86B]">{formatPrice(tool.downloadPrice)}</Badge>
                  ) : null}
                </div>
                <div className="text-right">
                  <Link href={getAdminToolEditPath(type, tool.id)} className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-[#E8EEF8] transition hover:border-[#48F5D3]/50 hover:text-[#48F5D3]">
                    查看/编辑
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ToolEditor({
  title,
  type,
  tool,
  categories,
  files,
  notice
}: {
  title: string;
  type: AdminToolType;
  tool?: ToolItem;
  categories: ToolCategoryItem[];
  files: FileItem[];
  notice?: Notice;
}) {
  const editorPath = getAdminToolEditPath(type, tool?.id ?? "new");
  const listPath = getAdminToolBasePath(type);
  const matchingCategories = categories.filter((category) => category.type === type);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#8B95A7]">
            在单独详情页编辑工具基础信息、权限、封面、截图、下载文件或在线地址。
          </p>
        </div>
        <Link href={listPath} className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-[#E8EEF8] transition hover:border-[#48F5D3]/50 hover:text-[#48F5D3]">
          返回工具清单
        </Link>
      </div>

      <NoticeBar notice={notice} />

      <form action={upsertToolAction} encType="multipart/form-data" className="glass mt-8 grid gap-4 rounded-2xl p-6 md:grid-cols-2">
        {tool ? <input type="hidden" name="id" value={tool.id} /> : null}
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="returnTo" value={editorPath} />

        <Field label="工具名称">
          <input name="name" required defaultValue={tool?.name ?? ""} className={inputClass} />
        </Field>
        <Field label="Slug">
          <input name="slug" defaultValue={tool?.slug ?? ""} placeholder="留空自动生成" className={inputClass} />
        </Field>
        <Field label="分类">
          <select name="categoryId" defaultValue={tool?.categoryId ?? ""} className={selectClass}>
            <option value="">未分类</option>
            {matchingCategories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </Field>
        <Field label="状态">
          <select name="status" defaultValue={tool?.status ?? "draft"} className={selectClass}>
            <option value="draft">草稿</option>
            <option value="published">发布</option>
            <option value="offline">下架</option>
          </select>
        </Field>
        <Field label="排序">
          <input name="sortOrder" type="number" defaultValue={tool?.sortOrder ?? 0} className={inputClass} />
        </Field>
        <Field label="封面图地址">
          <input name="coverImage" defaultValue={tool?.coverImage ?? ""} placeholder="/uploads/cover.jpg 或 https://..." className={inputClass} />
        </Field>
        <Field label="本地上传封面图">
          <input name="coverImageFile" type="file" accept="image/*" className={inputClass} />
          <span className="mt-2 block text-xs leading-5 text-[#8B95A7]">
            建议尺寸 1200x675 或 16:9，JPG/PNG/WebP，8MB 以内。上传后会自动覆盖封面图地址。
          </span>
        </Field>
        <Field label="版本">
          <input name="version" defaultValue={tool?.version ?? ""} className={inputClass} />
        </Field>
        <Field label="系统要求">
          <input name="systemRequirement" defaultValue={tool?.systemRequirement ?? ""} disabled={type !== "software"} className={inputClass} />
        </Field>
        <Field label="下载文件">
          <select name="downloadFileId" defaultValue={tool?.downloadFileId ?? ""} className={selectClass} disabled={type !== "software"}>
            <option value="">不绑定</option>
            {files.map((file) => <option key={file.id} value={file.id}>{file.fileName}</option>)}
          </select>
        </Field>
        <Field label="在线地址">
          <input name="onlineUrl" defaultValue={tool?.onlineUrl ?? ""} disabled={type !== "online"} className={inputClass} />
        </Field>
        <label className="inline-flex items-center gap-2 text-sm">
          <input name="isVipRequired" type="checkbox" defaultChecked={tool?.isVipRequired ?? true} /> 需要 VIP
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input name="isDownloadPaid" type="checkbox" defaultChecked={tool?.isDownloadPaid ?? false} disabled={type !== "software"} /> 下载单独付费
        </label>
        <Field label="下载价格">
          <input name="downloadPrice" type="number" step="0.01" defaultValue={tool?.downloadPrice != null ? String(tool.downloadPrice) : "0"} disabled={type !== "software"} className={inputClass} />
        </Field>
        <Field label="截图地址，逗号或换行分隔" className="md:col-span-2">
          <textarea name="screenshots" defaultValue={tool?.screenshots.join("\n") ?? ""} className={textareaClass} />
        </Field>
        <Field label="简介" className="md:col-span-2">
          <textarea name="shortDescription" required defaultValue={tool?.shortDescription ?? ""} className={textareaClass} />
        </Field>
        <Field label="详细介绍" className="md:col-span-2">
          <textarea name="content" required defaultValue={tool?.content ?? ""} className={textareaClass} />
        </Field>
        <div className="md:col-span-2">
          <SubmitButton>{tool ? "保存工具" : "新增工具"}</SubmitButton>
        </div>
      </form>

      {tool ? (
        <form action={deleteToolAction} className="mt-4">
          <input type="hidden" name="id" value={tool.id} />
          <input type="hidden" name="type" value={type} />
          <DangerButton>删除工具</DangerButton>
        </form>
      ) : null}
    </div>
  );
}
