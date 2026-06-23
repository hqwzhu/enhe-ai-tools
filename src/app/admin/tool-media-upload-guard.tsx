"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";

type GuardedUploadName = "coverImageFile" | "screenshotFiles" | "videoFile";

type ToolMediaUploadGuardProps = {
  name: GuardedUploadName;
  inputClass: string;
  multiple?: boolean;
};

const maxImageBytes = 8 * 1024 * 1024;
const maxBatchBytes = 64 * 1024 * 1024;
const maxVideoBytes = 500 * 1024 * 1024;
const videoAccept = "video/mp4,video/webm,video/quicktime,video/*";

function formatBytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)}MB`;
}

export function ToolMediaUploadGuard({ name, inputClass, multiple = false }: ToolMediaUploadGuardProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const rejectedFileRef = useRef(false);
  const [message, setMessage] = useState("");

  function rejectInput(input: HTMLInputElement, nextMessage: string) {
    input.value = "";
    rejectedFileRef.current = true;
    setMessage(nextMessage);
  }

  const validateInput = useCallback((input: HTMLInputElement) => {
    const files = Array.from(input.files ?? []);
    const isVideoInput = name === "videoFile";
    const maxSingleFileBytes = isVideoInput ? maxVideoBytes : maxImageBytes;
    const maxTotalBytes = isVideoInput ? maxVideoBytes : maxBatchBytes;
    if (files.length === 0) {
      setMessage("");
      rejectedFileRef.current = false;
      return true;
    }

    const invalidFile = files.find((file) => {
      if (isVideoInput) return !file.type.startsWith("video/");
      return !file.type.startsWith("image/");
    });
    if (invalidFile) {
      rejectInput(input, isVideoInput ? `请上传 MP4、WebM 或 MOV 等视频文件，${invalidFile.name} 格式不支持。` : `请上传 JPG、PNG 或 WebP 等图片文件，${invalidFile.name} 格式不支持。`);
      return false;
    }

    const oversized = files.find((file) => file.size > maxSingleFileBytes);
    if (oversized) {
      rejectInput(input, `${isVideoInput ? "视频" : "图片"}文件不能超过 ${formatBytes(maxSingleFileBytes)}。${oversized.name} 为 ${formatBytes(oversized.size)}。`);
      return false;
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > maxTotalBytes) {
      rejectInput(input, `本次选择的文件合计不能超过 ${formatBytes(maxTotalBytes)}。`);
      return false;
    }

    setMessage("");
    rejectedFileRef.current = false;
    return true;
  }, [name]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (!validateInput(event.currentTarget)) {
      event.preventDefault();
    }
  }

  useEffect(() => {
    const form = rootRef.current?.closest("form");
    const input = rootRef.current?.querySelector<HTMLInputElement>(`input[name="${name}"]`);
    if (!form || !input) return;
    const guardedInput = input;

    function handleSubmit(event: SubmitEvent) {
      if (rejectedFileRef.current) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (!validateInput(guardedInput)) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    form.addEventListener("submit", handleSubmit, { capture: true });
    return () => form.removeEventListener("submit", handleSubmit, { capture: true });
  }, [name, validateInput]);

  return (
    <span ref={rootRef} className="block">
      <input name={name} type="file" accept={name === "videoFile" ? videoAccept : "image/*"} multiple={multiple} className={inputClass} onChange={handleChange} />
      {message ? (
        <span className="mt-2 block rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-xs leading-5 text-red-100">
          {message}
        </span>
      ) : null}
    </span>
  );
}
