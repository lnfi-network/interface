import request from "./nostrRequest";
export const getBalance = (data = {}) => {
  return request.post(`/api/balanceOf`, data, { enableIcp: true });
};
export const getAllowance = (data = {}) => {
  return request.post(`/api/allowance`, data, { enableIcp: true });
};