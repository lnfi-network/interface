import React, { useState, useEffect, useCallback, lazy, Suspense, memo, useMemo } from "react";

import PageNotFound from "pages/PageNotFound/PageNotFound";

import { Header } from "components/Header/Header";
import WalletConnectModal from "components/Modals/WalletConnectModal";
import { Switch, Route, HashRouter as Router, Redirect } from "react-router-dom";
import ConnectNostrOnTPModal from "components/Modals/ConnectNostrOnTPModal";
import ConnectNostrModal from "components/Modals/ConnectNostrModal";
import TurnOnNostrDrawer from "components/Modals/TurnOnNostrDrawer";
import OnlyMobileSupportModal from "components/Modals/OnlyMobileSupportModal";
import SignatureValidErrorModal from "components/Modals/SignatureValidErrorModal";
import AboutModal from "components/Modals/AboutModal";
import { Spin } from "antd";
const Explore = lazy(() => import("pages/Explore/index"));
const Account = lazy(() => import("pages/Account/index"));
const Deposit = lazy(() => import("pages/Deposit/index"));
const Withdraw = lazy(() => import("pages/Withdraw/index"));
const ImportAssets = lazy(() => import("pages/ImportAssets/index"));
const Transfer = lazy(() => import("pages/Transfer/index"));
const Marketplace = lazy(() => import("pages/Marketplace/index"));
const Faucet = lazy(() => import("pages/Testnet/ClaimTestToken"));
const PioneerPoints = lazy(() => import("pages/Testnet/PioneerPoints"));
const Mint = lazy(() => import("pages/Mint/index"));
const MintDetail = lazy(() => import("pages/Mint/MintDetail"));
const MintCreate = lazy(() => import("pages/Mint/MintCreate"));
function Routes({ children }) {
  return (
    <>
      <div className="App">
        {children}
        <div className="App-content">
          <Header />
          <Suspense fallback={<Spin></Spin>}>
            <Switch>
              <Route exact path="/">
                <Redirect to="/account" />
              </Route>
              <Route path="/explore">
                <Explore />
              </Route>
              <Route exact path="/account">
                <Account />
              </Route>
              <Route exact path="/faucet">
                <Faucet />
              </Route>
              <Route exact path="/mint">
                <Mint />
              </Route>
              <Route exact path={["/mint/create", "/mint/create/:eventId"]}>
                <MintCreate />
              </Route>
              <Route exact path="/mint/detail/:eventId">
                <MintDetail />
              </Route>
              <Route exact path="/pioneer-points">
                <PioneerPoints />
              </Route>
              <Route exact path={["/receive", "/receive/:platform/:symbol"]}>
                <Deposit />
              </Route>
              <Route exact path={["/send", "/send/:platform/:symbol"]}>
                <Withdraw />
              </Route>
              <Route exact path={"/importAssets"}>
                <ImportAssets />
              </Route>
              <Route exact path="/transfer">
                <Transfer />
              </Route>
              <Route path="/marketplace">
                <Marketplace />
              </Route>
              <Route path="/account">
                <Account />
              </Route>

              <Route path="*">
                <PageNotFound />
              </Route>
            </Switch>
          </Suspense>
        </div>
      </div>
      <WalletConnectModal />
      <ConnectNostrOnTPModal />
      <ConnectNostrModal />
      <TurnOnNostrDrawer />
      <OnlyMobileSupportModal />
      <SignatureValidErrorModal />
      <AboutModal />
    </>
  );
}
export default memo(Routes);
