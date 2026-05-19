import { deleteToolAction, upsertToolAction } from "@/app/admin/actions";
import { DangerButton, Field, inputClass, selectClass, SubmitButton, textareaClass } from "@/app/admin/admin-ui";

type ToolAdminListProps = {
  title: string;
  type: "software" | "online";
  tools: Array<{
    id: string;
    name: string;
    slug: string;
    type: "software" | "online";
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
  }>;
  categories: Array<{ id: string; name: string; type: string }>;
  files: Array<{ id: string; fileName: string; fileUrl: string | null }>;
};

export function ToolAdminList({ title, type, tools, categories, files }: ToolAdminListProps) {
  return (
    <div>
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mt-3 text-[#8B95A7]">支持新增、编辑、删除、上下架、下载文件或在线地址字段。</p>
      <ToolForm type={type} categories={categories} files={files} />
      <div className="mt-8 space-y-4">
        {tools.map((tool) => (
          <div key={tool.id} className="glass rounded-2xl p-5">
            <ToolForm tool={tool} type={type} categories={categories} files={files} />
            <form action={deleteToolAction} className="mt-3">
              <input type="hidden" name="id" value={tool.id} />
              <input type="hidden" name="type" value={type} />
              <DangerButton />
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToolForm({
  tool,
  type,
  categories,
  files
}: {
  tool?: ToolAdminListProps["tools"][number];
  type: "software" | "online";
  categories: ToolAdminListProps["categories"];
  files: ToolAdminListProps["files"];
}) {
  return (
    <form action={upsertToolAction} className="glass grid gap-4 rounded-2xl p-6 md:grid-cols-2">
      {tool ? <input type="hidden" name="id" value={tool.id} /> : null}
      <input type="hidden" name="type" value={type} />
      <Field label="工具名称"><input name="name" required defaultValue={tool?.name ?? ""} className={inputClass} /></Field>
      <Field label="Slug"><input name="slug" defaultValue={tool?.slug ?? ""} placeholder="留空自动生成" className={inputClass} /></Field>
      <Field label="分类">
        <select name="categoryId" defaultValue={tool?.categoryId ?? ""} className={selectClass}>
          <option value="">未分类</option>
          {categories.filter((category) => category.type === type).map((category) => (
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
      <Field label="排序"><input name="sortOrder" type="number" defaultValue={tool?.sortOrder ?? 0} className={inputClass} /></Field>
      <Field label="封面图"><input name="coverImage" defaultValue={tool?.coverImage ?? ""} className={inputClass} /></Field>
      <Field label="版本"><input name="version" defaultValue={tool?.version ?? ""} className={inputClass} /></Field>
      <Field label="系统要求"><input name="systemRequirement" defaultValue={tool?.systemRequirement ?? ""} className={inputClass} /></Field>
      <Field label="下载文件">
        <select name="downloadFileId" defaultValue={tool?.downloadFileId ?? ""} className={selectClass} disabled={type !== "software"}>
          <option value="">不绑定</option>
          {files.map((file) => <option key={file.id} value={file.id}>{file.fileName}</option>)}
        </select>
      </Field>
      <Field label="在线地址"><input name="onlineUrl" defaultValue={tool?.onlineUrl ?? ""} disabled={type !== "online"} className={inputClass} /></Field>
      <label className="inline-flex items-center gap-2 text-sm"><input name="isVipRequired" type="checkbox" defaultChecked={tool?.isVipRequired ?? true} /> 需要 VIP</label>
      <label className="inline-flex items-center gap-2 text-sm"><input name="isDownloadPaid" type="checkbox" defaultChecked={tool?.isDownloadPaid ?? false} disabled={type !== "software"} /> 下载单独付费</label>
      <Field label="下载价格"><input name="downloadPrice" type="number" step="0.01" defaultValue={tool?.downloadPrice ? String(tool.downloadPrice) : "0"} disabled={type !== "software"} className={inputClass} /></Field>
      <Field label="截图地址，逗号或换行分隔" className="md:col-span-2">
        <textarea name="screenshots" defaultValue={tool?.screenshots.join("\n") ?? ""} className={textareaClass} />
      </Field>
      <Field label="简介" className="md:col-span-2"><textarea name="shortDescription" required defaultValue={tool?.shortDescription ?? ""} className={textareaClass} /></Field>
      <Field label="详细介绍" className="md:col-span-2"><textarea name="content" required defaultValue={tool?.content ?? ""} className={textareaClass} /></Field>
      <div className="md:col-span-2"><SubmitButton>{tool ? "保存工具" : "新增工具"}</SubmitButton></div>
    </form>
  );
}
