import { create } from 'zustand';

// 전역 모바일 헤더의 톱니(⚙)와 마이페이지에 마운트된 설정 시트를 잇는다.
// 둘은 레이아웃에서 형제로 렌더돼 props로 상태를 넘길 수 없어 store로 공유한다.
interface SettingsSheetStore {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useSettingsSheetStore = create<SettingsSheetStore>((set) => ({
  open: false,
  setOpen: (open) => set({ open })
}));
