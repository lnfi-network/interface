import axios from "axios";
const baseUrl = 'https://open-api.unisat.io';
const request = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json;charset=utf-8"
  },
  timeout: 30000
});

request.interceptors.request.use(
  async (config) => {
    const { enableIcp, contentType } = config;
    config.headers['Authorization'] = 'Bearer e9e40051b6a354206645017315d15c4209f521e22dd2773536416dac815c69be';

    if (contentType) {
      config.headers['Content-Type'] = contentType
    }
    if (enableIcp) {
    }
    return config;
  },
  (error) => {
    console.log("error", error);
    return error;
  }
);

request.interceptors.response.use(
  (response) => {
    const { data } = response;
    const { config } = response;
    const enableIcp = config?.enableIcp;
    if (enableIcp) {
      return data;
    }
    return {
      ...data
    };
  },
  (error) => {
    const { config } = error;
    const enableIcp = config?.enableIcp;
    if (enableIcp) {
      if (error.message) {
        window._message.error(error.message)
        return null;
      }
    }
    return error;
  }
);
export default request;
