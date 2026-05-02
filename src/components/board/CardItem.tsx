"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CardType } from "@/types";
import { TAGS, PRIORITY_COLORS } from "@/lib/utils";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { tr } from "date-fns/locale";

interface Props {
  card: CardType;
  colId?: string;
  onEdit: (card: CardType) => void;
  isOverlay?: boolean;
}

export function CardItem({ card, colId, onEdit, isOverlay }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "card", card, colId },
    disabled: isOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  const getDueInfo = () => {
    if (!card.due) return null;
    const due = new Date(card.due);
    if (isPast(due) && !isToday(due))
      return { label: "Gecikti", color: "var(--red)" };
    if (isToday(due)) return { label: "Bugün", color: "var(--amber)" };
    if (isTomorrow(due)) return { label: "Yarın", color: "var(--amber)" };
    return { label: format(due, "d MMM", { locale: tr }), color: "var(--text3)" };
  };

  const dueInfo = getDueInfo();

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        marginBottom: "8px",
        cursor: isOverlay ? "grabbing" : "grab",
        background: isOverlay ? "var(--surface3)" : "var(--surface2)",
        border: `0.5px solid ${isOverlay ? "var(--accent)" : "var(--border)"}`,
        borderRadius: "10px",
        padding: "12px 13px",
        boxShadow: isOverlay ? "0 12px 40px rgba(0,0,0,0.5)" : "none",
      }}
      {...attributes}
      {...listeners}
    >
      {/* Title row */}
      <div className="flex items-start gap-2 mb-1.5">
        <div
          className="flex-1 text-sm font-medium leading-snug"
          style={{ color: "var(--text)" }}
        >
          {card.title}
        </div>
        {!isOverlay && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(card);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex-shrink-0 text-xs opacity-0 group-hover:opacity-100 transition-all px-1.5 py-0.5 rounded"
            style={{ color: "var(--text3)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--surface3)";
              e.currentTarget.style.color = "var(--text2)";
              e.currentTarget.style.opacity = "1";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text3)";
              e.currentTarget.style.opacity = "0";
            }}
            onFocus={(e) => (e.currentTarget.style.opacity = "1")}
          >
            ✎
          </button>
        )}
      </div>

      {/* Description */}
      {card.desc && (
        <div
          className="text-xs leading-snug mb-2"
          style={{ color: "var(--text3)" }}
        >
          {card.desc.length > 80 ? card.desc.slice(0, 80) + "…" : card.desc}
        </div>
      )}

      {/* Tags */}
      {card.tags && card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.tags.map((tag) => {
            const t = TAGS.find((t) => t.label === tag);
            if (!t) return null;
            return (
              <span
                key={tag}
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ color: t.color, background: t.bg }}
              >
                {t.label}
              </span>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {dueInfo && (
            <span className="text-xs flex items-center gap-1" style={{ color: dueInfo.color }}>
              📅 {dueInfo.label}
            </span>
          )}
          {card.assignee && (
            <span className="text-xs" style={{ color: "var(--text3)" }}>
              @{card.assignee}
            </span>
          )}
        </div>
        <div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: PRIORITY_COLORS[card.priority] || PRIORITY_COLORS.low }}
          title={`${card.priority} öncelik`}
        />
      </div>
    </div>
  );
}
