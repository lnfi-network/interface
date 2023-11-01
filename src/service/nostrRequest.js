import axios from "axios";
const baseUrl = process.env.REACT_APP_QUERY_API_URL;
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
