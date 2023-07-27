import SEO from "components/Common/SEO";
import Footer from "components/Footer/Footer";
import { getPageTitle } from "lib/legacy";
import "./PageNotFound.css";
import { Trans } from "@lingui/macro";

import { useHistory } from "react-router-dom";
function PageNotFound() {
  const history = useHistory();
  const historyGo = (url) => {
    history.push(url);
  };
  return (
    // <SEO title={getPageTitle("Page not found")}>
    <div className="page-layout">
      <div className="page-not-found-container">
        <div className="page-not-found">
          <h2>
            <Trans>Page not found</Trans>
          </h2>
          <p className="go-back">
            <Trans>
              <span>Return to </span>
              {/* <a href={homeUrl}>Homepage</a> <span>or </span> <a href={tradePageUrl}>Trade</a> */}
              <span className="history-go" onClick={() => historyGo("/explore")}>
                Homepage
              </span>
            </Trans>
          </p>
        </div>
      </div>
      {/* <Footer /> */}
    </div>
    // </SEO>
  );
}

export default PageNotFound;
