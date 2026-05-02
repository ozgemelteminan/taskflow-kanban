"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { ActivityPanel } from "./board/ActivityPanel";

interface Props {
  user: { name?: string | null; email?: string | null; id: string };
  boardName?: string;
  boardId?: string;
}

export function Header({ user, boardName, boardId }: Props) {
  const [activityOpen, setActivityOpen] = useState(false);
  const initials = user.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <>
      <header
        className="h-15 flex items-center justify-between px-6 sticky top-0 z-50 flex-shrink-0"
        style={{
          background: "var(--surface)",
          borderBottom: "0.5px solid var(--border)",
          height: "60px",
        }}
      >
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2.5 no-underline">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ background: "var(--accent)" }}
            >
              ⚡
            </div>
            <span className="text-base font-semibold tracking-tight">TaskFlow</span>
          </Link>

          {boardName && (
            <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text2)" }}>
              <span style={{ color: "var(--text3)" }}>/</span>
              <span className="font-medium" style={{ color: "var(--text)" }}>
                {boardName}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {boardId && (
            <button
              onClick={() => setActivityOpen(true)}
              className="px-3.5 py-1.5 rounded-lg text-sm transition-all"
              style={{
                background: "transparent",
                border: "0.5px solid var(--border2)",
                color: "var(--text2)",
              }}
            >
              Aktivite
            </button>
          )}

          <div
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-full"
            style={{ background: "var(--surface2)", border: "0.5px solid var(--border)" }}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{ background: "var(--accent)" }}
            >
              {initials}
            </div>
            <span className="text-sm" style={{ color: "var(--text2)" }}>
              {user.name?.split(" ")[0]}
            </span>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-3.5 py-1.5 rounded-lg text-sm transition-all"
            style={{
              background: "transparent",
              border: "0.5px solid var(--border2)",
              color: "var(--text2)",
            }}
          >
            Çıkış
          </button>
        </div>
      </header>

      {boardId && (
        <ActivityPanel
          boardId={boardId}
          open={activityOpen}
          onClose={() => setActivityOpen(false)}
        />
      )}
    </>
  );
}
