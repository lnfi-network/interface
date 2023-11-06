import { useState, useRef, useMemo, memo, useCallback, useEffect } from "react";
import { Layout, Menu, Button } from "antd";
import { t } from "@lingui/macro";
import { Switch, Route, Link, useHistory, useRouteMatch, Redirect } from "react-router-dom";
import Listing from "./Listing";
import OrderHistory from "./OrderHistory";
import MyOrder from "./MyOrder";
import Markets from "./Markets";
import ListingModalForm from "./comps/Listing";
import { useSelector } from "react-redux";
import useGetNostrAccount from "hooks/useGetNostrAccount";
import { BarChartOutlined } from "@ant-design/icons";
import { nip19 } from "nostr-tools";
// import { useQueryBalance } from "hooks/useNostrMarket";
// import { useDebounceEffect, useMount } from "ahooks";
import "./index.scss";
import CheckNostrButton from "components/CheckNostrButton";
const { Content } = Layout;
function getItem(label, key, icon, children) {
  return {
    label,
    key,
    icon,
    children
  };
}

export default function Marketplace() {
  const [selectedKeys, setSelectedKeys] = useState([]);
  const refListModalForm = useRef(null);
  const refListing = useRef(null);
  const match = useRouteMatch();
  const history = useHistory();
  const { nostrAccount } = useSelector(({ user }) => user);
  const { handleGetNostrAccount } = useGetNostrAccount();
  // const { handleQueryBalance } = useQueryBalance();
  // useEffect(() => {
  //   if (JSON.stringify(balanceList) == "{}") {
  //     handleQueryBalance(nip19.npubEncode(nostrAccount))
  //   }
  // }, [balanceList, handleQueryBalance, nostrAccount])
  const [isListFormShow, setIsListFormShow] = useState(false);
  const items = useMemo(() => {
    return [
      getItem(<Link to={`${match.url}/listing`}>{t`Listing`}</Link>, "listing"),
      getItem(<Link to={`${match.url}/order-history`}>{t`Order History`}</Link>, "orderhistory"),
      getItem(<Link to={`${match.url}/my-order`}>{t`My Order`}</Link>, "myorder")
    ];
  }, [match.url]);
  const pathNames = useMemo(() => {
    return {
      [match.url]: ["listing"],
      [match.url + "/listing"]: ["listing"],
      [match.url + "/order-history"]: ["orderhistory"],
      [match.url + "/my-order"]: ["myorder"]
    };
  }, [match.url]);
  const switchMemo = useMemo(() => {
    return (
      <Switch>
        <Route exact path="/marketplace">
          <Redirect to="/marketplace/listing" />
        </Route>
        <Route exact path={`${match.url}/listing`}>
          <Listing refListing={refListing}></Listing>
        </Route>
        <Route exact path={`${match.url}/order-history`}>
          <OrderHistory></OrderHistory>
        </Route>
        <Route exact path={`${match.url}/my-order`}>
          <MyOrder></MyOrder>
        </Route>
        <Route exact path={`${match.url}/markets`}>
          <Markets />
        </Route>
        <Route exact path="/marketplace/*">
          <Redirect to="/marketplace/listing" />
        </Route>
      </Switch>
    );
  }, [match.url]);

  useEffect(() => {
    setSelectedKeys(pathNames[history.location.pathname]);
  }, [history.location.pathname, pathNames]);
  const selectedCilck = useCallback(({ item, key, keyPath, domEvent }) => {
    setSelectedKeys(key);
  }, []);
  const handleList = useCallback(async () => {
    if (!nostrAccount) {
      const retAddress = await handleGetNostrAccount();
      if (retAddress) {
        setIsListFormShow(true);
      }
    } else {
      setIsListFormShow(true);
    }
  }, [handleGetNostrAccount, nostrAccount]);
  const historyTo = useCallback(() => {
    history.push(`${match.url}/markets`);
    setSelectedKeys([]);
  }, [history, match.url]);
  return (
    <>
      {/* <GlobalHooks /> */}

      {isListFormShow && (
        <ListingModalForm
          isListFormShow={isListFormShow}
          setIsListFormShow={setIsListFormShow}
          reexcuteQuery={refListing?.current?.refresh}
          token={refListing?.current?.token}
        />
      )}

      <div className="marketplace">
        <Layout className="marketplace-layout">
          <div className="marketplace-title OpenSans">{t`Marketplace`}</div>
          <div className="marketplace-menu-wrap">
            <Menu
              theme="dark"
              mode="horizontal"
              selectedKeys={selectedKeys}
              onClick={selectedCilck}
              items={items}
              className="marketplace-menu"
            />
            {process.env.REACT_APP_CURRENT_ENV !== "prod" && (
              <div className="marketplace-sub-menu-abs" onClick={() => historyTo()}>
                <span className="marketplace-sub-menu-abs-markets">{t`Markets`}</span>
                <BarChartOutlined className="marketplace-sub-menu-abs-icon" color="#06F4DB" />
              </div>
            )}

            <div className="marketplace-listing-btn">
              <CheckNostrButton>
                <Button className="buy-list-btn" type="primary" onClick={handleList}>
                  {t`Make New Listing`}
                </Button>
              </CheckNostrButton>
            </div>
          </div>

          <Content className="site-layout">
            <div className="market-content">{switchMemo}</div>
          </Content>
        </Layout>
      </div>
    </>
  );
}
