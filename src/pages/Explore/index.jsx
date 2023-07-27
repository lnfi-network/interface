import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { Layout, Menu, theme } from "antd";
import { t } from "@lingui/macro";
import { BarChartOutlined } from "@ant-design/icons";
import {
  Switch,
  Route,
  Link,
  useHistory,
  useRouteMatch,
  Redirect,
} from "react-router-dom";
import MarketEvents from "./MarketEvents";
// import Orders from "./Orders";
import TokenEvents from "./TokenEvents";
import Markets from "./Markets";
import Banner from "components/Banner";
// import TokenSlider from "./comps/TokenSlider"
import "./index.scss";
const { Header, Content } = Layout;
function getItem(label, key, icon, children) {
  return {
    label,
    key,
    icon,
    children,
  };
}
export default function Explore() {
  const [selectedKeys, setSelectedKeys] = useState([]);
  const match = useRouteMatch();
  const history = useHistory();
  const items = useMemo(() => {
    return [
      getItem(
        <Link to={`${match.url}/token-events`}>{t`Token Events`}</Link>,
        "tokenevents"
      ),
      getItem(
        <Link to={`${match.url}/market-events`}>{t`Market Events`}</Link>,
        "marketevents"
      ),
      // getItem(<Link to={`${match.url}/orders`}>{t`Orders`}</Link>, "orders"),
      // getItem(<Link to={`${match.url}/markets`}>{t`Markets`}</Link>, "markets"),
    ];
  }, [match.url]);
  const pathNames = useMemo(() => {
    return {
      [match.url]: ["tokenevents"],
      [match.url + "/token-events"]: ["tokenevents"],
      // [match.url + "/orders"]: ["orders"],
      [match.url + "/market-events"]: ["marketevents"],
      // [match.url + "/market"]: ["markets"],
    };
  }, [match.url]);
  const switchMemo = useMemo(() => {
    return (
      <Switch>
        <Route exact path="/explore">
          <Redirect to="/explore/token-events" />
        </Route>
        <Route exact path={`${match.url}/token-events`}>
          <TokenEvents />
        </Route>
        <Route exact path={`${match.url}/market-events`}>
          <MarketEvents />
        </Route>
        {/* <Route exact path={`${match.url}/orders`}>
          <Orders />
        </Route> */}
        <Route exact path={`${match.url}/markets`}>
          <Markets></Markets>
        </Route>
        <Route exact path="/explore/*">
          <Redirect to="/explore/token-events" />
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
  const historyTo = useCallback(() => {
    history.push(`${match.url}/markets`);
    setSelectedKeys([]);
  }, [history, match.url]);

  return (
    <div className="market-dashborad">
      <Layout>
        {/* <div className="banner-box">
          <Banner></Banner>
        </div> */}
        {/* <TokenSlider></TokenSlider> */}
        <div className="dashborad-sub-menu-box">
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={selectedKeys}
            onClick={selectedCilck}
            items={items}
            className="dashborad-sub-menu"
          />
          {/* <div className="dashborad-sub-menu-abs" onClick={() => historyTo()}><span className="dashborad-sub-menu-abs-markets">{t`Markets`}</span><BarChartOutlined className="dashborad-sub-menu-abs-icon" color="#06F4DB" /></div> */}
        </div>
        {/* </Header> */}

        <Content className="site-layout">
          <div className="market-content">{switchMemo}</div>
        </Content>
      </Layout>
    </div>
  );
}
