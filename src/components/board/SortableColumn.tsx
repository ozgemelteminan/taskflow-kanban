"use client";

import { useRef, useState } from "react";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import { ColumnType, CardType } from "@/types";
import { CardItem } from "./CardItem";

interface Props {
  column: ColumnType;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onAddCard: () => void;
  onEditCard: (card: CardType) => void;
}

export function SortableColumn({ column, onDelete, onRename, onAddCard, onEditCard }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: "column" },
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: column.id });

  const [editingName, setEditingName] = useState(column.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const cardIds = column.cards.map((c) => c.id);

  return (
    <div
      ref={setSortableRef}
      style={{ ...style, width: "280px", flexShrink: 0 }}
    >
      <div
        ref={setDropRef}
        className="flex flex-col rounded-2xl transition-colors"
        style={{
          background: isOver ? "rgba(124,110,245,0.04)" : "var(--surface)",
          border: `0.5px solid ${isOver ? "var(--accent)" : "var(--border)"}`,
          maxHeight: "calc(100vh - 120px)",
        }}
      >
        {/* Column header */}
        <div
          className="flex items-center gap-2 px-3.5 py-3 flex-shrink-0"
          style={{ borderBottom: "0.5px solid var(--border)" }}
        >
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing flex-shrink-0 opacity-30 hover:opacity-70 transition-opacity"
            style={{ touchAction: "none" }}
          >
            <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
              <circle cx="4" cy="4" r="1.5"/>
              <circle cx="8" cy="4" r="1.5"/>
              <circle cx="4" cy="8" r="1.5"/>
              <circle cx="8" cy="8" r="1.5"/>
              <circle cx="4" cy="12" r="1.5"/>
              <circle cx="8" cy="12" r="1.5"/>
            </svg>
          </div>

          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: column.color }}
          />

          <input
            ref={inputRef}
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            onBlur={() => onRename(column.id, editingName)}
            onKeyDown={(e) => {
              if (e.key === "Enter") inputRef.current?.blur();
            }}
            className="flex-1 bg-transparent text-sm font-semibold outline-none"
            style={{ color: "var(--text)", minWidth: 0 }}
          />

          <span
            className="text-xs rounded-full px-2 py-0.5 flex-shrink-0"
            style={{ background: "var(--surface3)", color: "var(--text3)" }}
          >
            {column.cards.length}
          </span>

          <button
            onClick={() => onDelete(column.id)}
            className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-xs transition-all"
            style={{ color: "var(--text3)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(240,82,82,0.15)";
              e.currentTarget.style.color = "var(--red)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text3)";
            }}
          >
            ✕
          </button>
        </div>

        {/* Cards */}
        <div
          className="p-2.5 flex-1 overflow-y-auto"
          style={{ minHeight: "60px", scrollbarWidth: "thin" }}
        >
          <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
            {column.cards.map((card) => (
              <CardItem
                key={card.id}
                card={card}
                colId={column.id}
                onEdit={onEditCard}
              />
            ))}
          </SortableContext>
        </div>

        {/* Add card */}
        <button
          onClick={onAddCard}
          className="mx-2.5 mb-2.5 px-3 py-2 rounded-xl text-left text-sm flex items-center gap-1.5 transition-all"
          style={{ color: "var(--text3)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface3)";
            e.currentTarget.style.color = "var(--text2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text3)";
          }}
        >
          + Kart Ekle
        </button>
      </div>
    </div>
  );
}
