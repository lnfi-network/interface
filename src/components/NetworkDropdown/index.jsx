import React, { useCallback, useMemo } from "react";
import { Dropdown } from "antd";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { getIcon } from "config/icons";
import { t, Trans } from "@lingui/macro";
import language24Icon from "img/ic_language24.svg";
import "./NetworkDropdown.scss";
import "./index.scss";
import { useDispatch } from "react-redux";
import { setLanguageModalVisible } from "store/reducer/modalReducer";
import { WarningOutlined } from "@ant-design/icons";
import classNames from "classnames";
export default function NetworkDropdown() {
  const { chain, chains } = useNetwork();
  const {
    error,
    isLoading,
    pendingChainId,
    switchNetwork,
  } = useSwitchNetwork();
  const dispatch = useDispatch();
  const items = useMemo(() => {
    let retChains = [];
    retChains = chains.map((chainItem) => {
      const icon = getIcon(chainItem.id, "network");
      return {
        key: chainItem.id,
        label: (
          <span
            className={classNames("network-dropdown-chain-name", {
              "network-dropdown-chain-name__active": chainItem.id === chain?.id,
            })}
          >
            {chainItem.name}
          </span>
        ),
        icon: (
          <img
            className="network-dropdown-icon"
            src={icon}
            alt={chainItem.name}
          />
        ),
      };
    });
    if (chains && chains.length > 0) {
      retChains = retChains.concat([
        {
          type: "divider",
        },
      ]);
    }
    retChains = retChains.concat([
      {
        key: "switchLanguage",
        label: t`Language`,
        icon: (
          <img
            className="network-dropdown-icon"
            src={language24Icon}
            alt={t`Language`}
          />
        ),
      },
    ]);
    return retChains;
  }, [chain?.id, chains]);

  const handleMenuClick = useCallback(
    (item) => {
      if (item.key === "switchLanguage") {
        dispatch(setLanguageModalVisible(true));
      } else {
        const checkedChainId = Number(item.key);
        switchNetwork(checkedChainId);
      }
    },
    [dispatch, switchNetwork]
  );
  const menuProps = {
    items,
    onClick: handleMenuClick,
  };
  const selectedChainIcon = useMemo(() => {
    let icon = null;
    if (chain) {
      icon = getIcon(chain.id, "network");
    } else {
      icon = getIcon(10, "network");
    }
    return (
      <>
        {chain?.unsupported ? (
          <WarningOutlined style={{ color: "#f6465d" }} />
        ) : (
          <img className="network-dropdown-icon" src={icon} alt={chain?.name} />
        )}
      </>
    );
  }, [chain]);
  return (
    <>
      <Dropdown.Button
        className="nostr-network-dropdown App-header-network"
        overlayClassName="nostr-network-list"
        menu={menuProps}
        loading={isLoading}
        onClick={() => { }}
      >
        {selectedChainIcon}
      </Dropdown.Button>
    </>
  );
}
