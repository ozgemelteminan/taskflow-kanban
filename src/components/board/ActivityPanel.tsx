"use client";

import { useEffect, useState } from "react";
import { ActivityType } from "@/types";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface Props {
  boardId: string;
  open: boolean;
  onClose: () => void;
}

export function ActivityPanel({ boardId, open, onClose }: Props) {
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`/api/boards/${boardId}/activity`)
      .then((r) => r.json())
      .then((data) => {
        setActivities(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, [open, boardId]);

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className="fixed top-[60px] right-0 bottom-0 z-50 flex flex-col transition-transform duration-200"
        style={{
          width: "320px",
          background: "var(--surface)",
          borderLeft: "0.5px solid var(--border2)",
          transform: open ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "0.5px solid var(--border)" }}
        >
          <span className="text-sm font-semibold">Aktivite Geçmişi</span>
          <button
            onClick={onClose}
            className="text-lg leading-none transition-colors"
            style={{ color: "var(--text3)" }}
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading && (
            <div className="text-sm" style={{ color: "var(--text3)" }}>
              Yükleniyor...
            </div>
          )}

          {!loading && activities.length === 0 && (
            <div className="text-sm" style={{ color: "var(--text3)" }}>
              Henüz aktivite yok.
            </div>
          )}

          {activities.map((a) => (
            <div
              key={a.id}
              className="py-3 text-xs leading-relaxed"
              style={{ borderBottom: "0.5px solid var(--border)" }}
            >
              <div>
                <span style={{ color: "var(--text)" }}>{a.action}</span>
                {a.fromCol && a.toCol && (
                  <>
                    {" "}
                    <span style={{ color: "var(--text2)" }}>→</span>{" "}
                    <span style={{ color: "var(--accent2)" }}>{a.fromCol}</span>
                    {" → "}
                    <span style={{ color: "var(--green)" }}>{a.toCol}</span>
                  </>
                )}
                {!a.fromCol && a.toCol && (
                  <>
                    {" "}
                    <span style={{ color: "var(--text2)" }}>→</span>{" "}
                    <span style={{ color: "var(--green)" }}>{a.toCol}</span>
                  </>
                )}
              </div>
              <div className="mt-1" style={{ color: "var(--text3)" }}>
                {a.user.name} ·{" "}
                {format(new Date(a.createdAt), "d MMM HH:mm", { locale: tr })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
