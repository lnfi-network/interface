import "./index.scss";
import { useDeepCompareEffect } from "ahooks";
import { LeftOutlined } from "@ant-design/icons";
import { useHistory, useParams } from "react-router-dom";
import { useQueryBalance } from "hooks/useNostrMarket";
import { useSelector, useDispatch } from "react-redux";
import { Button, Popover, Input, Spin, Empty, Tooltip, Image, Modal, Pagination } from "antd";
import { useMintAssetDetailQuery } from "hooks/graphQuery/useExplore";
import { useCallback, useMemo, useState } from "react";
// import ImportModal from "./comps/ImportModal";
// import SyncImportModal from "./comps/SyncImportModal";
import EllipsisMiddle from "components/EllipsisMiddle";
import { limitDecimals, numberWithCommas } from "lib/numbers";
// import { useImportAsset, useHandleQueryTokenList } from "hooks/useNostrMarket";
import tapdLogo from "img/tapd-logo.jpg";
import CheckNostrButton from "components/CheckNostrButton";
import { setAboutModalVisible } from "store/reducer/modalReducer";
import { ShareAltOutlined, CloseCircleOutlined, SwapOutlined } from "@ant-design/icons";
import { nip19 } from "nostr-tools";
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
  const params = useParams();

  const { data, fetching, reexcuteQuery } = useMintAssetDetailQuery({
    id: params?.id
  });

  const token = useMemo(() => {
    return tokenList?.find((item) => item.name == data?.token_name);
  }, [data?.token_name, tokenList]);
  const handleBack = useCallback(() => {
    history.push("/mintassets/mint-assets");
  }, [history]);
  const progress = useMemo(() => {
    const progress = limitDecimals((data?.received_amount / data?.max_amount) * 100, 2, "floor")
    return `${progress || 0}%`;
  }, [data?.max_amount, data?.received_amount])
  
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
          <Spin spinning={fetching}>
            <div className="mint-detail-content-section">
              <div className="mint-detail-content-head">
                <div className="mint-detail-content-head-name">
                  <Image
                    width={36}
                    height={36}
                    style={{ borderRadius: "20px" }}
                    preview={false}
                    src={"rrr"}
                    fallback="data:image/png;base64,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"
                  />
                  <span style={{ marginLeft: "8px" }} className="f18 b">
                    {"MeMe"}
                  </span>
                </div>
                <div className="mint-detail-content-head-title f18 b">Mint Progress</div>
                <Popover
                  placement="bottom"
                  content={
                    <>
                      <TelegramShareButton url={"http://localhost:3011/#/mint"} quote={"hahahha"}>
                        <TelegramIcon size={32} style={{ marginRight: "10px" }} round={true}></TelegramIcon>
                      </TelegramShareButton>
                      <TwitterShareButton url={"http://localhost:3011/#/mint"} quote={"hahahha"}>
                        <TwitterIcon size={32} style={{ marginRight: "10px" }} round={true}></TwitterIcon>
                      </TwitterShareButton>
                    </>
                  }
                  title=""
                >
                  <ShareAltOutlined className="share" style={{ fontSize: "26px" }} />
                </Popover>
              </div>
              <div className="mint-detail-content-progress">
                <div className="progress-all">
                  <div className="progress-percent" style={{ width: progress }}></div>
                  <div className="progress-percent-text" style={{ left: progress }}>
                    {progress} <span className="color-yellow">{data?.received_number ? `${numberWithCommas(data?.received_number)} Minters` : "0 Minters"}</span>
                  </div>
                </div>
                <div className="tc mt10">
                  Total Minted / Maximum Mint Amount{" "}
                  <span className="color-yellow b f16">
                    {data?.received_amount ? numberWithCommas(data?.received_amount) : "0"}
                  </span>
                  /{data?.single_amount ? numberWithCommas(data?.max_amount) : "0"}
                </div>
              </div>
              <div className="mint-detail-content-mintbtn">
                <CheckNostrButton>
                  <Button
                    type="primary"
                    // onClick={() => setType("In-Progress")}
                    style={{ width: "160px" }}
                    size="large"
                  >{`Mint Asset`}</Button>
                </CheckNostrButton>
              </div>
            </div>
          </Spin>
          {/* <div className="mint-detail-content-title">
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
                      <TelegramIcon size={32} style={{ marginRight: "10px" }} round={true}></TelegramIcon>
                    </TelegramShareButton>
                    <TwitterShareButton url={"http://localhost:3011/#/mint"} quote={"hahahha"}>
                      <TwitterIcon size={32} style={{ marginRight: "10px" }} round={true}></TwitterIcon>
                    </TwitterShareButton>
                  </>
                }
                title=""
              >
                <ShareAltOutlined className="share" style={{ fontSize: "26px" }} />
              </Popover>
            </div>
          </div> */}
          <Spin spinning={fetching}>
            <div className="mint-detail-content-section">
              <div className="b f18 color-light" style={{ padding: "20px 160px" }}>
                Asset Detail
              </div>
              <div className="mint-detail-item">
                <div className="mint-detail-item-key">Asset Name</div>
                <div className="mint-detail-item-value">{data?.token_name || "--"}</div>
              </div>
              <div className="mint-detail-item">
                <div className="mint-detail-item-key">Asset Symbol</div>
                <div className="mint-detail-item-value">{token?.symbol || "--"}</div>
              </div>
              <div className="mint-detail-item">
                <div className="mint-detail-item-key">Asset ID</div>
                <div className="mint-detail-item-value">
                  {token?.token ? <EllipsisMiddle suffixCount={12}>{token?.token}</EllipsisMiddle> : "--"}
                </div>
              </div>
              <div className="mint-detail-item">
                <div className="mint-detail-item-key">Asset TX</div>
                <div className="mint-detail-item-value">{data?.create_tx_hash || "--"}</div>
              </div>
              <div className="mint-detail-item">
                <div className="mint-detail-item-key">Total Supply</div>
                <div className="mint-detail-item-value">
                  {token?.totalSupply ? numberWithCommas(token?.totalSupply) : "--"}
                </div>
              </div>
              {/* <div className="mint-detail-item">
              <div className="mint-detail-item-key">Total minted</div>
              <div className="mint-detail-item-value">3299313hshssgsgsg8832839933003003030</div>
            </div> */}
              <div className="mint-detail-item">
                <div className="mint-detail-item-key">Token Deploy Decimal</div>
                <div className="mint-detail-item-value">{token?.decimals}</div>
              </div>
              <div className="mint-detail-item">
                <div className="mint-detail-item-key">Token Display Decimal</div>
                <div className="mint-detail-item-value">{token?.reserve}</div>
              </div>
              <div className="mint-detail-item">
                <div className="mint-detail-item-key">Deployer Address</div>
                <div className="mint-detail-item-value">
                  {data?.owner ? (
                    <EllipsisMiddle suffixCount={12}>{nip19.npubEncode(data?.owner)}</EllipsisMiddle>
                  ) : (
                    "--"
                  )}
                </div>
              </div>
              <div className="mint-detail-item">
                <div className="mint-detail-item-key">Description</div>
                <div className="mint-detail-item-value">{data?.description || "--"}</div>
              </div>
              <div className="mint-detail-item">
                <div className="mint-detail-item-key">Logo url</div>
                <div className="mint-detail-item-value">{data?.logo || "--"}</div>
              </div>
              <div className="mint-detail-item-title f18 color-light">Social Media</div>
              <div className="mint-detail-item">
                <div className="mint-detail-item-key">Twitter ID</div>
                <div className="mint-detail-item-value">{data?.twitter || "--"}</div>
              </div>
              <div className="mint-detail-item">
                <div className="mint-detail-item-key">Telegram ID</div>
                <div className="mint-detail-item-value">{data?.telegram || "--"}</div>
              </div>
              <div className="mint-detail-item">
                <div className="mint-detail-item-key">Discord ID</div>
                <div className="mint-detail-item-value">{data?.discord || "--"}</div>
              </div>
              <div className="mint-detail-item">
                <div className="mint-detail-item-key">Nostr ID</div>
                <div className="mint-detail-item-value">{data?.nostr || "--"}</div>
              </div>
              <div className="mint-detail-item-title f18 color-light">Mint Rules</div>
              <div className="mint-detail-item">
                <div className="mint-detail-item-key">Maximum Mint Amount</div>
                <div className="mint-detail-item-value">
                  {data?.max_amount ? numberWithCommas(data?.max_amount) : "--"}
                </div>
              </div>
              <div className="mint-detail-item">
                <div className="mint-detail-item-key">Single mint upper limit</div>
                <div className="mint-detail-item-value">
                  {data?.single_amount ? numberWithCommas(data?.single_amount) : "--"}
                </div>
              </div>
              <div className="mint-detail-item">
                <div className="mint-detail-item-key">Maximum mint per address</div>
                <div className="mint-detail-item-value">
                  {data?.max_address ? numberWithCommas(data?.max_address) : "--"}
                </div>
              </div>
              <div className="mint-detail-item">
                <div className="mint-detail-item-key">Mint Fee Rate</div>
                <div className="mint-detail-item-value">
                  {data?.create_fee ? numberWithCommas(data?.create_fee) : "--"}
                </div>
              </div>
            </div>
          </Spin>
        </div>
      </div>
    </>
  );
}
