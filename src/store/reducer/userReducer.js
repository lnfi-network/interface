import { createSlice } from "@reduxjs/toolkit";
import * as Lockr from "lockr";
import { isInTokenPocket } from "lib/utils/userAgent";
import { nip19 } from "nostr-tools";
export const userSlice = createSlice({
  name: "user",
  initialState: {
    connectPlat: Lockr.get("connectPlat") || "ETH",
    selectedTokenPlatform: "Lightning",
    account: "", //
    chainId: 1,
    library: null,
    proMode: {
      hasInit: false,
      value: false
    },
    nostrAccount: !isInTokenPocket() ? Lockr.get("nostrAccount") : "",
    npubNostrAccount: !isInTokenPocket()
      ? Lockr.get("nostrAccount")
        ? nip19.npubEncode(Lockr.get("nostrAccount"))
        : ""
      : "",
    balanceList: {},
    userInfo: {},
    active: false,
    isBindNostrAddress: false
  },
  reducers: {
    setAccount(state, action) {
      state.account = action.payload;
    },
    setProMode(state, action) {
      state.proMode = { ...action.payload }
    },
    setChainId(state, action) {
      state.chainId = action.payload;
    },

    setActive(state, action) {
      state.active = action.payload;
    },
    initNostrAccount(state, action) {
      state.nostrAccount = action.payload;
      Lockr.set("nostrAccount", action.payload);
      state.npubNostrAccount = action.payload ? nip19.npubEncode(action.payload) : "";

    },
    setBalanceList(state, action) {
      state.balanceList = action.payload;
    },
    setConnectPlat(state, action) {
      state.connectPlat = action.payload;
    },
    setSelectedTokenPlatForm(state, action) {
      state.selectedTokenPlatform = action.payload;
    },
    setIsBindNostrAddress(state, action) {
      state.isBindNostrAddress = action.payload;
    }
  }
});
export const {
  setAccount,
  setChainId,
  setIsProMode,
  setProMode,
  setActive,
  initNostrAccount,
  setConnectPlat,
  setSelectedTokenPlatForm,
  setIsBindNostrAddress,
  setBalanceList
} = userSlice.actions;
export default userSlice.reducer;
