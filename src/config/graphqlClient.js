import { Client, cacheExchange, fetchExchange } from "urql";
export const client = Client({
  url: process.env.REACT_APP_API_GraphQL_URL,
  exchanges: [cacheExchange, fetchExchange],
  requestPolicy: "network-only"
});
