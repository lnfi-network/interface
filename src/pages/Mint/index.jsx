import MintList from "./MintList";
export default function Mint() {
  return (
    <>
      <div className="nostr-assets-container">
        {/* <h3 className="nostr-assets-container-title">Mint Assets</h3>
        <div className="nostr-assets-container-des"></div> */}
        <MintList></MintList>
      </div>
    </>
  );
}
