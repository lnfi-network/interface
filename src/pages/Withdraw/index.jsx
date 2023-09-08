import WithdrawForm from "./comps/WithdrawForm";
import { LeftOutlined } from "@ant-design/icons";
import { useHistory } from "react-router-dom";
import { useQueryBalance } from "hooks/useNostrMarket";
import { useSelector } from "react-redux";
import "./index.scss";
export default function Withdraw() {
  const history = useHistory();
  const { handleQueryBalance } = useQueryBalance();
  const { npubNostrAccount } = useSelector(({ user }) => user);
  return (
    <>
      <div className="withdraw-container">
        <div className="withdraw-content">
          <div
            className="withdraw-title OpenSans"
            onClick={() => {
              handleQueryBalance(npubNostrAccount);
              history.push("/account");
            }}
          >
            <LeftOutlined className="pointer" />
            <span className="withdraw-title__value">Send Assets</span>
          </div>
          <WithdrawForm />
        </div>
      </div>
    </>
  );
}
