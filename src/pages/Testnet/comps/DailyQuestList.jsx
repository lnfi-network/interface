import { List, Radio, Space } from "antd";
import {
  CheckOutlined,
  CalendarOutlined,
  RightOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
import classNames from "classnames";
import { useCallback, useEffect, useState, useMemo } from "react";
import {
  usePointsTaskDay,
  usePointsTaskDayQuests,
} from "hooks/graphQuery/useTestnet";
import { useSize } from "ahooks";
import { ReactComponent as Success } from "img/success.svg";
import { nip19 } from "nostr-tools";
const getSevenDateArrayFromToday = () => {
  const dateArray = [];
  for (let i = 0; i < 5; i++) {
    const now = new Date("2023-07-03").getTime();
    dateArray.push({
      timeStamp: dayjs(now).add(i, "day").format("YYYY-MM-DD"),
      date: dayjs(now).add(i, "day").format("D MMM"),
    });
  }
  return dateArray;
};
const dateArrayOf5Days = getSevenDateArrayFromToday();
export default function DailyQuestList({ npubNostrAccount }) {
  const staticData = useMemo(() => {
    return [
      {
        label: "Use Help",
      },
      {
        label: "Retrieve token list",
      },
      {
        label: "Check account balance",
      },
      {
        label: "Transfer token to another 5 address",
      },
      {
        label: "Add 3 names and accounts in address book",
      },
      // {
      //   label: "Check deposit",
      // },
      {
        label: "Check status of NostrAssets Marketplace",
      },
      {
        label: "Place 5 limit orders",
      },
      {
        label: "Check order’s status",
      },
      {
        label: "Take 5 orders",
      },
      {
        label: "Cancel 1 order",
      },
      {
        label: "Make 5 New Buy Listing of different tokens(Marketplace)",
      },
      {
        label: "Make 5 New Sell Listing of different tokens(Marketplace)",
      },
      {
        label: "Cancel 1 Listing(Marketplace)",
      },
      {
        label: "Buy 5 orders(Marketplace)",
      },
      {
        label: "Sell 5 orders(Marketplace)",
      },
      {
        label: "Transfer tokens to another 5 address(Account)",
        label1: "Web Transfer tokens to another 5 addresses",
      },
    ];
  }, []);

  const [dateArray, _] = useState(dateArrayOf5Days);
  const { width } = useSize(document.querySelector("body"));
  // const [selectedTime, setSelectedTime] = useState(null);;
  const [selectedTime, setSelectedTime] = useState(
    dateArray.some((item) => item.timeStamp == dayjs.utc().format("YYYY-MM-DD"))
      ? dayjs.utc().format("YYYY-MM-DD")
      : new Date().getTime() >
        new Date(dateArray[dateArray.length - 1]?.timeStamp).getTime()
        ? dateArray[dateArray.length - 1]?.timeStamp
        : dateArray[0]?.timeStamp
  );
  const nostrAddress = useMemo(() => {
    if (npubNostrAccount) {
      return nip19.decode(npubNostrAccount).data;
    } else {
      return false;
    }
  }, [npubNostrAccount]);
  const { data, fetching } = usePointsTaskDay();
  const { data: userData, reexcuteQuery } = usePointsTaskDayQuests({
    address: nostrAddress,
    selectedTime,
  });
  useEffect(() => {
    setInterval(() => {
      reexcuteQuery();
    }, 30000);
    return () => null;
  }, [reexcuteQuery]);
  const dailyQuestsData = useMemo(() => {
    // const newData = staticData.map(item => )
    return staticData.map((item) => {
      const graphRow = data.find(
        (j) =>
          item.label.indexOf(j.task_type) > -1 ||
          item?.label1?.indexOf(j.task_type) > -1
      );
      const row = userData.find(
        (k) =>
          item.label.indexOf(k.task_type) > -1 ||
          item?.label1?.indexOf(k.task_type) > -1
      );
      if (graphRow && row) {
        return {
          ...graphRow,
          task_type: item.label,
          user_reward_points: row.reward_points,
          user_task_num: row.task_num,
        };
      } else {
        return graphRow
          ? { ...graphRow, task_type: item.label }
          : { ...item, task_type: item.label };
      }
    });
  }, [staticData, data, userData]);
  //
  const onDateChange = useCallback(({ target: { value } }) => {
    setSelectedTime(value);
  }, []);

  return (
    <>
      <div className="nostr-group-info">
        <div className="nostr-testnet-list-header">
          <CalendarOutlined /> Recurring Tester Quests
        </div>
        <div className="daily-radio-wrap">
          <Radio.Group
            className="daily-radio"
            size="small"
            value={selectedTime}
            buttonStyle="solid"
            onChange={onDateChange}
          >
            {width > 800 ? (
              <Space>
                {dateArray.map((item, index) => {
                  return (
                    <Radio.Button value={item.timeStamp} key={item.timeStamp}>
                      {item.date}
                    </Radio.Button>
                  );
                })}
              </Space>
            ) : (
              dateArray.map((item, index) => {
                return (
                  <Radio.Button value={item.timeStamp} key={item.timeStamp}>
                    {item.date}
                  </Radio.Button>
                );
              })
            )}
          </Radio.Group>
        </div>
        <List
          className="nostr-testnet-list"
          bordered={false}
          loading={fetching}
          dataSource={dailyQuestsData}
          renderItem={(item) => {
            let rewardPoint = item.reward_points;
            if (item.halve_time && item.reward_halve_points) {
              if (
                new Date(selectedTime + "T23:59:59").getTime() >
                new Date(item.halve_time).getTime()
              ) {
                rewardPoint = item.reward_halve_points;
              }
            }
            return (
              <List.Item className="nostr-list-item">
                <span className="nostr-list-item-label">{item.task_type}</span>
                <span className="nostr-list-item-point">+{rewardPoint}</span>
                {/* <span className="nostr-list-item-isfinished"> */}
                <span
                  className={classNames("nostr-list-item-isfinished", {
                    "color-green":
                      item?.user_task_num && item?.user_task_num > 0,
                  })}
                >
                  {item?.task_num > 1 ? (
                    `${item?.user_task_num || 0}/${item?.task_num}`
                  ) : item.user_reward_points ? (
                    <Success
                      width={40}
                      height={40}
                      style={{ color: "#0ecb81", fontSize: "20px" }}
                    />
                  ) : (
                    "--"
                  )}
                </span>
              </List.Item>
            );
          }}
        />
        {/* <div className="nostr-link">
          <a href="http://" target="_blank">
            Learn about Quest Guide <RightOutlined />
          </a>
        </div> */}
      </div>
    </>
  );
}
