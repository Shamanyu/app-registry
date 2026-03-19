"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { X, Plus, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { registerProject } from "@/app/actions";

interface AddAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL = { name: "", url: "", description: "", icon_url: "", owner: "" };

const inputClass = "w-full rounded-xl px-4 py-3 text-sm bg-white/5 backdrop-blur-sm border border-white/10 text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 transition-all";

export function AddAppModal({ isOpen, onClose }: AddAppModalProps) {
  const [form, setForm] = useState(INITIAL);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      dialogRef.current?.close();
      setForm(INITIAL);
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const fn = () => onClose();
    d.addEventListener("close", fn);
    return () => d.removeEventListener("close", fn);
  }, [onClose]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await registerProject(form);
      if (res.success) { setSuccess(true); setTimeout(onClose, 1200); }
      else setError(res.error ?? "Something went wrong.");
    });
  };

  return (
    <dialog
      ref={dialogRef}
      className="w-[calc(100%-2rem)] max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto
        m-auto p-0 rounded-2xl border border-white/10 bg-stone-900/80 backdrop-blur-2xl shadow-2xl
        [&::backdrop]:bg-black/60 [&::backdrop]:backdrop-blur-md"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-stone-100">Register New App</h2>
            <p className="text-xs text-stone-500 mt-0.5">Add a project to the directory</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-stone-500 hover:text-stone-300 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-stone-400 mb-1.5">App Name *</label>
            <input ref={inputRef} id="name" name="name" type="text" value={form.name} onChange={handleChange}
              placeholder="My Awesome App" required disabled={isPending || success} className={inputClass} />
          </div>
          <div>
            <label htmlFor="url" className="block text-xs font-medium text-stone-400 mb-1.5">URL *</label>
            <input id="url" name="url" type="text" value={form.url} onChange={handleChange}
              placeholder="https://myapp.com" required disabled={isPending || success} className={inputClass} />
          </div>
          <div>
            <label htmlFor="description" className="block text-xs font-medium text-stone-400 mb-1.5">Description *</label>
            <textarea id="description" name="description" value={form.description} onChange={handleChange}
              placeholder="Brief description..." required rows={2} disabled={isPending || success}
              className={`${inputClass} resize-none`} />
          </div>
          <div>
            <label htmlFor="icon_url" className="block text-xs font-medium text-stone-400 mb-1.5">Icon URL <span className="text-stone-500 font-normal">(optional)</span></label>
            <input id="icon_url" name="icon_url" type="text" value={form.icon_url} onChange={handleChange}
              placeholder="https://myapp.com/icon.png" disabled={isPending || success} className={inputClass} />
          </div>
          <div>
            <label htmlFor="owner" className="block text-xs font-medium text-stone-400 mb-1.5">Owner <span className="text-stone-500 font-normal">(optional)</span></label>
            <input id="owner" name="owner" type="text" value={form.owner} onChange={handleChange}
              placeholder="Team or person responsible" disabled={isPending || success} className={inputClass} />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-xl p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              App registered successfully!
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={isPending}
              className="flex-1 rounded-xl px-4 py-3 text-sm font-medium text-stone-400 border border-white/10 hover:bg-white/10 hover:text-stone-200 transition-colors disabled:opacity-40">
              Cancel
            </button>
            <button type="submit" disabled={isPending || success}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium
                bg-amber-600 hover:bg-amber-500 text-white transition-colors disabled:opacity-60">
              {isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Registering…</> : success ? <><CheckCircle2 className="w-4 h-4" />Done!</> : <><Plus className="w-4 h-4" />Register App</>}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
