import "./index.scss";
export default function Container({ pageTitle = "", children }) {
  return (
    <div className="nostr-container">
      <div className="nostr-page-title OpenSans">{pageTitle}</div>
      {children}
    </div>
  );
}
