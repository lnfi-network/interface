import { createSlice } from "@reduxjs/toolkit";
export const modalSlice = createSlice({
  name: "modal",
  initialState: {
    nostrModalVisible: false,
    connectNostrModalVisible: false,
    walletConnectModalVisible: false,
    languageModalVisible: false,
    turnOnNostrDrawerVisible: false,
    onlyMobileSupportedVisible: false,
    signatureValidErrorVisible: false
  },
  reducers: {
    setNostrModalVisible(state, action) {
      state.nostrModalVisible = action.payload;
    },
    setWalletConnectModalVisible(state, action) {
      state.walletConnectModalVisible = action.payload;
    },
    setLanguageModalVisible(state, action) {
      state.languageModalVisible = action.payload;
    },
    setConnectNostrModalVisible(state, action) {
      state.connectNostrModalVisible = action.payload;
    },
    setTurnOnNostrDrawerVisible(state, action) {
      state.turnOnNostrDrawerVisible = action.payload;
    },
    setOnlyMobileSupportedVisible(state, action) {
      state.onlyMobileSupportedVisible = action.payload;
    },
    setSignatureValidErrorVisible(state, action) {
      state.signatureValidErrorVisible = action.payload
    }
  }
});
export const {
  setNostrModalVisible,
  setWalletConnectModalVisible,
  setLanguageModalVisible,
  setConnectNostrModalVisible,
  setTurnOnNostrDrawerVisible,
  setOnlyMobileSupportedVisible,
  setSignatureValidErrorVisible
} = modalSlice.actions;
export default modalSlice.reducer;
