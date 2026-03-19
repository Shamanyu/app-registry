"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { X, Plus, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { registerProject } from "@/app/actions";

interface AddAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormState {
  name: string;
  url: string;
  description: string;
  icon_url: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  url: "",
  description: "",
  icon_url: "",
};

export function AddAppModal({ isOpen, onClose }: AddAppModalProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 50);
    } else {
      setForm(INITIAL_FORM);
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isPending) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, isPending, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current && !isPending) onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await registerProject(form);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4
        bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-lg rounded-2xl border border-white/10
          bg-[#0f0f0f]/90 backdrop-blur-xl shadow-2xl shadow-black/50
          animate-in zoom-in-95 slide-in-from-bottom-4 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div>
            <h2
              id="modal-title"
              className="text-lg font-semibold text-white"
            >
              Register New App
            </h2>
            <p className="text-sm text-white/40 mt-0.5">
              Add a project to the directory
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg p-2 text-white/40 hover:text-white hover:bg-white/10
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/70" htmlFor="name">
              App Name <span className="text-red-400">*</span>
            </label>
            <input
              ref={firstInputRef}
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="My Awesome App"
              required
              disabled={isPending || success}
              className="rounded-xl px-4 py-3 bg-white/5 border border-white/10 text-white
                placeholder:text-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500
                focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>

          {/* URL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/70" htmlFor="url">
              URL <span className="text-red-400">*</span>
            </label>
            <input
              id="url"
              name="url"
              type="text"
              value={form.url}
              onChange={handleChange}
              placeholder="https://myapp.com"
              required
              disabled={isPending || success}
              className="rounded-xl px-4 py-3 bg-white/5 border border-white/10 text-white
                placeholder:text-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500
                focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium text-white/70"
              htmlFor="description"
            >
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="A brief description of what this app does..."
              required
              rows={3}
              disabled={isPending || success}
              className="rounded-xl px-4 py-3 bg-white/5 border border-white/10 text-white
                placeholder:text-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500
                focus:border-transparent transition-all resize-none disabled:opacity-50"
            />
          </div>

          {/* Icon URL (optional) */}
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium text-white/70"
              htmlFor="icon_url"
            >
              Icon URL{" "}
              <span className="text-white/30 font-normal">(optional)</span>
            </label>
            <input
              id="icon_url"
              name="icon_url"
              type="text"
              value={form.icon_url}
              onChange={handleChange}
              placeholder="https://myapp.com/icon.png"
              disabled={isPending || success}
              className="rounded-xl px-4 py-3 bg-white/5 border border-white/10 text-white
                placeholder:text-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500
                focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 rounded-xl p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-center gap-2.5 rounded-xl p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              App registered successfully!
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 rounded-xl px-4 py-3 text-sm font-medium text-white/60
                border border-white/10 hover:bg-white/5 hover:text-white transition-all
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || success}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3
                text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-all
                disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/30"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Registering…
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Done!
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Register App
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
