import { Radio, Row, Col, Form, Input } from "antd";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useGetRecommendFee } from "hooks/unisatWallet/useGetFees";
import { useDeepCompareEffect } from "ahooks";
import "./index.scss";
const MAPFEE = {
  Slow: { feeKey: "hourFee", tips: "Abount 1 hours" },
  Avg: { feeKey: "halfHourFee", tips: "Abount 30 minutes" },
  Fast: { feeKey: "fastestFee", tips: "Abount 10 minutes" },
  Custom: { feeKey: "custom" }
};
export default function BRC20Fee({ setFee, ready = false }) {
  const { feesRecommended } = useGetRecommendFee(ready);
  const [feeRate, setFeeRate] = useState("Fast");
  const onChange = useCallback(
    ({ target: { value } }) => {
      setFeeRate(value);
      if (value === "Custom") {
        setFee("");
      } else {
        if (feesRecommended) {
          setFee(feesRecommended[MAPFEE[value].feeKey]);
        }
      }
    },
    [feesRecommended, setFee, setFeeRate]
  );
  const options = useMemo(() => {
    return feesRecommended
      ? Object.keys(MAPFEE).map((itemKey) => {
          const value = itemKey;
          const fee = itemKey !== "Custom" ? feesRecommended[MAPFEE[itemKey].feeKey] : "";
          const tips = itemKey === "Custom" ? "" : MAPFEE[itemKey].tips;
          return {
            label: (
              <Row style={{ height: "100%" }}>
                <Col align="center" className="fee-title" span={24}>
                  {itemKey}
                </Col>
                {itemKey !== "Custom" && (
                  <>
                    <Col align="center" className="fee-value" span={24}>
                      {fee} <span>sat/vB</span>
                    </Col>

                    <Col align="center" className="fee-tip" span={24}>
                      {tips}
                    </Col>
                  </>
                )}
              </Row>
            ),
            value: value
          };
        })
      : [];
  }, [feesRecommended]);
  useDeepCompareEffect(() => {
    if (feeRate && feesRecommended) {
      setFee(feesRecommended[MAPFEE[feeRate].feeKey]);
    }
  }, [feeRate, feesRecommended, setFee]);

  return (
    <>
      <Form.Item label="Fee">
        <Radio.Group
          className="deposit-brc20-fees"
          options={options}
          onChange={onChange}
          value={feeRate}
          optionType="button"
          buttonStyle="solid"
        />
      </Form.Item>
      {feeRate === "Custom" && (
        <Form.Item
          name="fee"
          label=" "
          style={{ marginTop: "10px" }}
          rules={[
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (value) {
                  if (Number.isNaN(Number(value)) || Number(value) < 0) {
                    return Promise.reject(new Error(t`Please enter the correct field.`));
                  }
                  return Promise.resolve();
                }
                return Promise.resolve();
              }
            })
          ]}
        >
          <Input
            suffix="sat/vb"
            size="large"
            style={{ maxWidth: "100px" }}
            onChange={({ target: { value } }) => {
              setFee(value);
            }}
          />
        </Form.Item>
      )}
    </>
  );
}
