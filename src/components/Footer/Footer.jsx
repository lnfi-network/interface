import "./Footer.scss";
import { ReactComponent as Twitter } from "fonts/svg/twitter.svg";
import { ReactComponent as Telegram } from "fonts/svg/telegram.svg";
import { ReactComponent as Gitbook } from "fonts/svg/gitbook.svg";
import { ReactComponent as Git } from "fonts/svg/github.svg";
import logoImg from "img/logo_nostr.png";
export default function Footer() {
  return (
    <>
      <div className="Footer">
        {/* <img src={logoImg} style={{ width: "150px" }} alt="NostrAssets Logo" /> */}
        <div class="Footer-links">
          <a href="https://t.me/nostrassets" target="_blank">
            <Telegram className="svg-icon" width={30} height={30}></Telegram>
          </a>
          <a href="https://twitter.com/nostrassets" target="_blank">
            <Twitter className="svg-icon" width={30} height={30}></Twitter>
          </a>
          <a href="https://doc.nostrassets.com/" target="_blank">
            <Gitbook className="svg-icon" style={{ width: "30px", height: "30px" }}></Gitbook>
          </a>
          <a href="https://github.com/nostrassets" target="_blank">
            <Git className="svg-icon" width={30} height={30} />
          </a>
        </div>
        <div className="footer-disclaimer">
          <a href="https://doc.nostrassets.com/disclaimer" target="_blank">
            Disclaimer
          </a>
        </div>
        <div className="footer-reserved">© 2023 NostrAssets. All Rights Reserved</div>
        {/* <a className="footer-link" href="https://t.me/nostrassets" target="_blank">
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
        </a> */}
      </div>
    </>
  );
}
