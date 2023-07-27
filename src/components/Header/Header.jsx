import React, { useState, useMemo, memo } from "react";
import cx from "classnames";
import AppNostrHeaderUser from "./AppNostrHeaderUser";
import RelayList from "../RelayList";
import OutLinks from "../OutLinks/index";
import { AppHeaderLinks } from "./AppHeaderLinks";
import logoImg from "img/logo_nostr.png";
import logoSmallImg from "img/logo_nostr.png";
import { RiMenuLine } from "react-icons/ri";
import { Drawer } from "antd";
import { FaTimes } from "react-icons/fa";

import "./Header.scss";
import { Link } from "react-router-dom";
import { useSize } from "ahooks";
import { useQueryTokenList } from "hooks/useNostrMarket";

const GetTokenList = memo(() => {
  useQueryTokenList();
  return null;
});
function NostrHeader() {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const { width } = useSize(document.querySelector("body"));

  const memoAddressDropDown = useMemo(() => {
    return <AppNostrHeaderUser />;
  }, []);

  /*  useEffect(() => {
    if (isDrawerVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDrawerVisible]); */

  return (
    <>
      <GetTokenList />
      <header>
        {width > 800 ? (
          <div className="App-header large">
            <div className="App-header-container-left">
              <Link
                className="App-header-link-main App-header-link-main1"
                to="/"
              >
                <img src={logoImg} className="big" alt="NostrAssets Logo" />
              </Link>
              <AppHeaderLinks />
            </div>
            <div className="App-header-container-right">
              <div className="header-OutLinks">
                <OutLinks></OutLinks>
              </div>
              {memoAddressDropDown}
              <RelayList />
            </div>
          </div>
        ) : (
          <div
            className={cx("App-header", "small", { active: isDrawerVisible })}
          >
            <div
              className={cx("App-header-link-container", "App-header-top", {
                active: isDrawerVisible,
              })}
            >
              <div className="App-header-container-left">
                <div
                  className="App-header-menu-icon-block"
                  onClick={() => setIsDrawerVisible(!isDrawerVisible)}
                >
                  {!isDrawerVisible && (
                    <RiMenuLine className="App-header-menu-icon" />
                  )}
                  {isDrawerVisible && (
                    <FaTimes className="App-header-menu-icon" />
                  )}
                </div>
                <div
                  className="App-header-link-main clickable"
                  onClick={() => setIsDrawerVisible(!isDrawerVisible)}
                >
                  <img src={logoImg} className="big" alt="NostrAssets Logo" />
                  <img
                    src={logoSmallImg}
                    className="small"
                    alt="NostrAssets Logo"
                  />
                </div>
              </div>
              <div className="App-header-container-right">
                <div className="header-OutLinks">
                  <OutLinks></OutLinks>
                </div>
                <AppNostrHeaderUser />
                {/* <RelayList setRelayUrls={setRelayUrls}></RelayList> */}
              </div>
            </div>
          </div>
        )}
      </header>

      <Drawer
        title={null}
        className="App-header-links-container App-header-drawer"
        placement="left"
        width="100vw"
        headerStyle={{ display: "none" }}
        closeIcon={null}
        open={isDrawerVisible}
      >
        <AppHeaderLinks
          small
          clickCloseIcon={() => setIsDrawerVisible(false)}
        />
      </Drawer>
    </>
  );
}
export const Header = memo(NostrHeader);
