import "./index.scss";
import { LeftOutlined } from "@ant-design/icons";
import { useHistory } from "react-router-dom";
import { useQueryBalance } from "hooks/useNostrMarket";
import { useSelector, useDispatch } from "react-redux";
import { Button, Popover, Input, Spin, Empty, Tooltip, Image, Modal, Pagination } from "antd";
import { useImportAssetsQuery } from "hooks/graphQuery/useExplore";
import { useCallback, useMemo, useState } from "react";
// import ImportModal from "./comps/ImportModal";
// import SyncImportModal from "./comps/SyncImportModal";
import EllipsisMiddle from "components/EllipsisMiddle";
// import { useImportAsset, useHandleQueryTokenList } from "hooks/useNostrMarket";
import tapdLogo from "img/tapd-logo.jpg";
import CheckNostrButton from "components/CheckNostrButton";
import { setAboutModalVisible } from "store/reducer/modalReducer";
import { ShareAltOutlined, CloseCircleOutlined, SwapOutlined } from "@ant-design/icons";
import {
  EmailShareButton,
  FacebookShareButton,
  HatenaShareButton,
  InstapaperShareButton,
  LineShareButton,
  LinkedinShareButton,
  LivejournalShareButton,
  MailruShareButton,
  OKShareButton,
  PinterestShareButton,
  PocketShareButton,
  RedditShareButton,
  TelegramShareButton,
  TumblrShareButton,
  TwitterShareButton,
  ViberShareButton,
  VKShareButton,
  WhatsappShareButton,
  WorkplaceShareButton
} from "react-share";
import {
  EmailIcon,
  FacebookIcon,
  FacebookMessengerIcon,
  HatenaIcon,
  InstapaperIcon,
  LineIcon,
  LinkedinIcon,
  LivejournalIcon,
  MailruIcon,
  OKIcon,
  PinterestIcon,
  PocketIcon,
  RedditIcon,
  TelegramIcon,
  TumblrIcon,
  TwitterIcon,
  ViberIcon,
  VKIcon,
  WeiboIcon,
  WhatsappIcon,
  WorkplaceIcon
} from "react-share";
import useDevice from "hooks/useDevice";
const assetsTypeMap = {
  0: "Token",
  1: "NFT"
};
export default function MintDetail() {
  const history = useHistory();
  const dispatch = useDispatch();
  const device = useDevice();
  const { tokenList } = useSelector(({ market }) => market);
  const [open, setOpen] = useState(false);
  const [syncOpen, setSyncOpen] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [pageIndex, setPageIndex] = useState(1);
  const [assetId, setAssetId] = useState("");
  const [curAsset, setCurAsset] = useState(null);
  const [importingOpen, setImportingOpen] = useState(false);
  const [importingMap, setImportingMap] = useState({
    type: "success",
    content:
      "Great! You just imported a Taproot Asset to NostrAssets. You can return to Asset List to manage your asset now."
  });
  const { list, fetching, total, reexcuteQuery } = useImportAssetsQuery({
    pageSize: pageSize,
    pageIndex: pageIndex,
    assetId
  });
  const handleBack = useCallback(() => {
    history.push("/mint");
  }, [history]);
  return (
    <>
      <div className="mint-detail-container">
        <div
          className="mint-detail-back OpenSans"
          onClick={() => {
            handleBack();
          }}
        >
          <LeftOutlined className="pointer" />
          <span className="mint-detail-back__value"> Back</span>
        </div>
        <div className="mint-detail-content">
          <div className="mint-detail-content-title">
            Asset Detail
            <div className="mint-detail-content-title-btns">
              <Button type="primary" size="middle">
                Mint Asset
              </Button>
              <Popover
                placement="bottom"
                content={
                  <>
                    <TelegramShareButton url={"http://localhost:3011/#/mint"} quote={"hahahha"}>
                      <TelegramIcon size={32} style={{marginRight: "10px"}} round={true}></TelegramIcon>
                    </TelegramShareButton>
                    <TwitterShareButton url={"http://localhost:3011/#/mint"} quote={"hahahha"}>
                      <TwitterIcon size={32} style={{marginRight: "10px"}} round={true}></TwitterIcon>
                    </TwitterShareButton>
                  </>
                }
                title=""
              >
                <ShareAltOutlined className="share" style={{ fontSize: "26px" }} />
              </Popover>
            </div>
          </div>
          <div className="mint-detail-item">
            <div className="mint-detail-item-key">Asset Name</div>
            <div className="mint-detail-item-value">3299313hshssgsgsg8832839933003003030</div>
          </div>
          <div className="mint-detail-item">
            <div className="mint-detail-item-key">Asset Symbol</div>
            <div className="mint-detail-item-value">3299313hshssgsgsg8832839933003003030</div>
          </div>
          <div className="mint-detail-item">
            <div className="mint-detail-item-key">Asset ID</div>
            <div className="mint-detail-item-value">3299313hshssgsgsg8832839933003003030</div>
          </div>
          <div className="mint-detail-item">
            <div className="mint-detail-item-key">Asset TX</div>
            <div className="mint-detail-item-value">3299313hshssgsgsg8832839933003003030</div>
          </div>
          <div className="mint-detail-item">
            <div className="mint-detail-item-key">Total Supply</div>
            <div className="mint-detail-item-value">3299313hshssgsgsg8832839933003003030</div>
          </div>
          <div className="mint-detail-item">
            <div className="mint-detail-item-key">Total minted</div>
            <div className="mint-detail-item-value">3299313hshssgsgsg8832839933003003030</div>
          </div>
          <div className="mint-detail-item">
            <div className="mint-detail-item-key">Token Deploy Decimal</div>
            <div className="mint-detail-item-value">3299313hshssgsgsg8832839933003003030</div>
          </div>
          <div className="mint-detail-item">
            <div className="mint-detail-item-key">Token Display Decimal</div>
            <div className="mint-detail-item-value">3299313hshssgsgsg8832839933003003030</div>
          </div>
          <div className="mint-detail-item">
            <div className="mint-detail-item-key">Deployer Address</div>
            <div className="mint-detail-item-value">3299313hshssgsgsg8832839933003003030</div>
          </div>
          <div className="mint-detail-item">
            <div className="mint-detail-item-key">Description</div>
            <div className="mint-detail-item-value">3299313hshssgsgsg8832839933003003030</div>
          </div>
          <div className="mint-detail-item">
            <div className="mint-detail-item-key">Logo url</div>
            <div className="mint-detail-item-value">3299313hshssgsgsg8832839933003003030</div>
          </div>
          <div className="mint-detail-item-title f18 color-light">Social Media</div>
          <div className="mint-detail-item">
            <div className="mint-detail-item-key">Twitter ID</div>
            <div className="mint-detail-item-value">3299313hshssgsgsg8832839933003003030</div>
          </div>
          <div className="mint-detail-item">
            <div className="mint-detail-item-key">Telegram ID</div>
            <div className="mint-detail-item-value">3299313hshssgsgsg8832839933003003030</div>
          </div>
          <div className="mint-detail-item">
            <div className="mint-detail-item-key">Discord ID</div>
            <div className="mint-detail-item-value">3299313hshssgsgsg8832839933003003030</div>
          </div>
          <div className="mint-detail-item">
            <div className="mint-detail-item-key">Nostr ID</div>
            <div className="mint-detail-item-value">3299313hshssgsgsg8832839933003003030</div>
          </div>
          <div className="mint-detail-item-title f18 color-light">Mint Rules</div>
          <div className="mint-detail-item">
            <div className="mint-detail-item-key">Single mint upper limit</div>
            <div className="mint-detail-item-value">3299313hshssgsgsg8832839933003003030</div>
          </div>
          <div className="mint-detail-item">
            <div className="mint-detail-item-key">Maximum mint per address</div>
            <div className="mint-detail-item-value">3299313hshssgsgsg8832839933003003030</div>
          </div>
        </div>
      </div>
    </>
  );
}
