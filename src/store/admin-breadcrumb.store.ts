import { create } from 'zustand';

interface AdminBreadcrumbStore {
  dynamicLabel: string | null;
  setDynamicLabel: (label: string | null) => void;
}

export const useAdminBreadcrumbStore = create<AdminBreadcrumbStore>((set) => ({
  dynamicLabel: null,
  setDynamicLabel: (label) => set({ dynamicLabel: label })
}));
