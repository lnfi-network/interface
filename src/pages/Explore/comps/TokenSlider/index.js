import "./index.scss";
import Slider from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function TokenSlider() {
  const [settings, setSettings] = useState({
    dots: true,
    infinite: true,
    slidesToShow: Math.floor((document.body.clientWidth - 100) / 300) || 1,
    slidesToScroll: 1,
    autoplay: true,
    speed: 3000,
    autoplaySpeed: 3000,
    cssEase: "linear",
    nextArrow: <></>,
    prevArrow: <></>
  });
  const handleResize = useCallback(() => {
    // 
    setSettings({
      dots: true,
      infinite: true,
      slidesToShow: Math.floor((document.body.clientWidth - 100) / 300) || 1,
      slidesToScroll: 1,
      autoplay: true,
      speed: 3000,
      autoplaySpeed: 3000,
      cssEase: "linear",
      nextArrow: <></>,
      prevArrow: <></>
    });
  }, []);
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  return (
    <>
      <div className="token-slider-box">
        <Slider {...settings} className="token-slider">
          <div className="slider-item" style={{ width: "300px" }}>
            <span className="name OpenSans">ordi 1960</span>
            <span className="value OpenSans">sats≈$12.56</span>
            <span>(</span>
            <span className="rate">+100.67%</span>
            <span>)</span>
          </div>
          <div className="slider-item" style={{ width: "300px" }}>
            <span className="name OpenSans">PEPE 1960</span>
            <span className="value OpenSans">sats≈$12.56</span>
            <span>(</span>
            <span className="rate">+100.67%</span>
            <span>)</span>
          </div>
          <div className="slider-item" style={{ width: "300px" }}>
            <span className="name OpenSans">PUSY 1960</span>
            <span className="value OpenSans">sats≈$12.56</span>
            <span>(</span>
            <span className="rate">+100.67%</span>
            <span>)</span>
          </div>
          <div className="slider-item" style={{ width: "300px" }}>
            <span className="name OpenSans">MEME 1960</span>
            <span className="value OpenSans">sats≈$152.56</span>
            <span>(</span>
            <span className="rate">+100.67%</span>
            <span>)</span>
          </div>
          <div className="slider-item" style={{ width: "300px" }}>
            <span className="name OpenSans">MEME 1960</span>
            <span className="value OpenSans">sats≈$152.56</span>
            <span>(</span>
            <span className="rate">+100.67%</span>
            <span>)</span>
          </div>
        </Slider>
      </div>
    </>
  );
}
