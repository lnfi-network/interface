import "./index.scss";
import { ReactComponent as Twitter } from "fonts/svg/twitter.svg";
import { ReactComponent as Telegram } from "fonts/svg/telegram.svg";
import { ReactComponent as Gitbook } from "fonts/svg/gitbook.svg";
import { ReactComponent as Git } from "fonts/svg/github.svg";
export default function OutLinks() {
  return (
    <>
      <div className="outLinks">
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
    </>
  );
}
