"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COLORS, EMOJIS } from "@/lib/utils";
import {
  Modal, ModalField, ModalInput, ModalActions, BtnPrimary, BtnCancel, BtnDanger,
} from "../ui/Modal";

interface Board {
  id: string;
  name: string;
  color: string;
  emoji: string;
  columns: { cards: unknown[] }[];
}

export function BoardsClient({ initialBoards }: { initialBoards: Board[] }) {
  const router = useRouter();
  const [boards, setBoards] = useState(initialBoards);
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [newEmoji, setNewEmoji] = useState(EMOJIS[0]);
  const [loading, setLoading] = useState(false);

  async function createBoard() {
    if (!newName.trim()) return;
    setLoading(true);
    const res = await fetch("/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, color: newColor, emoji: newEmoji }),
    });
    const board = await res.json();
    setBoards((prev) => [board, ...prev]);
    setModalOpen(false);
    setNewName("");
    setLoading(false);
    router.push(`/board/${board.id}`);
  }

  async function deleteBoard(id: string) {
    if (!confirm("Bu board silinsin mi?")) return;
    await fetch(`/api/boards/${id}`, { method: "DELETE" });
    setBoards((prev) => prev.filter((b) => b.id !== id));
  }

  const totalCards = (board: Board) =>
    board.columns.reduce((s, c) => s + c.cards.length, 0);

  return (
    <>
      <div className="flex items-center justify-between mb-7">
        <h1 className="text-2xl font-semibold tracking-tight">Boardlarım</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: "var(--accent)" }}
        >
          + Yeni Board
        </button>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
        {boards.map((board) => (
          <div
            key={board.id}
            onClick={() => router.push(`/board/${board.id}`)}
            className="relative rounded-2xl p-6 cursor-pointer transition-all group overflow-hidden"
            style={{
              background: "var(--surface)",
              border: "0.5px solid var(--border2)",
            }}
          >
            {/* Top accent bar */}
            <div
              className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
              style={{ background: board.color }}
            />

            <div className="text-2xl mb-2 mt-1">{board.emoji}</div>
            <div className="font-semibold text-sm mb-1">{board.name}</div>
            <div className="text-xs" style={{ color: "var(--text3)" }}>
              {board.columns.length} sütun · {totalCards(board)} kart
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); deleteBoard(board.id); }}
              className="absolute top-4 right-4 w-6 h-6 rounded-md flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-all"
              style={{ color: "var(--text3)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(240,82,82,0.15)", e.currentTarget.style.color = "var(--red)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent", e.currentTarget.style.color = "var(--text3)")}
            >
              ✕
            </button>
          </div>
        ))}

        <button
          onClick={() => setModalOpen(true)}
          className="rounded-2xl p-6 flex items-center justify-center gap-2 text-sm transition-all min-h-24"
          style={{
            border: "0.5px dashed var(--border2)",
            color: "var(--text2)",
            background: "transparent",
          }}
        >
          <span className="text-xl">+</span> Yeni Board
        </button>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Yeni Board Oluştur">
        <ModalField label="Board Adı">
          <ModalInput
            value={newName}
            onChange={setNewName}
            placeholder="ör. Ürün Geliştirme"
            required
          />
        </ModalField>

        <ModalField label="Renk">
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className="w-7 h-7 rounded-full transition-all"
                style={{
                  background: c,
                  border: `2px solid ${newColor === c ? "white" : c}`,
                  transform: newColor === c ? "scale(1.15)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </ModalField>

        <ModalField label="İkon">
          <div className="flex gap-2 flex-wrap">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setNewEmoji(e)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all"
                style={{
                  background: "var(--surface2)",
                  border: `1.5px solid ${newEmoji === e ? "var(--accent)" : "transparent"}`,
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </ModalField>

        <ModalActions>
          <BtnCancel onClick={() => setModalOpen(false)} />
          <BtnPrimary onClick={createBoard} loading={loading}>
            Oluştur
          </BtnPrimary>
        </ModalActions>
      </Modal>
    </>
  );
}
