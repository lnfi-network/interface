import "./index.scss";
import { Carousel } from "antd";
import banner_1 from "img/banner_1@2x.png";
import banner_2 from "img/banner_2@2x.png";
import banner_1_m from "img/banner_1_mobile@2x.png";
import logo_1_m from "img/Banner-1-mobile.png";
import banner_2_m from "img/banner_2_m@2x.png";
export default function Banner() {
  return (
    <>
      <div className="banner">
        {/* <div className="title OpenSans">Simple, Safe, Efficient</div>
        <div className="text OpenSans">Chat-to-Trade on Any Nostr clients such as Damus、Snort</div>
        <div className="desc OpenSans">
          Support ERC20、BRC20 Transfer & Trade<span className="learn-more OpenSans">Learn More＞</span>
        </div> */}
        <Carousel autoplay>
          <div className="banner-img-box">
            <div className="banner-pc">
              <img className="banner-img" src={banner_1}></img>
              <div className="banner-content">
                <div className="banner-content-title">
                  Supporting BRC-20 Token Swaps
                </div>
                <div className="banner-content-desc">
                  Chat-to-Trade on any Nostr clients or via Web P2P Marketplace
                  {/* (
                  <a href="https://damus.io/" target="_blank">
                    Damus
                  </a>
                  ,{" "}
                  <a
                    href="https://play.google.com/store/apps/details?id=com.vitorpamplona.amethyst&hl=en_US"
                    target="_blank"
                  >
                    Amethyst
                  </a>
                  ,{" "}
                  <a href="https://iris.to/" target="_blank">
                    Iris
                  </a>{" "}
                  etc.) */}
                </div>
                <a
                  href="https://doc.nostrassets.com/"
                  target="_blank"
                  className="banner-content-more"
                >
                  Learn More
                </a>
              </div>
            </div>
            <div className="banner-m">
              <img className="banner-img" src={banner_1_m}></img>
              <div className="banner-content-m">
                <div className="banner-logo-m">
                  <img src={logo_1_m}></img>
                </div>
                <div className="banner-content-title-m">
                  Supporting BRC-20 Token Swaps
                </div>
                <div className="banner-content-desc-m">
                  Chat-to-Trade on any Nostr clients or via Web P2P Marketplace
                  {/* (
                  <a href="https://damus.io/" target="_blank">
                    Damus
                  </a>
                  ,{" "}
                  <a
                    href="https://play.google.com/store/apps/details?id=com.vitorpamplona.amethyst&hl=en_US"
                    target="_blank"
                  >
                    Amethyst
                  </a>
                  ,{" "}
                  <a href="https://iris.to/" target="_blank">
                    Iris
                  </a>{" "}
                  etc.) */}
                </div>
                <a
                  href="https://doc.nostrassets.com/"
                  target="_blank"
                  className="banner-content-more-m"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
          <div className="banner-img-box">
            <div className="banner-pc">
              <img className="banner-img" src={banner_2}></img>
              <a
                href="https://doc.nostrassets.com/"
                target="_blank"
                className="banner-more_2"
              >
                Learn More
              </a>
            </div>
            <div className="banner-m">
              <img className="banner-img" src={banner_2_m}></img>
              <a
                href="https://doc.nostrassets.com/"
                target="_blank"
                className="banner-content-more-2-m"
              >
                Learn More
              </a>
            </div>
          </div>
        </Carousel>
      </div>
      {/* </div> */}
    </>
  );
}
