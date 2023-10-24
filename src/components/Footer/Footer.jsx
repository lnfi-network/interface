import "./Footer.scss";

export default function Footer() {
  return (
    <>
      <div className="Footer">
        <a className="footer-link" href="https://t.me/nostrassets" target="_blank">
          Telegram
        </a>
        <a className="footer-link" href="https://twitter.com/nostrassets" target="_blank">
          Twitter
        </a>
        <a className="footer-link" href="https://github.com/nostrassets" target="_blank">
          Github
        </a>
        <a className="footer-link" href="https://doc.nostrassets.com/" target="_blank">
          Gitbook
        </a>
        <a className="footer-link" href="https://doc.nostrassets.com/disclaimer" target="_blank">
          Disclaimer
        </a>
      </div>
    </>
  );
}
