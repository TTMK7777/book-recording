"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { signInWithMagicLink } from "./actions";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await signInWithMagicLink(email);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setSent(true);
      toast.success("ログインリンクをメールで送信しました");
    });
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
        <p>{email} にログインリンクを送信しました。</p>
        <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
          メール内のリンクをクリックするとログインが完了します。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "送信中…" : "ログインリンクを送る"}
      </Button>
      <p className="text-xs text-zinc-500">
        パスワード不要のマジックリンク方式です。届いたメール内のリンクをクリックしてください。
      </p>
    </form>
  );
}
