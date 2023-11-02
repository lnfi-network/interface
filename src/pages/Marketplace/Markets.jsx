import "./index.scss";
import { useCallback, useState, useEffect, useMemo, useRef } from "react";

import { Spin, Table, Select, Pagination, Input, Collapse, Button, Row, Col, Form, message } from "antd";
import { t } from "@lingui/macro";
import * as dayjs from "dayjs";
const { Panel } = Collapse;
import EllipsisMiddle from "components/EllipsisMiddle";
// import ExploreDetails from "../Explore/comps/ExploreDetails";
import { useMyOrderQuery } from "hooks/graphQuery/useExplore";
import { limitDecimals, numberWithCommas, padDecimals } from "lib/numbers";
import { useSelector } from "react-redux";
import useGetNostrAccount from "hooks/useGetNostrAccount";
import { nip19 } from "nostr-tools";
import { useCancelOrder } from "hooks/useNostrMarket";
import BigNumber from "bignumber.js";
import { utcToClient } from "lib/dates";
import { QUOTE_ASSET } from "config/constants";
import { convertDollars } from "lib/utils/index";
import { useTokenChangeQuery } from "hooks/graphQuery/useExplore";
import useDevice from "hooks/useDevice";
import ECharts from "components/Echarts";
import { set } from "lodash";
export default function Markers() {
  const device = useDevice();
  let echartsRef = useRef();
  const { list, fetching, reexcuteQuery } = useTokenChangeQuery({});
  const [search, setSearch] = useState("");
  const [echatsOption, setEchatsOption] = useState({});
  useEffect(() => {
    setEchatsOption({
      color: ["#80FFA5"],
      title: {
        text: ""
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          label: {
            backgroundColor: "#6a7985"
          }
        }
      },
      legend: {
        data: []
      },
      toolbox: {
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true
      },
      xAxis: [
        {
          type: "category",
          boundaryGap: false,
          splitLine: {
            show: false
          },
          data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        }
      ],
      yAxis: [
        {
          type: "value",
          splitLine: {
            show: false
          }
        }
      ],
      series: [
        {
          name: "Line 1",
          type: "line",
          stack: "Total",
          smooth: true,
          lineStyle: {
            width: 0
          },
          showSymbol: false,
          areaStyle: {
            opacity: 0.8,
            color: new echartsRef.current.echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: "rgb(128, 255, 165)"
              },
              {
                offset: 1,
                color: "rgb(1, 191, 236)"
              }
            ])
          },
          emphasis: {
            focus: "series"
          },
          data: [140, 232, 101, 264, 90, 340, 250]
        }
      ]
    });
  }, []);
  const searchChange = useCallback((e) => {
    // console.log("value", value);
    setSearch(e.target.value);
  }, []);
  const tokens = useMemo(() => {
    return list?.filter((item) => item.name !== QUOTE_ASSET);
  }, [list]);
  return (
    <>
      <div className="marketplace-markets">
        <div className="marketplace-list-token">
          <div>
            <Input
              onChange={searchChange}
              style={{ width: "500px", maxWidth: "100%" }}
              size={device.isMobile ? "middle" : "large"}
              placeholder="Search by asset ID or Asset name"
            />
          </div>
          <div className="marketplace-token-list">
            <div className="token-item cur">
              <span className="f16 b">TREAT</span>
              <span>360sat ≈ $0.15</span>
              <span>192.45%</span>
            </div>
            <div className="token-item">
              <span className="f16 b">TREAT</span>
              <span>360sat ≈ $0.15</span>
              <span>192.45%</span>
            </div>
            <div className="token-item">
              <span className="f16 b">TREAT</span>
              <span>360sat ≈ $0.15</span>
              <span>192.45%</span>
            </div>
          </div>
        </div>
        <div className="marketplace-content-token">
          <div className="marketplace-content-section">
            <span className="f18 b color-light">TREAT</span>
            <span className="ml10">360sat ≈ $0.15</span>
            <span className="ml10">192.45%</span>
            <span className="ml30  color-light">24H Volume</span>
            <span className="ml5">923,928,332 sats</span>
          </div>
          <div className="marketplace-content-section">
            <span className="color-light">Asset ID</span>
            <span className="ml5">8822112....93282332</span>
            <span className="ml30 color-light">TX ID</span>
            <span className="ml5">38373sw….rrw9232</span>
          </div>
          <div style={{ width: "100%", height: "500px" }}>
            <ECharts refs={echartsRef} option={echatsOption}></ECharts>
          </div>
        </div>
      </div>
    </>
  );
}
