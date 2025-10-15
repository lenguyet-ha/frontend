import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ChatState {
  isOpen: boolean;
  currentUser: {
    id: number;
    name: string;
    avatar?: string;
  } | null;
}

const initialState: ChatState = {
  isOpen: false,
  currentUser: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    openChat(state, action: PayloadAction<{ id: number; name: string; avatar?: string }>) {
      state.isOpen = true;
      state.currentUser = action.payload;
    },
    closeChat(state) {
      state.isOpen = false;
      state.currentUser = null;
    },
  },
});

export const { openChat, closeChat } = chatSlice.actions;
export default chatSlice.reducer;