import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: ToastItem[];
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  success: (message) => set((s) => ({ toasts: [...s.toasts, { id: crypto.randomUUID(), message, type: 'success' }] })),
  error: (message) => set((s) => ({ toasts: [...s.toasts, { id: crypto.randomUUID(), message, type: 'error' }] })),
  info: (message) => set((s) => ({ toasts: [...s.toasts, { id: crypto.randomUUID(), message, type: 'info' }] })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
}));
