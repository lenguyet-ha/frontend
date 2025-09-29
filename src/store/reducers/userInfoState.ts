import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserInfo {
  _id?: string;
  avatar?: string;
  userType?: string;
  status?: string;
  createdAt?: string;
  isDeleted?: string;
  userName?: string | null;
  mobile?: string;
  email?: string;
  info?: {
    firstName?: string;
    lastName?: string;
  };
  createdBy?: string;
  referralCode?: string;
  updatedAt?: string;
  updatedBy?: string;
  language?: string;
  points?: number;
  chatGptModel?: string;
  lastActionDate?: string;
  userRole?: string;
  actionLst?: {
    _id: string;
    code: string;
    groupCode: string;
    description: string;
    havePermission: boolean;
  }[];
  actions?: {
    groupCode: string;
    havePermission: boolean;
  }[];
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
    setUserInfoState(state, action: PayloadAction<UserInfo>) {
      state.info = action.payload; // Update the state with the user info
    },
  },
});

export const { setUserInfoState } = userInfo.actions;
export default userInfo.reducer;
