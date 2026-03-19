"use client";

import { useId, useState } from "react";

type AdminFileInputProps = {
  name: string;
  accept?: string;
  required?: boolean;
  currentFileName?: string;
};

export default function AdminFileInput({ name, accept, required, currentFileName }: AdminFileInputProps) {
  const inputId = useId();
  const [selectedName, setSelectedName] = useState("");
  const displayName = selectedName || currentFileName || "선택된 파일 없음";

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="flex w-full cursor-pointer items-center justify-between rounded border border-slate-200 px-3 py-2.5 transition hover:border-slate-300"
      >
        <span className={displayName === "선택된 파일 없음" ? "text-sm text-slate-400" : "text-sm text-slate-700"}>
          {displayName}
        </span>
        <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">파일 선택</span>
      </label>
      <input
        id={inputId}
        type="file"
        name={name}
        accept={accept}
        required={required}
        className="sr-only"
        onChange={(event) => {
          const nextName = event.target.files?.[0]?.name ?? "";
          setSelectedName(nextName);
        }}
      />
    </div>
  );
}
