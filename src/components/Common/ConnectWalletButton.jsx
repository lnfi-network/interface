import { ReactNode } from "react";
import "./ConnectWalletButton.scss";
import { Button } from "antd";
export default function ConnectWalletButton({
  imgSrc,
  children,
  onClick,
  loading,
  ...props
}) {
  return (
    <Button
      className="connect-wallet-btn"
      type="primary"
      loading={loading}
      onClick={onClick}
      {...props}
    >
      {imgSrc && <img className="btn-icon" src={imgSrc} alt="" />}
      <span className="btn-label">{children}</span>
    </Button>
  );
}
