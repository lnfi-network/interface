import { t, Trans } from "@lingui/macro";
import { Button, Dropdown, Typography, Row } from "antd";
import {
  CopyOutlined,
  DisconnectOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { shortenAddress } from "lib/legacy";
import { FaChevronDown } from "react-icons/fa";
import { useCallback, useRef, useMemo, memo } from "react";
import "./AddressDropdown.scss";
import { initNostrAccount } from "store/reducer/userReducer";
import { useSelector, useDispatch } from "react-redux";
import { nip19 } from "nostr-tools";
import * as Lockr from "lockr";
import { useQueryBalance, useMode } from "hooks/useNostrMarket";
import { isInTokenPocket } from "lib/utils/userAgent";
import { useAsyncEffect } from "ahooks";
import { useNostr } from "lib/nostr-react";
const { Text } = Typography;
function AddressNostrDropdown() {
  const { connectedRelays } = useNostr();
  const { nostrAccount, balanceList, proMode } = useSelector(
    ({ user }) => user
  );
  const queryBalanceRef = useRef(null);
  const queryModeRef = useRef(null);
  const { handleQueryBalance } = useQueryBalance();
  const { handleQueryMode } = useMode();
  const npubNostrAccount = useMemo(() => {
    return nostrAccount ? nip19.npubEncode(nostrAccount) : "";
  }, [nostrAccount]);
  const isRelayConnected = useMemo(() => {
    const relay = connectedRelays.find((r) => r.url.indexOf("nostr") > -1);
    if (relay) {
      return true;
    }
    return false;
  }, [connectedRelays]);
  const dispatch = useDispatch();
  const handleDisconnect = useCallback(() => {
    dispatch(initNostrAccount(""));
    Lockr.set("nostrAccount", "");
  }, [dispatch]);

  const items = useMemo(() => {
    const _items = [
      {
        key: "menu-copy-address",
        label: (
          <Text
            copyable={{
              icon: [
                <span className="menu-copy-address-item">
                  <CopyOutlined />
                  <span className="menu-copy-address-item__text">
                    Copy Address
                  </span>
                </span>,
                <span className="menu-copy-address-item">
                  <CheckOutlined />
                  <span className="menu-copy-address-item__text">
                    Copy Address
                  </span>
                </span>,
              ],

              text: npubNostrAccount,
              tooltips: false,
            }}
          />
        ),
      },
    ];
    !isInTokenPocket() &&
      _items.push({
        key: "menu-disconnect",
        label: (
          <div
            onClick={handleDisconnect}
            className="user-address-dropdown-item"
          >
            <DisconnectOutlined />
            <div className="user-address-dropdown-item-text">
              <Trans>Disconnect</Trans>
            </div>
          </div>
        ),
      });
    return _items;
  }, [handleDisconnect, npubNostrAccount]);

  useAsyncEffect(async () => {
    if (
      !queryBalanceRef.current &&
      JSON.stringify(balanceList) == "{}" &&
      isRelayConnected &&
      npubNostrAccount
    ) {
      queryBalanceRef.current = true;
      await handleQueryBalance(npubNostrAccount);
      queryBalanceRef.current = false;
    }
    return () => {
      queryBalanceRef.current = false;
    };
  }, [handleQueryBalance, npubNostrAccount, isRelayConnected]);

  useAsyncEffect(async () => {
    if (npubNostrAccount && isRelayConnected && !proMode.hasInit) {
      queryModeRef.current = true;
      await handleQueryMode(npubNostrAccount);
      queryModeRef.current = false;
    }
    return () => {
      queryModeRef.current = false;
    };
  }, [npubNostrAccount, isRelayConnected, proMode.hasInit]);

  return (
    <>
      <Dropdown
        className="nostr-address-dropdown"
        overlayClassName="nostr-address-dropdown-items"
        menu={{
          items,
        }}
        placement="bottom"
        trigger="click"
      >
        <Button className="address-btn">
          <span className="nostr-address">
            {shortenAddress(npubNostrAccount, 16)}
          </span>
          <FaChevronDown />
        </Button>
      </Dropdown>
    </>
  );
}

export default memo(AddressNostrDropdown);
