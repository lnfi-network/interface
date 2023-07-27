import React from "react";
import { Tabs } from "antd";
import "./index.scss";
export default function UniftTabs({ ...props }) {
  const size = props.size ? props.size : "middle";
  const defaultActiveKey = props.defaultActiveKey || "1";
  const items = new Array(2).fill(null).map((_, i) => {
    const id = String(i + 1);
    return {
      label: `Tab ${id}`,
      key: id,
      children: `Content of tab ${id}`,
    };
  });
  const dataItems = props.items || items;
  return (
    <>
      <Tabs
        className="unift-tabs"
        defaultActiveKey={defaultActiveKey}
        size={size}
        // type="card"
        items={dataItems}
        {...props}
      />
    </>
  );
}
