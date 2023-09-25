import "./index.scss";
import { LeftOutlined } from "@ant-design/icons";
import { useHistory } from "react-router-dom";
import { useQueryBalance } from "hooks/useNostrMarket";
import { useSelector } from "react-redux";
import { Button, Input, Spin, Empty, Tooltip, Image, Modal, Pagination } from "antd";
import { useImportAssetsQuery } from "hooks/graphQuery/useExplore";
import { useCallback, useMemo, useState } from "react";
import ImportModal from "./comps/ImportModal"
import EllipsisMiddle from "components/EllipsisMiddle";
import { useImportAsset, useHandleQueryTokenList } from "hooks/useNostrMarket";
import tapdLogo from "img/tapd-logo.jpg"
import CheckNostrButton from "components/CheckNostrButton";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SwapOutlined
} from '@ant-design/icons';
const assetsTypeMap = {
  0: "Token",
  1: "NFT"
}
function Transfer({ item }) {
  const [isHex, setIsHex] = useState(true)
  const handleIdTypeChange = useCallback(() => {
    setIsHex(!isHex)
  }, [isHex])

  return <div className="import-asset-item-section">
    <div className="import-asset-item-section-label color-dark">
      <>
        Asset ID
        <span className="f12 ml5">({isHex ? "Hex" : "Base 64"})</span>
        <SwapOutlined
          onClick={handleIdTypeChange}
          style={{
            fontSize: "20px",
            marginLeft: "5px",
            cursor: "pointer",
            color: "#38c89d"
          }}
        />
      </>
    </div>
    <div className="import-asset-item-section-label">
      <EllipsisMiddle suffixCount={8}>
        {isHex ? item.asset_id : window.btoa(item.asset_id)}
      </EllipsisMiddle>
    </div>
  </div>


}
function ImportButton({ item, setImportingOpen, setImportingMap }) {
  const [loading, setLoading] = useState(false)
  const { handleImportAsset } = useImportAsset();
  const { handleQueryTokenList } = useHandleQueryTokenList()
  const handleImport = useCallback(async () => {
    try {
      setLoading(true)
      let ret = await handleImportAsset({
        id: item.asset_id
      });
      setLoading(false)
      if (ret?.code === 0) {
        setImportingOpen(true)
        setImportingMap({
          type: "success",
          content: "Greate! You just imported a Taproot Asset to NostrAssets, you can back to Assets page to manage your asset now."
        })
        handleQueryTokenList()
      } else {
        setImportingOpen(true)
        setImportingMap({
          type: "fail",
          content: ret?.data || "Import asset failed!"
        })
      }
    } catch (error) {
      setLoading(false)
    }

  }, [handleImportAsset, handleQueryTokenList, item.asset_id, setImportingMap, setImportingOpen])
  return <CheckNostrButton><Button type="primary" loading={loading} onClick={() => handleImport()}>Import Asset</Button></CheckNostrButton>
}
export default function ImportAssets() {
  const history = useHistory();
  const { tokenList } = useSelector(({ market }) => market);
  const [open, setOpen] = useState(false)
  const [pageSize, setPageSize] = useState(20);
  const [pageIndex, setPageIndex] = useState(1);
  const [assetId, setAssetId] = useState("");
  const [importingOpen, setImportingOpen] = useState(false);
  const [importingMap, setImportingMap] = useState({
    type: "success",
    content: "Greate! You just imported a Taproot Asset to NostrAssets, you can back to Assets page to manage your asset now."
  });
  const { handleQueryBalance } = useQueryBalance();
  const { npubNostrAccount } = useSelector(({ user }) => user);
  const { list, fetching, total, reexcuteQuery } = useImportAssetsQuery({
    pageSize: pageSize,
    pageIndex: pageIndex,
    assetId
  });
  const assetList = useMemo(() => {
    if (fetching) {
      return <div className="tc"><Spin></Spin></div>
    }
    if (list?.length) {
      return list.map((item) => {
        const isImported = tokenList.some(k => k.token == item.asset_id)
        return <div className="import-asset-item" key={item.asset_id}>
          <Tooltip
            overlayClassName="token-address-tooltip"
            title={
              <div>
                <div>Asset Supply: {item?.total_supply || "--"}</div>
              </div>
            }
          >
            <div className="import-asset-item-logo">
              <Image
                width={40}
                height={40}
                style={{ borderRadius: "20px" }}
                preview={false}
                src={tapdLogo}
                fallback="data:image/png;base64,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"
              />
            </div>

            <div className="import-asset-item-section">
              <div className="import-asset-item-section-label color-dark">
                Asset Name
              </div>
              <div className="import-asset-item-section-value">
                <EllipsisMiddle suffixCount={12} suffixCountMore={-6}>
                  {item.asset_name}
                </EllipsisMiddle>

              </div>
            </div>
            <div className="import-asset-item-type">
              <div className="import-asset-item-section-label color-dark">
                Asset Type
              </div>
              <div className="import-asset-item-section-value">
                {assetsTypeMap[item?.asset_type] || "--"}
              </div>
            </div>
            <Transfer item={item}></Transfer>

            <div className="import-asset-item-section-btn">
              {!isImported ? <ImportButton item={item} setImportingOpen={setImportingOpen} setImportingMap={setImportingMap}></ImportButton> : "Imported"}
            </div>
          </Tooltip>
        </div>
      });
    } else {
      return <div className="import-asset-list-empty">
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} imageStyle={{ color: "#fff" }} description={<span className="color-base f16">Can't find this asset, maybe this haven’t import to NostrAssets from the universe, please sync the universe and import.</span>} />
        <CheckNostrButton><Button type="primary" onClick={() => setOpen(true)}>Sync and Import</Button></CheckNostrButton>
      </div>
    }
  }, [fetching, list, tokenList])
  const assetIdChange = useCallback((e) => {
    //
    setPageIndex(1);
    setAssetId(e.target.value);
  }, []);
  const onPageChange = useCallback((page, pageSize) => {
    setPageIndex(page);
    setPageSize(pageSize);
  }, []);
  const handleBack = useCallback(() => {
    handleQueryBalance(npubNostrAccount);
    history.push("/account");
  }, [handleQueryBalance, history, npubNostrAccount])
  const handleImportOk = useCallback(() => {
    setImportingOpen(false)
    if (importingMap.type == "success") {
      handleBack()
    }
  }, [handleBack, importingMap.type])
  return (
    <>
      <div className="import-asset-container">
        <div
          className="import-asset-back OpenSans"
          onClick={() => {
            handleBack()
          }}
        >
          <LeftOutlined className="pointer" />
          <span className="import-back__value"> Back</span>
        </div>
        <div className="import-asset-content">
          <div className="import-asset-content-sync">
            <span>Can't find asset?</span> <CheckNostrButton><span className="sync-link" onClick={() => setOpen(true)}>Sync and Import</span></CheckNostrButton>
          </div>
          <div className="import-asset-title">
            Import Assets
          </div>
          <div className="import-asset-subtitle">
            Search for assets and import to NostrAssets Asset List. Non-fungible Tokens currently not supported yet.
          </div>
          <div className="import-asset-search">
            <span>Search Asset </span><Input onChange={assetIdChange} size="large" placeholder="Search by asset name or asset ID" />
          </div>
          <div className="import-asset-list">
            {assetList}
          </div>
          <div className="tc mt20">
            <Pagination current={pageIndex} pageSize={pageSize} total={total} onChange={onPageChange} />
          </div>
        </div>
      </div>
      <ImportModal open={open} setOpen={setOpen} importingOpen={importingOpen} setImportingOpen={setImportingOpen} setImportingMap={setImportingMap}></ImportModal>
      <Modal
        className="import-asset-modal"
        open={importingOpen}
        width="350px"
        title={null}
        zIndex={1002}
        footer={<>
          <Button
            type="primary"
            size={"middle"}
            onClick={handleImportOk}
          >
            OK
          </Button>
        </>}
        closeIcon={null}
      >
        <div>
          <div className="tc">
            {importingMap.type == "success" ? <CheckCircleOutlined style={{ fontSize: "30px", color: "#38c89d" }} /> : <CloseCircleOutlined style={{ fontSize: "30px", color: "#ff4400" }} />}
          </div>
          <div style={{ marginTop: "20px" }}>
            {importingMap.content}
          </div>
        </div>
      </Modal>
    </>
  );
}
