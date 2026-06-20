import Link from "next/link";

import { Button } from "@/components/ui/button";

import { NewBookForm } from "./new-book-form";

export const metadata = {
  title: "本を登録する | book-recording",
};

export default function NewBookPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">本を登録する</h1>
        <Button render={<Link href="/books" />} variant="outline" nativeButton={false}>
          本棚に戻る
        </Button>
      </div>
      <NewBookForm />
    </div>
  );
}
