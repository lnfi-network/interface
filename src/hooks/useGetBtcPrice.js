import { useRequest } from "ahooks";
import { setQuotePirce } from "store/reducer/marketReducer";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
const getBtcPrice = async () => {
  const response = await fetch("https://www.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
  const data = await response.json();
  return data;
};

export const useGetBtcPriceInterval = () => {
  const dispatch = useDispatch();
  const QUOTE_UNIT = process.env.REACT_APP_QUOTE_UNIT;
  const { data, run, cancel } = useRequest(getBtcPrice, {
    pollingInterval: 10000
  });
  useEffect(() => {
    if (Number(data?.price)) {
      dispatch(setQuotePirce(Number(data?.price) / QUOTE_UNIT));
    }
  }, [QUOTE_UNIT, data, dispatch]);
};
