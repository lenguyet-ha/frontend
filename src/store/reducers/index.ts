// third-party
import { combineReducers } from "redux";
import userState from "./userState";
import navigation from "./navigation";
import snackbar from "./snackbar";

import userInfoState from "./userInfoState";
// project import

// ==============================|| COMBINE REDUCERS ||============================== //

const reducers = combineReducers({
  userState,
  navigation,
  snackbar,
  userInfoState,
});

export default reducers;
