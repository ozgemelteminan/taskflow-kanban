"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { BoardType, ColumnType, CardType } from "@/types";
import { SortableColumn } from "./SortableColumn";
import { CardItem } from "./CardItem";
import { AddColumnModal } from "./AddColumnModal";
import { CardModal } from "./CardModal";

interface Props {
  initialBoard: BoardType;
  userId: string;
}

export function BoardClient({ initialBoard, userId }: Props) {
  const [board, setBoard] = useState(initialBoard);
  const [addColOpen, setAddColOpen] = useState(false);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [cardModal, setCardModal] = useState<{
    colId: string;
    card?: CardType;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 300, tolerance: 5 } })
  );

  // ── Drag handlers ──────────────────────────────────────────────
  function onDragStart(event: DragStartEvent) {
    const { active } = event;
    if (active.data.current?.type === "card") {
      setActiveCard(active.data.current.card as CardType);
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    const activeType = active.data.current?.type;
    if (activeType !== "card") return;

    const activeColId = active.data.current?.colId as string;
    const overType = over.data.current?.type;

    let overColId: string;
    if (overType === "card") overColId = over.data.current?.colId as string;
    else overColId = over.id as string; // dropped over column

    if (activeColId === overColId) {
      // Reorder within same column
      setBoard((prev) => {
        const cols = prev.columns.map((col) => {
          if (col.id !== activeColId) return col;
          const cards = [...col.cards];
          const from = cards.findIndex((c) => c.id === active.id);
          const to =
            overType === "card"
              ? cards.findIndex((c) => c.id === over.id)
              : cards.length - 1;
          return { ...col, cards: arrayMove(cards, from, to) };
        });
        return { ...prev, columns: cols };
      });
    } else {
      // Move between columns
      setBoard((prev) => {
        const cols = prev.columns.map((col) => {
          if (col.id === activeColId) {
            return { ...col, cards: col.cards.filter((c) => c.id !== active.id) };
          }
          if (col.id === overColId) {
            const card = prev.columns
              .find((c) => c.id === activeColId)
              ?.cards.find((c) => c.id === active.id);
            if (!card) return col;
            const cards = [...col.cards];
            if (overType === "card") {
              const idx = cards.findIndex((c) => c.id === over.id);
              cards.splice(idx, 0, { ...card, columnId: overColId });
            } else {
              cards.push({ ...card, columnId: overColId });
            }
            return { ...col, cards };
          }
          return col;
        });
        return { ...prev, columns: cols };
      });
    }
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCard(null);
    if (!over) return;

    // Column reordering
    if (active.data.current?.type === "column") {
      setBoard((prev) => {
        const from = prev.columns.findIndex((c) => c.id === active.id);
        const to = prev.columns.findIndex((c) => c.id === over.id);
        const newCols = arrayMove(prev.columns, from, to).map((col, i) => ({
          ...col,
          order: i,
        }));
        // Persist
        Promise.all(
          newCols.map((col) =>
            fetch(`/api/columns/${col.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ order: col.order }),
            })
          )
        );
        return { ...prev, columns: newCols };
      });
      return;
    }

    // Card reorder/move — persist to DB
    if (active.data.current?.type === "card") {
      const fromColId = active.data.current.colId as string;
      const toColId =
        over.data.current?.type === "card"
          ? (over.data.current?.colId as string)
          : (over.id as string);

      const fromColName =
        board.columns.find((c) => c.id === fromColId)?.name || "";
      const toColName =
        board.columns.find((c) => c.id === toColId)?.name || "";
      const cardTitle = activeCard?.title || "";

      // Persist reorder
      await fetch("/api/cards/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boardId: board.id,
          columns: board.columns.map((col) => ({
            id: col.id,
            cards: col.cards.map((c) => ({ id: c.id })),
          })),
        }),
      });

      // Log if moved between columns
      if (fromColId !== toColId) {
        await fetch(`/api/boards/${board.id}/activity`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: `"${cardTitle}" kartı taşındı`,
            fromCol: fromColName,
            toCol: toColName,
          }),
        });
      }
    }
  }

  // ── Column ops ─────────────────────────────────────────────────
  const addColumn = useCallback(async (name: string, color: string) => {
    const res = await fetch("/api/columns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boardId: board.id, name, color }),
    });
    const col = await res.json();
    setBoard((prev) => ({ ...prev, columns: [...prev.columns, col] }));
  }, [board.id]);

  const deleteColumn = useCallback(async (colId: string) => {
    const col = board.columns.find((c) => c.id === colId);
    if (!col) return;
    if (
      col.cards.length > 0 &&
      !confirm(`"${col.name}" sütununu ve ${col.cards.length} kartını silmek istiyor musun?`)
    )
      return;
    await fetch(`/api/columns/${colId}`, { method: "DELETE" });
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.filter((c) => c.id !== colId),
    }));
  }, [board.columns]);

  const renameColumn = useCallback(async (colId: string, name: string) => {
    if (!name.trim()) return;
    await fetch(`/api/columns/${colId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((c) =>
        c.id === colId ? { ...c, name } : c
      ),
    }));
  }, []);

  // ── Card ops ───────────────────────────────────────────────────
  const saveCard = useCallback(
    async (
      colId: string,
      data: Partial<CardType> & { id?: string }
    ) => {
      if (data.id) {
        // Edit
        const res = await fetch(`/api/cards/${data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const updated = await res.json();
        setBoard((prev) => ({
          ...prev,
          columns: prev.columns.map((col) => ({
            ...col,
            cards: col.cards.map((c) => (c.id === updated.id ? updated : c)),
          })),
        }));
      } else {
        // Create
        const res = await fetch("/api/cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ columnId: colId, ...data }),
        });
        const card = await res.json();
        setBoard((prev) => ({
          ...prev,
          columns: prev.columns.map((col) =>
            col.id === colId ? { ...col, cards: [...col.cards, card] } : col
          ),
        }));
        // Log
        const colName = board.columns.find((c) => c.id === colId)?.name || "";
        await fetch(`/api/boards/${board.id}/activity`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: `"${data.title}" oluşturuldu`,
            fromCol: null,
            toCol: colName,
          }),
        });
      }
      setCardModal(null);
    },
    [board]
  );

  const deleteCard = useCallback(async (cardId: string, colId: string) => {
    if (!confirm("Bu kart silinsin mi?")) return;
    await fetch(`/api/cards/${cardId}`, { method: "DELETE" });
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) =>
        col.id === colId
          ? { ...col, cards: col.cards.filter((c) => c.id !== cardId) }
          : col
      ),
    }));
    setCardModal(null);
  }, []);

  const columnIds = board.columns.map((c) => c.id);

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div
          className="flex gap-3.5 p-6 overflow-x-auto overflow-y-hidden"
          style={{ minHeight: "calc(100vh - 60px)", alignItems: "flex-start" }}
        >
          <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
            {board.columns.map((col) => (
              <SortableColumn
                key={col.id}
                column={col}
                onDelete={deleteColumn}
                onRename={renameColumn}
                onAddCard={() => setCardModal({ colId: col.id })}
                onEditCard={(card) => setCardModal({ colId: col.id, card })}
              />
            ))}
          </SortableContext>

          {/* Add column button */}
          <button
            onClick={() => setAddColOpen(true)}
            className="flex-shrink-0 w-64 flex items-center justify-center gap-2 rounded-2xl text-sm transition-all min-h-20"
            style={{
              border: "0.5px dashed var(--border2)",
              color: "var(--text2)",
              background: "transparent",
            }}
          >
            + Sütun Ekle
          </button>
        </div>

        <DragOverlay>
          {activeCard ? (
            <div style={{ transform: "rotate(2deg) scale(1.02)", width: "264px" }}>
              <CardItem card={activeCard} onEdit={() => {}} isOverlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <AddColumnModal
        open={addColOpen}
        onClose={() => setAddColOpen(false)}
        onAdd={addColumn}
      />

      {cardModal && (
        <CardModal
          colId={cardModal.colId}
          card={cardModal.card}
          onClose={() => setCardModal(null)}
          onSave={(data) => saveCard(cardModal.colId, data)}
          onDelete={cardModal.card ? (id) => deleteCard(id, cardModal.colId) : undefined}
        />
      )}
    </>
  );
}
