import { createSlice } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import * as Lockr from "lockr";
const INIT_RELAYS = [
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
]

const getInitialStateRelays = () => {
  const localStorageRelays = Lockr.get("relayList");
  if (localStorageRelays) {
    const relayList = localStorageRelays.map(localStorageRelay => localStorageRelay.address);
    const initRelayUrls = INIT_RELAYS.map(initRelay => initRelay.address)
    if (JSON.stringify(relayList) !== JSON.stringify(initRelayUrls)) {
      return INIT_RELAYS
    }
    const maplocalStorageRelay = localStorageRelays.map(relay => ({ ...relay, status: 'disconnected' }))
    return maplocalStorageRelay
  }
  return INIT_RELAYS
}
export const relaySlice = createSlice({
  name: "basic",
  initialState: {
    relayList: getInitialStateRelays(),
    hasRelayConnected: false,
  },
  reducers: {
    addRelayUrls(state, { payload }) {
      state.relayList = [...state.relayList, { ...payload }];
      Lockr.set("relayList", state.relayList);
    },
    removeRelayUrls(state, { payload }) {
      const willDeleteRelayItemIndex = state.relayList.findIndex((relayUrlItem) => relayUrlItem.address === payload.address);
      state.relayList.splice(willDeleteRelayItemIndex, 1);
      Lockr.set("relayList", state.relayList);
    },
    initRelayUrls(state, { payload }) {
      state.relayList = payload;
      Lockr.set("relayList", payload);
    },
    updateRelayStatus(state, { payload }) {
      const itemRelay = state.relayList.find((item) => payload.address.includes(item.address));
      itemRelay.status = payload.status;
      if (payload.status === 'connected') {
        state.hasRelayConnected = true
      }
      Lockr.set("relayList", state.relayList);
    }
  }
});
export const { addRelayUrls, removeRelayUrls, initRelayUrls, updateRelayStatus } =
  relaySlice.actions;

export const selectorRelayUrls = createSelector(({ relay }) => relay.relayList, (relayList) => relayList.map(relay => relay.address))
export default relaySlice.reducer;
