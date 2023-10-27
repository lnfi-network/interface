import { FiX } from "react-icons/fi";
import { Trans } from "@lingui/macro";
import { Link } from "react-router-dom";
import { HeaderLink } from "./HeaderLink";
import "./Header.scss";
import RelayList from "../RelayList";
import logoImg from "img/logo_nostr.png";
import OutLinks from "../OutLinks/index";
export function AppHeaderLinks({ small, clickCloseIcon }) {
  const stopProp = (e) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  };

  return (
    <div className="App-header-links" onClick={() => clickCloseIcon && clickCloseIcon()}>
      {small && (
        <div className="App-header-links-header">
          <Link className="App-header-link-main" to="/">
            <img src={logoImg} alt="NostrAssets Logo" />
          </Link>
          <div
            className="App-header-menu-icon-block mobile-cross-menu"
            onClick={() => clickCloseIcon && clickCloseIcon()}
          >
            <FiX className="App-header-menu-icon" />
          </div>
        </div>
      )}
      <div className="App-header-link-container">
        <HeaderLink to="/account">
          <Trans>Assets</Trans>
        </HeaderLink>
      </div>
      <div className="App-header-link-container">
        <HeaderLink to="/explore">
          <Trans>Explorer</Trans>
        </HeaderLink>
      </div>
      <div className="App-header-link-container">
        <HeaderLink to="/marketplace">
          <Trans>Marketplace</Trans>
        </HeaderLink>
      </div>
      {/* <div className="App-header-link-container">
        <a
          href="https://doc.nostrassets.com"
          target="_blank"
        >
          <Trans>Chat-to-Trade</Trans>
        </a>
      </div> */}

      {process.env.REACT_APP_CURRENT_ENV !== "prod" && (
        <>
          <div className="App-header-link-container">
            <HeaderLink to="/faucet">
              <Trans>Faucet</Trans>
            </HeaderLink>
          </div>
        </>
      )}
      {process.env.REACT_APP_CURRENT_ENV === "dev" && (
        <div className="App-header-link-container">
          <HeaderLink to="/mintassets">
            <Trans>Mint Assets</Trans>
          </HeaderLink>
        </div>
      )}
      <div className="App-header-link-container">
        <HeaderLink to="/claim">Claim</HeaderLink>
      </div>

      {/* <div className="App-header-link-container">
        <a
          href="https://doc.nostrassets.com"
          target="_blank"
        >
          <Trans>About NRC20</Trans>
        </a>
      </div> */}

      {small && (
        <div style={{ padding: "0 100px 0 20px", marginTop: "40px" }}>
          <OutLinks></OutLinks>
        </div>
      )}
      {small && (
        <div
          style={{
            marginTop: "40px",
            position: "absolute",
            bottom: "30px",
            left: 0
          }}
          onClick={stopProp}
        >
          <RelayList></RelayList>
        </div>
      )}
    </div>
  );
}
