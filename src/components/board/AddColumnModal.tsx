"use client";

import { useState } from "react";
import { COLORS } from "@/lib/utils";
import { Modal, ModalField, ModalInput, ModalActions, BtnPrimary, BtnCancel } from "../ui/Modal";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, color: string) => void;
}

export function AddColumnModal({ open, onClose, onAdd }: Props) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!name.trim()) return;
    setLoading(true);
    await onAdd(name.trim(), color);
    setName("");
    setLoading(false);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Yeni Sütun">
      <ModalField label="Sütun Adı">
        <ModalInput
          value={name}
          onChange={setName}
          placeholder="ör. İncelemede"
          required
        />
      </ModalField>
      <ModalField label="Renk">
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-7 h-7 rounded-full transition-all"
              style={{
                background: c,
                border: `2px solid ${color === c ? "white" : c}`,
                transform: color === c ? "scale(1.15)" : "scale(1)",
              }}
            />
          ))}
        </div>
      </ModalField>
      <ModalActions>
        <BtnCancel onClick={onClose} />
        <BtnPrimary onClick={handleAdd} loading={loading}>
          Ekle
        </BtnPrimary>
      </ModalActions>
    </Modal>
  );
}
