import { Button, Modal, Form, message } from "antd";
import { useState, useCallback, useMemo, memo, useEffect } from "react";
import { useSelector } from "react-redux";
import { limitDecimals, numberWithCommas } from "lib/numbers";
import { t } from "@lingui/macro";
import classNames from "classnames";
import { nip19 } from "nostr-tools";
import BigNumber from "bignumber.js";
import { useAllowance, useApprove, useSendMarketOrder, useQueryBalance } from "hooks/useNostrMarket";
import { QUOTE_ASSET } from "config/constants";
import "./index.scss";

function MarketModalForm({ setIsMarketModalForm, isMarketModalForm, reexcuteQuery, data }) {
  const [form] = Form.useForm();
  const { tokenList } = useSelector(({ market }) => market);
  const { balanceList, nostrAccount } = useSelector(({ user }) => user);
  const [btnLoading, setBtnLoading] = useState(false);
  const [totalValue, setTotalValue] = useState(0);
  const [amountValue, setAmountValue] = useState(0);
  const { handleQueryAllowance, allowance } = useAllowance();
  const { handleApproveAsync } = useApprove();
  const { handleTakeOrderAsync } = useSendMarketOrder();
  const { handleQueryBalance } = useQueryBalance();

  const isBuy = useMemo(() => {
    return data?.type?.toUpperCase() == "SELL";
  }, [data?.type]);
  const balance = useMemo(() => {
    if (Object.keys(balanceList).length > 0) {
      return balanceList[QUOTE_ASSET]?.balanceShow || 0;
    }
  }, [balanceList]);
  const getTokenBalance = useCallback(
    (tokenName) => {
      return balanceList[tokenName]?.balanceShow;
    },
    [balanceList]
  );
  const qutoAsset = useMemo(() => {
    return tokenList.find((item) => item.name == QUOTE_ASSET);
  }, [tokenList]);
  const curToken = useMemo(() => {
    return tokenList.find((item) => item.name == data?.token);
  }, [data?.token, tokenList]);
  const onCancel = useCallback(() => {
    setIsMarketModalForm(false);
  }, [setIsMarketModalForm]);
  useEffect(() => {
    form.resetFields();

    if (isBuy) {
      handleQueryAllowance(QUOTE_ASSET);
    } else {
      handleQueryAllowance(data?.token);
    }

    var maxTotal = BigNumber(data.volume)
      .minus(data.deal_volume)
      .div(curToken?.decimals)
      .times(BigNumber(data?.price).div(qutoAsset?.decimals));
    var total = parseFloat(maxTotal.dp(4).toNumber());
    var amount = parseFloat(BigNumber(total).div(BigNumber(data?.price).div(qutoAsset?.decimals)).dp(4).toNumber());
    setTotalValue(total || 0);
    setAmountValue(amount || 0);
  }, [curToken?.decimals, data, form, getTokenBalance, handleQueryAllowance, isBuy, qutoAsset?.decimals]);

  const buyOrSellSelect = useMemo(() => {
    return isBuy ? (
      <div className="market-form-title">
        <span className="market-form-title-tag market-form-title-tag__buy">Buy</span>
        <span className="market-form-title-text">Confirm to Buy</span>
      </div>
    ) : (
      <div className="market-form-title">
        <span className="market-form-title-tag market-form-title-tag__sell">Sell</span>
        <span className="market-form-title-text">Confirm to Sell</span>
      </div>
    );
  }, [isBuy]);

  const onMarketSubmit = useCallback(async () => {
    try {
      setBtnLoading(true);
      let ret = await handleTakeOrderAsync(data?.id);
      if (ret?.code === 0) {
        setBtnLoading(false);
        message.success(t`Submit successfully`);
        //refresh balanceList
        await handleQueryBalance(nip19.npubEncode(nostrAccount));
        reexcuteQuery();
        onCancel();
      } else {
        setBtnLoading(false);
        message.error(ret?.data || "Fail");
      }
    } catch (e) {
      message.error(e.message || "Fail");
    } finally {
      setBtnLoading(false);
    }
  }, [handleTakeOrderAsync, data?.id, onCancel, reexcuteQuery, handleQueryBalance, nostrAccount]);
  const onApprove = useCallback(async () => {
    try {
      setBtnLoading(true);
      let ret = null;
      if (isBuy) {
        ret = await handleApproveAsync(Number(totalValue), QUOTE_ASSET);
        handleQueryAllowance(QUOTE_ASSET);
      } else {
        ret = await handleApproveAsync(Number(amountValue), data.token);
        handleQueryAllowance(data.token);
      }
      if (ret?.code === 0) {
        setBtnLoading(false);
        message.success(t`Approve successfully`);
      } else {
        setBtnLoading(false);
        message.error(ret?.data || "Fail");
      }
    } catch (e) {
      setBtnLoading(false);
      message.error(e.message || "Fail");
    } finally {
      setBtnLoading(false);
    }
  }, [isBuy, handleApproveAsync, totalValue, handleQueryAllowance, amountValue, data.token]);
  const memoButton = useMemo(() => {
    if (isBuy) {
      if (!Number(balance) || Number(balance) === 0 || totalValue > Number(balance)) {
        return (
          <Button type="primary" className={classNames("listing-submit-btn")} loading={btnLoading} disabled={true}>
            {"Insufficient balance"}
          </Button>
        );
      }
      if (!Number(allowance?.amountShow) || Number(allowance?.amountShow) < Number(totalValue)) {
        return (
          <Button
            type="primary"
            className="listing-submit-btn"
            onClick={onApprove}
            disabled={Number(balance) === 0}
            loading={btnLoading}
          >
            Approve
          </Button>
        );
      }
      return (
        <>
          <Button
            type="primary"
            className={classNames("listing-submit-btn")}
            // size="large"
            loading={btnLoading}
            onClick={onMarketSubmit}
          >
            {`Buy ${data?.token}`}
          </Button>
        </>
      );
    } else {
      const selectedTokenBalance = getTokenBalance(data?.token);
      if (
        !Number(selectedTokenBalance) ||
        Number(selectedTokenBalance) === 0 ||
        totalValue > Number(selectedTokenBalance)
      ) {
        return (
          <Button
            type="primary"
            className={classNames("listing-submit-btn", {
              "listing-submit-btn__sell": !isBuy
            })}
            loading={btnLoading}
            onClick={onMarketSubmit}
            disabled={true}
          >
            {"Insufficient balance"}
          </Button>
        );
      }
      if (!Number(allowance?.amountShow) || Number(allowance?.amountShow) < Number(amountValue)) {
        return (
          <Button
            type="primary"
            className={classNames("listing-submit-btn", {
              "listing-submit-btn__sell": !isBuy
            })}
            size="large"
            onClick={onApprove}
            loading={btnLoading}
          >
            Approve
          </Button>
        );
      }
      return (
        <Button
          type="primary"
          className={classNames("listing-submit-btn", {
            "listing-submit-btn__sell": !isBuy
          })}
          size="large"
          loading={btnLoading}
          onClick={onMarketSubmit}
        >
          {`Sell ${data?.token}`}
        </Button>
      );
    }
  }, [
    allowance,
    balance,
    isBuy,
    totalValue,
    btnLoading,
    onMarketSubmit,
    data?.token,
    onApprove,
    getTokenBalance,
    amountValue
  ]);
  return (
    <>
      <Modal
        className="nostrswap-modal"
        open={isMarketModalForm}
        width="420px"
        title={buyOrSellSelect}
        footer={null}
        onCancel={onCancel}
      >
        <div className="market-buy-list">
          <div className="market-buy-item">
            <div className="market-buy-label">Token</div>
            <div className="market-buy-value">{data?.token}</div>
          </div>
          <div className="market-buy-item">
            <div className="market-buy-label">Price</div>
            <div className="market-buy-value">
              {data?.price && qutoAsset
                ? numberWithCommas(limitDecimals(data?.price / qutoAsset?.decimals, qutoAsset?.reserve))
                : "--"}{" "}
              {QUOTE_ASSET}
            </div>
          </div>
          <div className="market-buy-item">
            <div className="market-buy-label">{isBuy ? "Buy Amount" : "Sell Amount"}</div>
            <div className="market-buy-value">{amountValue}</div>
          </div>
          <div className="market-buy-item">
            <div className="market-buy-label">Total Value</div>
            <div className="market-buy-value">
              {totalValue} {QUOTE_ASSET}
            </div>
          </div>
          <div className="market-buy-available">
            {" "}
            Balance:{" "}
            {isBuy
              ? `${getTokenBalance(QUOTE_ASSET) || 0} ${QUOTE_ASSET}`
              : `${getTokenBalance(data.token) || 0} ${data.token}`}
          </div>
          <div className="market-buy-submit">{memoButton}</div>
        </div>
      </Modal>
    </>
  );
}
export default memo(MarketModalForm);
