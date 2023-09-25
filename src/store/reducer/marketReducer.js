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
        const SAT_TOKEN_Index = sortedArray.findIndex(item => item.name === 'SATS');
        const OTHER_TOKEN_LIST = sortedArray.filter(item => item.name !== 'SATS');
        if (SAT_TOKEN_Index > -1) {
          const combinedArray = [sortedArray[SAT_TOKEN_Index], ...OTHER_TOKEN_LIST]
          state.tokenList = combinedArray
        } else {
          state.tokenList = sortedArray;
        }

      }
    },
    setResponseTime(state, { payload }) {
      state.responseTime = payload;
    }
  }
});
export const { setTokenList, setResponseTime } = marketSlice.actions;
export default marketSlice.reducer;
