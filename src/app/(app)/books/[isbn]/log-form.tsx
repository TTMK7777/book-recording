"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  type ReadingStatus,
  type UpdateLogInput,
  updateReadingLog,
} from "./actions";

type LogFormProps = {
  initial: {
    logId: string;
    isbn: string;
    status: ReadingStatus;
    rating: number | null;
    startedAt: string | null;
    finishedAt: string | null;
    reviewMd: string;
    isPublic: boolean;
  };
};

const STATUS_OPTIONS: Array<{ value: ReadingStatus; label: string }> = [
  { value: "want_to_read", label: "積読" },
  { value: "reading", label: "読書中" },
  { value: "finished", label: "読了" },
  { value: "abandoned", label: "中断" },
];

export function LogForm({ initial }: LogFormProps) {
  const [status, setStatus] = useState<ReadingStatus>(initial.status);
  const [rating, setRating] = useState<string>(
    initial.rating != null ? String(initial.rating) : "",
  );
  const [startedAt, setStartedAt] = useState<string>(initial.startedAt ?? "");
  const [finishedAt, setFinishedAt] = useState<string>(
    initial.finishedAt ?? "",
  );
  const [reviewMd, setReviewMd] = useState<string>(initial.reviewMd);
  const [isPublic, setIsPublic] = useState<boolean>(initial.isPublic);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsedRating = rating === "" ? null : Number(rating);
    const payload: UpdateLogInput = {
      logId: initial.logId,
      isbn: initial.isbn,
      status,
      rating: parsedRating,
      startedAt: startedAt || null,
      finishedAt: finishedAt || null,
      reviewMd,
      isPublic,
    };
    startTransition(async () => {
      const result = await updateReadingLog(payload);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("読書ログを保存しました");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">ステータス</Label>
          <select
            id="status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as ReadingStatus)
            }
            className="h-9 w-full rounded-md border border-zinc-300 bg-transparent px-3 text-sm dark:border-zinc-700"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rating">★ (1-5)</Label>
          <Input
            id="rating"
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(event) => setRating(event.target.value)}
            placeholder="未評価"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="startedAt">読み始め</Label>
          <Input
            id="startedAt"
            type="date"
            value={startedAt}
            onChange={(event) => setStartedAt(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="finishedAt">読了日</Label>
          <Input
            id="finishedAt"
            type="date"
            value={finishedAt}
            onChange={(event) => setFinishedAt(event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reviewMd">感想 (Markdown)</Label>
        <Textarea
          id="reviewMd"
          value={reviewMd}
          onChange={(event) => setReviewMd(event.target.value)}
          placeholder="心に残った点、要約、引用…"
          rows={8}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(event) => setIsPublic(event.target.checked)}
          className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
        />
        この本を公開する（共有URLで他人が見られる）
      </label>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "保存中…" : "読書ログを保存"}
        </Button>
      </div>
    </form>
  );
}
