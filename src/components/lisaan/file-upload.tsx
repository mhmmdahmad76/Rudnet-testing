"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, FileText, Upload, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/lisaan/icon-button";
import { Progress } from "@/components/ui/progress";

export interface FileUploadProps {
  state: "empty" | "uploading" | "success" | "error";
  filename?: string;
  progress?: number;
  /** "2.4 MB of 3.8 MB" | "That file is 24 MB. The limit is 10 MB…" — real copy, not a placeholder. */
  meta?: string;
  onFiles?: (files: FileList) => void;
  onCancel?: () => void;
  onRetry?: () => void;
  accept?: string;
  className?: string;
}

function FileUpload({
  state,
  filename,
  progress,
  meta,
  onFiles,
  onCancel,
  onRetry,
  accept,
  className,
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  function handleFiles(files: FileList | null) {
    if (files && files.length > 0) onFiles?.(files);
  }

  if (state === "empty") {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-stroke-default bg-bg-surface p-8 text-center transition-colors outline-none",
          "hover:border-stroke-strong focus-visible:shadow-(--elev-focus)",
          isDragging && "border-stroke-brand bg-bg-brand-subtle",
          className,
        )}
      >
        <Upload className="size-6 text-fg-tertiary" aria-hidden />
        <p className="t-body-sm-strong text-fg-primary">Drag a file here, or click to browse</p>
        {meta && <p className="t-body-xs text-fg-tertiary">{meta}</p>}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>
    );
  }

  if (state === "uploading") {
    return (
      <div
        className={cn(
          "flex flex-col gap-2 rounded-xl border border-stroke-default bg-bg-surface p-4",
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <FileText className="size-5 shrink-0 text-fg-tertiary" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="t-body-sm-strong truncate text-fg-primary">{filename}</p>
            {meta && <p className="t-body-xs text-fg-tertiary">{meta}</p>}
          </div>
          <IconButton aria-label="Cancel upload" variant="ghost" size="sm" onClick={onCancel}>
            <X aria-hidden />
          </IconButton>
        </div>
        <Progress value={progress ?? 0} size="xs" />
      </div>
    );
  }

  if (state === "success") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border border-stroke-default bg-bg-surface p-4",
          className,
        )}
      >
        <CheckCircle2 className="size-5 shrink-0 text-fg-success" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="t-body-sm-strong truncate text-fg-primary">{filename}</p>
          {meta && <p className="t-body-xs text-fg-tertiary">{meta}</p>}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border-[1.5px] border-stroke-danger bg-bg-danger-subtle p-4",
        className,
      )}
    >
      <AlertCircle className="size-5 shrink-0 text-fg-danger" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="t-body-sm-strong truncate text-fg-primary">{filename}</p>
        {meta && <p className="t-body-xs text-fg-danger">{meta}</p>}
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export { FileUpload };
