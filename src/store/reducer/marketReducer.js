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
    setResponseTime(state, { payload }) {
      state.responseTime = payload;
    },
    setQuotePirce(state, { payload }) {
      state.quote_pirce = payload;
    }
  }
});
export const { setTokenList, setResponseTime, setQuotePirce } = marketSlice.actions;
export default marketSlice.reducer;
