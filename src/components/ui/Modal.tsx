"use client";

import { useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

export function Modal({ open, onClose, children, title }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-y-auto"
        style={{
          background: "var(--surface)",
          border: "0.5px solid var(--border2)",
          maxHeight: "90vh",
          padding: "28px",
          animation: "modalIn 0.15s ease",
        }}
      >
        <h2 className="text-base font-semibold mb-5 tracking-tight">{title}</h2>
        {children}
      </div>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(8px) scale(0.99); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}

export function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-medium uppercase tracking-wider mb-2"
        style={{ color: "var(--text2)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function ModalInput({
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors"
      style={{
        background: "var(--surface2)",
        border: "0.5px solid var(--border2)",
        color: "var(--text)",
      }}
    />
  );
}

export function ModalTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors resize-none"
      style={{
        background: "var(--surface2)",
        border: "0.5px solid var(--border2)",
        color: "var(--text)",
      }}
    />
  );
}

export function ModalActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 justify-end mt-6">{children}</div>
  );
}

export function BtnPrimary({
  onClick,
  children,
  loading,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-opacity"
      style={{ background: "var(--accent)", opacity: loading ? 0.7 : 1 }}
    >
      {children}
    </button>
  );
}

export function BtnCancel({ onClick, children = "İptal" }: { onClick: () => void; children?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-xl text-sm transition-all"
      style={{
        background: "var(--surface2)",
        border: "0.5px solid var(--border2)",
        color: "var(--text2)",
      }}
    >
      {children}
    </button>
  );
}

export function BtnDanger({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-xl text-sm mr-auto transition-all"
      style={{
        background: "rgba(240,82,82,0.12)",
        border: "0.5px solid rgba(240,82,82,0.25)",
        color: "var(--red)",
      }}
    >
      {children}
    </button>
  );
}
