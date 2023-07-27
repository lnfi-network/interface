import { createSelector } from "reselect";
export const selectorGetSimpleTokens = createSelector(({ market }) => market.tokenList, (tokenList) => {
  return {
    tokens: tokenList.map(token => ({
      tokenName: token.name,
      id: token.id
    }))
  }
})