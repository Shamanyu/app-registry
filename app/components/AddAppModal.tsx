"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { X, Plus, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { registerProject } from "@/app/actions";

interface AddAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL = { name: "", url: "", description: "", icon_url: "", owner: "" };

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
        m-auto p-0 rounded-2xl border border-cyan-500/20 bg-[#0c0c10] shadow-2xl shadow-cyan-500/10
        [&::backdrop]:bg-black/75 [&::backdrop]:backdrop-blur-md"
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold bg-gradient-to-r from-cyan-200 to-violet-200 bg-clip-text text-transparent">
              Register New App
            </h2>
            <p className="text-xs text-cyan-300/50 mt-0.5">Add a project to the directory</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-cyan-300/70 mb-1">App Name *</label>
            <input ref={inputRef} id="name" name="name" type="text" value={form.name} onChange={handleChange}
              placeholder="My Awesome App" required disabled={isPending || success}
              className="w-full rounded-lg px-3 py-2.5 text-sm bg-white/[0.05] border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500/50 disabled:opacity-50 transition-all" />
          </div>
          <div>
            <label htmlFor="url" className="block text-xs font-medium text-cyan-300/70 mb-1">URL *</label>
            <input id="url" name="url" type="text" value={form.url} onChange={handleChange}
              placeholder="https://myapp.com" required disabled={isPending || success}
              className="w-full rounded-lg px-3 py-2.5 text-sm bg-white/[0.05] border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500/50 disabled:opacity-50 transition-all" />
          </div>
          <div>
            <label htmlFor="description" className="block text-xs font-medium text-cyan-300/70 mb-1">Description *</label>
            <textarea id="description" name="description" value={form.description} onChange={handleChange}
              placeholder="Brief description..." required rows={2} disabled={isPending || success}
              className="w-full rounded-lg px-3 py-2.5 text-sm bg-white/[0.05] border border-white/10 text-white placeholder:text-white/20 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500/50 disabled:opacity-50 transition-all" />
          </div>
          <div>
            <label htmlFor="icon_url" className="block text-xs font-medium text-cyan-300/70 mb-1">Icon URL <span className="text-white/30 font-normal">(optional)</span></label>
            <input id="icon_url" name="icon_url" type="text" value={form.icon_url} onChange={handleChange}
              placeholder="https://myapp.com/icon.png" disabled={isPending || success}
              className="w-full rounded-lg px-3 py-2.5 text-sm bg-white/[0.05] border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500/50 disabled:opacity-50 transition-all" />
          </div>
          <div>
            <label htmlFor="owner" className="block text-xs font-medium text-cyan-300/70 mb-1">Owner <span className="text-white/30 font-normal">(optional)</span></label>
            <input id="owner" name="owner" type="text" value={form.owner} onChange={handleChange}
              placeholder="Team or person responsible" disabled={isPending || success}
              className="w-full rounded-lg px-3 py-2.5 text-sm bg-white/[0.05] border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500/50 disabled:opacity-50 transition-all" />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg p-3 bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-lg p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              App registered successfully!
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} disabled={isPending}
              className="flex-1 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 border border-white/10 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-40">
              Cancel
            </button>
            <button type="submit" disabled={isPending || success}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold
                bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400
                text-white transition-all duration-200 shadow-lg shadow-cyan-500/25 disabled:opacity-60">
              {isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Registering…</> : success ? <><CheckCircle2 className="w-4 h-4" />Done!</> : <><Plus className="w-4 h-4" />Register App</>}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
