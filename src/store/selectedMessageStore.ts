import { create } from "zustand";
import type { FlightMessage } from "@/hooks/useMessages";

interface SelectedMessageState {
  selectedMessage: FlightMessage | null;
  selectMessage: (message: FlightMessage | null) => void;
}

export const useSelectedMessageStore = create<SelectedMessageState>((set) => ({
  selectedMessage: null,
  selectMessage: (message) => set({ selectedMessage: message }),
}));
