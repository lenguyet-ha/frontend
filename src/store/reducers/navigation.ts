import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Navigation {
  // Define the shape of the user info
  nameMenu?: string;
  // openNav?: boolean;
  // Add other user-related properties as needed
  openMobileIcon?: boolean;
}

interface NavigationState {
  info: Navigation;
}

const initialState: NavigationState = {
    info: {},
};

const navigationInfo = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setNavigationState(state, action: PayloadAction<Navigation>) {
      state.info = action.payload; // Update the state with the user info
    },
  },
});

export const { setNavigationState } = navigationInfo.actions;
export default navigationInfo.reducer;
