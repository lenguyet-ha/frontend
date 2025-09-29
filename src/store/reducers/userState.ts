import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserInfo {
  // Define the shape of the user info
  avatar?: string;
  email?: string;
  token?: string;
  firstName?: string;
  lastName?: string;
  userType?: string;
  id?: string;
  userRole?: string;
}

interface UserState {
  info: UserInfo;
}

const initialState: UserState = {
  info: {},
};

const userInfo = createSlice({
  name: "userState",
  initialState,
  reducers: {
    setUserState(state, action: PayloadAction<UserInfo>) {
      state.info = action.payload; // Update the state with the user info
    },
  },
});

export const { setUserState } = userInfo.actions;
export default userInfo.reducer;
