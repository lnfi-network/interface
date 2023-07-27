import "./Footer.scss";
import RelayList from "../RelayList"

export default function Footer({ setRelayUrls }) {
  return (
    <div className="Footer">
      <RelayList setRelayUrls={setRelayUrls}></RelayList>
    </div>
  );
}
