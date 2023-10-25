import MintList from "./MintList";
import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { Layout, Menu, message, theme } from "antd";
import { t } from "@lingui/macro";
import { BarChartOutlined } from "@ant-design/icons";
import { Switch, Route, Link, useHistory, useRouteMatch, Redirect } from "react-router-dom";
// import MarketEvents from "./MarketEvents";
// import Orders from "./Orders";
// import TokenEvents from "./TokenEvents";
// import Markets from "./Markets";
// import Banner from "components/Banner";
// import TokenSlider from "./comps/TokenSlider"
import "./index.scss";
const { Header, Content } = Layout;
function getItem(label, key, icon, children) {
  return {
    label,
    key,
    icon,
    children
  };
}
export default function Explore() {
  const [selectedKeys, setSelectedKeys] = useState([]);
  const match = useRouteMatch();
  const history = useHistory();
  const items = useMemo(() => {
    return [
      getItem(<Link to={`${match.url}/create-assets`}>{t`Create Assets`}</Link>, "createassets"),
      // getItem(
      //   <Link to={`${match.url}/mint-assets`}>{t`Mint Assets`}</Link>,
      //   "mintassets"
      // ),
      getItem(<span to={`${match.url}/mint-assets`}>{t`Mint Assets`}</span>, "mintassets")
      // getItem(<Link to={`${match.url}/orders`}>{t`Orders`}</Link>, "orders"),
      // getItem(<Link to={`${match.url}/markets`}>{t`Markets`}</Link>, "markets"),
    ];
  }, [match.url]);
  const pathNames = useMemo(() => {
    return {
      [match.url]: ["createassets"],
      [match.url + "/create-assets"]: ["createassets"],
      // [match.url + "/orders"]: ["orders"],
      [match.url + "/mint-assets"]: ["mintassets"]
      // [match.url + "/market"]: ["markets"],
    };
  }, [match.url]);
  const switchMemo = useMemo(() => {
    return (
      <Switch>
        <Route exact path="/mintassets">
          <Redirect to="/mintassets/create-assets" />
        </Route>
        <Route exact path={`${match.url}/create-assets`}>
          <MintList />
        </Route>
        <Route exact path={`${match.url}/mint-assets`}>
          <MintList />
        </Route>
        {/* <Route exact path={`${match.url}/orders`}>
          <Orders />
        </Route> */}
        <Route exact path="/mintassets/*">
          <Redirect to="/mintassets/create-assets" />
        </Route>
      </Switch>
    );
  }, [match.url]);

  useEffect(() => {
    setSelectedKeys(pathNames[history.location.pathname]);
  }, [history.location.pathname, pathNames]);
  const selectedCilck = useCallback(({ item, key, keyPath, domEvent }) => {
    // console.log("selectedCilck",key);
    if (key == "mintassets") {
      message.info("Coming soon");
      return false;
    }
    setSelectedKeys(key);
  }, []);

  return (
    <div className="mint-list">
      <Layout>
        <div className="mint-list-head">
          <div className="account-head-left-nostr">
            <div className="f18 b color-light tc">Mint Assets</div>
            <div className="f16 mt20 sub-title">
              NostrAssets is your top choice for creating，minting Taproot assets and launching Fair Mint activities
              with ease，whether you're creating or importing them.
            </div>
          </div>
        </div>
        <div className="mint-sub-menu-box">
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={selectedKeys}
            onClick={selectedCilck}
            items={items}
            className="mint-sub-menu"
          />
        </div>

        <Content className="site-layout">
          <div className="mint-content">{switchMemo}</div>
        </Content>
      </Layout>
    </div>
  );
}
