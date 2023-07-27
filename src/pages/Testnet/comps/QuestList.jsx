import { List, Typography } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import {
  usePointsTask,
  usePointsTaskQuests,
} from "hooks/graphQuery/useTestnet";
import { useMemo, useEffect } from "react";
import { ReactComponent as Success } from "img/success.svg";
export default function QuestList({ npubNostrAccount }) {
  const staticData = useMemo(() => {
    return [
      {
        label: "Register Nostr Account",
      },
      {
        label: "Follow TokenManager",
      },
      {
        label: "Follow MarketManager",
      },
      {
        label: "Follow NostrAssets Nostr account",
      },
      {
        label:
          "Approve Market Manager as Operator with at least 1000 Testnet USDT or other tokens",
      },
      {
        label: "Query address book",
      },
    ];
  }, []);
  const nostrAddress = useMemo(() => {
    if (npubNostrAccount) {
      return nip19.decode(npubNostrAccount).data;
    } else {
      return false;
    }
  }, [npubNostrAccount]);
  const { data, fetching } = usePointsTask();
  const { data: userData, reexcuteQuery } = usePointsTaskQuests({
    address: nostrAddress,
  });
  useEffect(() => {
    setInterval(() => {
      reexcuteQuery();
    }, 30000);
    return () => null;
  }, [reexcuteQuery]);
  const questsData = useMemo(() => {
    return staticData.map((item) => {
      const row = userData.find((k) => k.task_type === item.label);
      const graphRow = data.find((j) => item.label.indexOf(j.task_type) > -1);
      if (row) {
        return {
          ...graphRow,
          task_type: item.label,
          user_reward_points: row.reward_points,
        };
      } else {
        return graphRow
          ? { ...graphRow, task_type: item.label }
          : { ...item, task_type: item.label };
      }
    });
  }, [staticData, data, userData]);
  //

  return (
    <>
      <div className="nostr-group-info">
        <div className="nostr-testnet-list-header">One-time Tester Quests</div>
        <List
          className="nostr-testnet-list"
          bordered={false}
          loading={fetching}
          dataSource={questsData}
          renderItem={(item) => {
            let rewardPoint = item.reward_points;
            if (item.halve_time && item.reward_halve_points) {
              if (Date.now() > new Date(item.halve_time).getTime()) {
                rewardPoint = item.reward_halve_points;
              }
            }
            return (
              <List.Item className="nostr-list-item">
                <span className="nostr-list-item-label">{item.task_type}</span>
                <span className="nostr-list-item-point">+{rewardPoint}</span>
                <span className="nostr-list-item-isfinished">
                  {item.user_reward_points ? (
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
      </div>
    </>
  );
}
