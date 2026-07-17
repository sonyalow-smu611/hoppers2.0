"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, LockOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/api";

export default function ListPrivacyButton({ userId, title, isPrivate, className }) {
  const router = useRouter();
  const [privateList, setPrivateList] = useState(isPrivate);
  const [loading, setLoading] = useState(false);

  async function handleToggle(e) {
    e.preventDefault();
    e.stopPropagation();

    const nextPrivate = !privateList;
    setPrivateList(nextPrivate);
    setLoading(true);

    try {
      await api.patch("/lists/board/privacy", {
        user_id: userId,
        title,
        list_type: nextPrivate,
      });
      router.refresh();
    } catch {
      setPrivateList(!nextPrivate);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={`h-11 w-11 shrink-0 ${className ?? ""}`}
      onClick={handleToggle}
      disabled={loading}
      aria-label={privateList ? "Make list public" : "Make list private"}
      title={privateList ? "Private — click to make public" : "Public — click to make private"}
    >
      {privateList ? (
        <Lock className="h-6 w-6 text-red-500" strokeWidth={3} />
      ) : (
        <LockOpen className="h-6 w-6" strokeWidth={3} />
      )}
    </Button>
  );
}
