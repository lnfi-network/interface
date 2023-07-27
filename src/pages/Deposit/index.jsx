import "./index.scss";
import DepositDescription from "./comps/DepositDescription";
import DepositFormWrapper from "./DepositFormWrapper";
import { LeftOutlined } from "@ant-design/icons";
import { useHistory } from "react-router-dom";
export default function Deposit() {
  const history = useHistory();
  return (
    <>
      <div className="deposit-container">
        {/* <div className="deposit-banner-box">
          <Banner className="deposite-banner" />
        </div> */}
        <div className="deposit-content">
          <div
            className="deposit-title OpenSans"
            onClick={() => {
              history.push("/account");
            }}
          >
            <LeftOutlined className="pointer" />
            <span className="deposit-title__value">Receive Assets</span>
          </div>
          <DepositFormWrapper />
          {/*   <DepositDescription /> */}
        </div>
      </div>
    </>
  );
}
