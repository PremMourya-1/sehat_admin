import { createSlice } from "@reduxjs/toolkit";

const initialState = null;

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginToggleAction(state, action) {
      return action.payload;
    },
    updateAuthDataForSession(state, action) {
      return { ...state, ...action.payload };
    },
    logoutAction() {
      return {};
    },
  },
});

export const { loginToggleAction, updateAuthDataForSession, logoutAction } = authSlice.actions;
export const getLoggedInAdminDetails = (state) => state.auth;
export default authSlice.reducer;
