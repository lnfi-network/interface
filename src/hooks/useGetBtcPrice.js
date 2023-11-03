import { useRequest } from "ahooks";
import { setQuotePirce } from "store/reducer/marketReducer";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
const getBtcPrice = async () => {
  const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
  const data = await response.json();
  return data;
};

export const useGetBtcPriceInterval = () => {
  const dispatch = useDispatch();
  const QUOTE_UNIT = process.env.REACT_APP_QUOTE_UNIT;
  const { data, run, cancel } = useRequest(getBtcPrice, {
    pollingInterval: 180000
  });
  useEffect(() => {
    if (Number(data?.bitcoin?.usd)) {
      dispatch(setQuotePirce(Number(data?.bitcoin?.usd) / QUOTE_UNIT));
    }
  }, [QUOTE_UNIT, data, dispatch]);
};
