import request from "./unisatRequest";
export const getTansferableInscriptions = (address, ticker, params = { offset: 0, limit: 100 }) => {
  return request.get(`/v1/indexer/address/${address}/brc20/${ticker}/transferable-inscriptions`, { params, enableIcp: true });
};