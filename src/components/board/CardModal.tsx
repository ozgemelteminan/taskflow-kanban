"use client";

import { useState } from "react";
import { CardType } from "@/types";
import { TAGS } from "@/lib/utils";
import {
  Modal, ModalField, ModalInput, ModalTextarea, ModalActions,
  BtnPrimary, BtnCancel, BtnDanger,
} from "../ui/Modal";

interface Props {
  colId: string;
  card?: CardType;
  onClose: () => void;
  onSave: (data: Partial<CardType> & { id?: string }) => void;
  onDelete?: (id: string) => void;
}

export function CardModal({ card, onClose, onSave, onDelete }: Props) {
  const [title, setTitle] = useState(card?.title || "");
  const [desc, setDesc] = useState(card?.desc || "");
  const [priority, setPriority] = useState(card?.priority || "low");
  const [due, setDue] = useState(
    card?.due ? new Date(card.due).toISOString().split("T")[0] : ""
  );
  const [assignee, setAssignee] = useState(card?.assignee || "");
  const [tags, setTags] = useState<string[]>(card?.tags || []);
  const [loading, setLoading] = useState(false);

  function toggleTag(label: string) {
    setTags((prev) =>
      prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label]
    );
  }

  async function handleSave() {
    if (!title.trim()) return;
    setLoading(true);
    await onSave({
      id: card?.id,
      title: title.trim(),
      desc: desc.trim() || undefined,
      priority,
      due: due ? new Date(due) : undefined,
      assignee: assignee.trim() || undefined,
      tags,
    });
    setLoading(false);
  }

  const priorities = [
    { value: "low", label: "Düşük" },
    { value: "mid", label: "Orta" },
    { value: "high", label: "Yüksek" },
  ];

  return (
    <Modal
      open
      onClose={onClose}
      title={card ? "Kartı Düzenle" : "Yeni Kart"}
    >
      <ModalField label="Başlık">
        <ModalInput
          value={title}
          onChange={setTitle}
          placeholder="Görev başlığı"
          required
        />
      </ModalField>

      <ModalField label="Açıklama">
        <ModalTextarea
          value={desc}
          onChange={setDesc}
          placeholder="Detay ekle..."
          rows={3}
        />
      </ModalField>

      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <label className="block text-xs font-medium uppercase tracking-wider mb-2"
            style={{ color: "var(--text2)" }}>
            Bitiş Tarihi
          </label>
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
            style={{
              background: "var(--surface2)",
              border: "0.5px solid var(--border2)",
              color: "var(--text)",
              colorScheme: "dark",
            }}
          />
        </div>
        <div className="flex-1">
          <ModalField label="Sorumlu">
            <ModalInput value={assignee} onChange={setAssignee} placeholder="İsim" />
          </ModalField>
        </div>
      </div>

      <ModalField label="Etiketler">
        <div className="flex flex-wrap gap-1.5">
          {TAGS.map((t) => (
            <button
              key={t.label}
              onClick={() => toggleTag(t.label)}
              className="text-xs font-medium px-3 py-1 rounded-full transition-all"
              style={{
                color: t.color,
                background: tags.includes(t.label) ? t.bg : "transparent",
                border: `1.5px solid ${tags.includes(t.label) ? t.color : "var(--border2)"}`,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </ModalField>

      <ModalField label="Öncelik">
        <div className="flex gap-2">
          {priorities.map((p) => (
            <button
              key={p.value}
              onClick={() => setPriority(p.value)}
              className="flex-1 py-2 rounded-xl text-sm transition-all"
              style={{
                border: `0.5px solid ${priority === p.value ? "var(--accent)" : "var(--border2)"}`,
                background:
                  priority === p.value
                    ? "rgba(124,110,245,0.1)"
                    : "var(--surface2)",
                color:
                  priority === p.value ? "var(--accent)" : "var(--text2)",
                fontWeight: priority === p.value ? 500 : 400,
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </ModalField>

      <ModalActions>
        {card && onDelete && (
          <BtnDanger onClick={() => onDelete(card.id)}>Sil</BtnDanger>
        )}
        <BtnCancel onClick={onClose} />
        <BtnPrimary onClick={handleSave} loading={loading}>
          {card ? "Kaydet" : "Ekle"}
        </BtnPrimary>
      </ModalActions>
    </Modal>
  );
}
