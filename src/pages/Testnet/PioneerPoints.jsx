import Container from "components/Container";
import "./PionneerPoints.scss";
import { Tooltip } from "antd";
import UserPointerInfo from "./comps/UserPointerInfo";
import QuestList from "./comps/QuestList";
import DailyQuestList from "./comps/DailyQuestList";
import Guides from "img/guides.jpg";
import dayjs from "dayjs";
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
import { ExclamationCircleOutlined } from "@ant-design/icons";
import NotConnectContainer from "./comps/NotConnectContainer";
import { useSelector } from "react-redux";
import { getQueryVariable } from "lib/url";
import { useMemo } from "react";

export default function PioneerPoints() {
  const { npubNostrAccount } = useSelector(({ user }) => user);
  const nostrAccount = useMemo(() => {
    const queryNostrAddress = getQueryVariable("nostrAddress");
    return queryNostrAddress ? queryNostrAddress : npubNostrAccount;
  }, [npubNostrAccount]);
  return (
    <Container pageTitle="My Pioneer Points Summary">
      <div className="nostr-page-title__tip">
        <Tooltip
          placement="top"
          title={`The data is updated every 2 minutes. If there is a delay in updating the points, please refresh and check again later.`}
        >
          <span>Last updated: {dayjs.utc().format("HH:mm:ss")} (UTC) </span>
          <ExclamationCircleOutlined />
        </Tooltip>
      </div>
      <UserPointerInfo npubNostrAccount={nostrAccount} />

      {!nostrAccount ? (
        <NotConnectContainer />
      ) : (
        <>
          <div
            className="tester-quest-tips"
            style={{ background: `#10FFC0 url(${Guides})` }}
          >
            {/* <img src={Guides} style={{ maxWidth: "100%", borderRadius: "20px" }} alt="" /> */}
            <div className="tester-quest-tips-text">
              <span>Tester Quest Tips & Guides</span>
              <a
                href="https://doc.nostrassets.com/user-guides-testnet/tester-quest-tips"
                target="_blank"
              >
                Learn More
              </a>
            </div>
          </div>
          <QuestList npubNostrAccount={nostrAccount} />
          <DailyQuestList npubNostrAccount={nostrAccount} />
        </>
      )}
    </Container>
  );
}
