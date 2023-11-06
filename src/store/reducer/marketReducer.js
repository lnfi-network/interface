import { createSlice } from "@reduxjs/toolkit";
export const marketSlice = createSlice({
  name: "market",
  initialState: {
    tokenList: [],
    isTokenSet: false,
    responseTime: 0,
    quote_pirce: 0
  },
  reducers: {
    setTokenList(state, { payload }) {
      if (payload && Array.isArray(payload)) {
        const sortedArray = [...payload].sort((a, b) => a.id - b.id);
        state.tokenList = sortedArray;
        state.isTokenSet = true;
      }
    },
    updateTokenList(state, { payload }) {
      if (payload && Array.isArray(payload)) {
        // const sortedArray = [...payload].sort((a, b) => a.id - b.id);
        state.tokenList = state.tokenList?.map((item) => {
          const asset = payload.find((k) => k.asset_id == item.token);
          return { ...asset, ...item };
        });
      }
    },
    setResponseTime(state, { payload }) {
      state.responseTime = payload;
    },
    setQuotePirce(state, { payload }) {
      state.quote_pirce = payload;
    }
  }
});
export const { setTokenList, updateTokenList, setResponseTime, setQuotePirce } = marketSlice.actions;
export default marketSlice.reducer;
