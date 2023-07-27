import React, { useCallback, useEffect, memo, useMemo } from "react";

import "./Header.scss";

import ConnectNostr from "components/Common/ConnectNostr";

import { useSelector, useDispatch } from "react-redux";
import AddressNostrDropdown from "components/AddressDropdown/AddressNostrDropdown";
function AppNostrHeaderUser() {
  const { nostrAccount } = useSelector(({ user }) => user);
  const memoAddressNostrDropdown = useMemo(() => {
    return <AddressNostrDropdown />;
  }, []);
  if (!nostrAccount) {
    return (
      <div className="App-header-user">
        {
          <>
            <ConnectNostr />
          </>
        }
      </div>
    );
  }

  return (
    <div className="App-header-user">
      {
        <>
          <div className="App-header-user-address">
            {memoAddressNostrDropdown}
          </div>

          {/* <NetworkDropdown /> */}
        </>
      }
    </div>
  );
}
export default memo(AppNostrHeaderUser);
