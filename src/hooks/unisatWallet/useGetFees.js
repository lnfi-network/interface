/* import mempoolJS from "@mempool/mempool.js"; */
import { useState, useEffect } from "react";
import { useRequest } from "ahooks";

const getNostrFeesRecommendFee = async () => {
  const fees = mempoolJS().bitcoin.fees;
  const ret = await fees.getFeesRecommended();

  return ret;
};

export const useGetRecommendFee = (ready = false) => {
  const { data, run, loading } = useRequest(getNostrFeesRecommendFee, {
    pollingInterval: 300000,
    ready,
    manual: true
  });

  useEffect(() => {
    if (ready) {
      run();
    }
  }, [ready, run]);

  return {
    feesRecommended: data
  };
};
