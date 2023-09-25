import { createSlice } from "@reduxjs/toolkit";
export const marketSlice = createSlice({
  name: "market",
  initialState: {
    tokenList: [],
    responseTime: 0
  },
  reducers: {
    setTokenList(state, { payload }) {
      if (payload && Array.isArray(payload)) {
        const sortedArray = [...payload].sort((a, b) => a.id - b.id);

        state.tokenList = sortedArray;


      }
    },
    setResponseTime(state, { payload }) {
      state.responseTime = payload;
    }
  }
});
export const { setTokenList, setResponseTime } = marketSlice.actions;
export default marketSlice.reducer;
