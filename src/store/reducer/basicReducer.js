import { createSlice } from "@reduxjs/toolkit";
import * as Lockr from "lockr";
const localStorageRelay = Lockr.get("initRelayUrlsv2");
let maplocalStorageRelay = localStorageRelay ? localStorageRelay.map(relay => ({ ...relay, status: 'disconnected' })) : null
export const basicSlice = createSlice({
  name: "basic",
  initialState: {
    relayUrls: maplocalStorageRelay || [
      {
        address: "wss://relay.nostrassets.com",
        offical: true,
        link: true,
        delete: false,
        status: "disconnected"
      },

      /*  {
         address: "wss://relay.damus.io",
         offical: true,
         link: true,
         delete: false,
         status: "disconnected"
       } */
    ],
    isRelayConnected: false
  },
  reducers: {
    addRelayUrls(state, { payload }) {
      state.relayUrls = [...state.relayUrls, { ...payload }];
      Lockr.set("initRelayUrlsv2", state.relayUrls);
    },
    removeRelayUrls(state, { payload }) {
      const willRelayUrlIndex = state.relayUrls.findIndex((relayUrlItem) => relayUrlItem.address === payload.address);
      state.relayUrls.splice(willRelayUrlIndex, 1);
      Lockr.set("initRelayUrlsv2", state.relayUrls);
    },
    initRelayUrls(state, { payload }) {
      state.relayUrls = payload;
      Lockr.set("initRelayUrlsv2", payload);
    },
    updateRelayStatus(state, { payload }) {
      const itemRelay = state.relayUrls.find((item) => item.address === payload.address);
      itemRelay.status = payload.status;
      Lockr.set("initRelayUrlsv2", state.relayUrls);
      if (itemRelay.address === 'wss://relay.nostrassets.com') {
        if (itemRelay.status === 'connected') {
          state.isRelayConnected = true
        }
      }
    }
  }
});
export const { addRelayUrls, removeRelayUrls, initRelayUrls, updateRelayStatus } =
  basicSlice.actions;
export default basicSlice.reducer;
