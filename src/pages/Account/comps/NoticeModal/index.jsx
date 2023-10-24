import { useEffect, useRef, useState, useCallback } from "react";
import { Modal, Button } from "antd";
import * as Lockr from "lockr";
export default function NoticeModal() {
  const [noticeModalVisible, setNoticeModalVisible] = useState(false);
  const noticeModalRef = useRef(null);
  const [noticeConfirmBtnEnable, setNoticeConfirmBtnEnable] = useState(false);
  const onNoticeModalCancel = useCallback(() => {
    setNoticeModalVisible(false);
    Lockr.set("isShowNoticeModal", true);
  }, []);

  useEffect(() => {
    const isHasShowNoticeModal = Lockr.get("isShowNoticeModal");
    if (!isHasShowNoticeModal) {
      setNoticeModalVisible(true);
    }
    const noticeModalRefDom = noticeModalRef.current;
    const onScroll = () => {
      if (noticeModalRefDom.scrollTop + noticeModalRefDom.clientHeight >= noticeModalRefDom.scrollHeight - 150) {
        setNoticeConfirmBtnEnable(true);
      } else {
        setNoticeConfirmBtnEnable(false);
      }
    };
    noticeModalVisible && noticeModalRefDom?.addEventListener("scroll", onScroll);
    return () => {
      noticeModalVisible && noticeModalRefDom?.removeEventListener("scroll", onScroll);
    };
  }, [noticeModalVisible]);
  return (
    <>
      <Modal
        width={500}
        title={null}
        centered
        open={noticeModalVisible}
        footer={null}
        closable={false}
        onCancel={onNoticeModalCancel}
        maskClosable={false}
      >
        <h2 className="nostrswap-modal-title">Disclaimer</h2>
        <div className="nostrswap-modal nostrswap-modal-scroll" ref={noticeModalRef}>
          <div className="nostrswap-modal-description">
            <h3 className="nostrswap-modal-subtitle">Disclaimer for Taproot Assets Usage on NostrAssets</h3>
            <div>
              Before using Taproot Assets on NostrAssets, it is essential to thoroughly understand and accept the
              following terms and conditions:
            </div>
          </div>
          <div className="nostrswap-modal-description">
            <h3 className="nostrswap-modal-subtitle">Emerging Technology and Unforeseen Risks</h3>
            <div>
              Taproot Assets represent an emerging technology that carries potential unknown and unforeseen risks. The
              ever-evolving nature of this technology means that risks may exist that are not yet fully recognized or
              anticipated.
            </div>
          </div>
          <div className="nostrswap-modal-description">
            <h3 className="nostrswap-modal-subtitle">Emphasis on Risk</h3>
            <div>
              It is imperative to recognize and emphasize the inherent risks associated with Taproot Assets. These risks
              may encompass, but are not limited to: Market Volatility: The value of Taproot Assets can experience
              significant fluctuations, leading to potential financial losses.
              <p>
                Market Volatility: The value of Taproot Assets can experience significant fluctuations, leading to
                potential financial losses.
              </p>
              <p>
                Security Risks: Safeguarding your assets is your responsibility. The loss of private keys or security
                breaches can result in the loss of your assets.
              </p>
              <p>
                Regulatory Changes: The regulatory landscape for cryptocurrencies and emerging technologies like Taproot
                may evolve, potentially impacting their use and value.{" "}
              </p>
              <p>
                Technological Vulnerabilities: Emerging technologies often face vulnerabilities that may be exploited by
                malicious actors.
              </p>
            </div>
          </div>
          <div className="nostrswap-modal-description">
            <h3 className="nostrswap-modal-subtitle">No FOMO Recommendation</h3>
            <div>
              We strongly discourage making impulsive investment decisions driven by fear of missing out (FOMO). Users
              are urged to exercise caution and conduct their own due diligence before engaging with Taproot Assets on
              NostrAssets.
            </div>
          </div>
          <div className="nostrswap-modal-description">
            <h3 className="nostrswap-modal-subtitle">No Liability for Losses</h3>
            <div>
              You must acknowledge and accept that any financial losses incurred while using Taproot Assets on
              NostrAssets are solely your responsibility. You agree not to hold the platform, the technology, the
              protocol, or any affiliated individuals or entities accountable for such losses. Consult a Professional
              Financial Advisor.
              <p>
                For personalized financial advice tailored to your individual circumstances and risk tolerance, it is
                highly advisable to consult with a qualified and professional financial advisor. They can offer guidance
                on managing and mitigating the risks associated with your use of Taproot Assets on NostrAssets.
              </p>
              <p>
                Your use of Taproot Assets on NostrAssets indicates your understanding of these risks and your agreement
                to the terms presented in this disclaimer. If you are unwilling or unable to accept these terms, we
                recommend refraining from using this technology.
              </p>
            </div>
          </div>
          <div className="nostrswap-modal-description">
            <h3 className="nostrswap-modal-subtitle">NostrAssets' Commitment to Taproot Asset Accessibility</h3>
            <p>
              In addition to the important risk considerations outlined above, it's essential to understand NostrAssets'
              mission. We aim to provide as many users as possible with the opportunity to explore and engage with
              Taproot Assets in its early stages. However, during this early phase, certain limitations may be
              implemented to prevent potential malicious acts or risky user behaviors. These measures are in place to
              protect the community and help maintain a secure environment for all participants.
            </p>
            <p>
              While our team will actively monitor and manage the platform, it's crucial to emphasize that users are
              primarily responsible for their own research, due diligence, and interactions with Taproot Assets. As we
              navigate the evolving landscape of emerging technology, your active involvement and understanding are
              vital.
            </p>
            <p>
              Please keep in mind that these limitations and precautions are in place to enhance the security and
              stability of the ecosystem. We appreciate your cooperation in making the early stages of Taproot Assets
              accessible and secure for all participants. Your active engagement and commitment to responsible and
              informed use of Taproot Assets on NostrAssets are highly valued.
            </p>
            <p>
              By participating in activities such as receiving, sending, transferring, trading, creating, minting, or
              importing Taproot Assets on NostrAssets, you acknowledge your understanding of these conditions and your
              agreement to the terms outlined in this disclaimer. If you are unwilling or unable to accept these terms,
              we recommend refraining from participating in these activities.
            </p>
          </div>
          <div className="nostrswap-modal-description">
            <h3 className="nostrswap-modal-subtitle">NostrAssets Fee Structure for Asset Creation</h3>
            <p>
              In line with our commitment to maintaining the quality and security of Taproot Assets created on
              NostrAssets, it's important to be aware of our fee structure. NostrAssets charges fees for the creation of
              assets on the platform. These fees serve multiple purposes, all of which are aimed at enhancing the
              overall user experience and ecosystem.
            </p>
          </div>
          <div className="nostrswap-modal-description">
            <h3 className="nostrswap-modal-subtitle">Quality Assurance</h3>
            <p>
              By charging fees for asset creation, NostrAssets can effectively screen and filter the assets that are
              added to the platform. This screening process helps ensure that the Taproot Assets featured on NostrAssets
              meet certain quality standards. The fees act as a barrier to entry, dissuading low-quality or potentially
              malicious projects and thereby creating a safer and more trustworthy environment for users.
            </p>
          </div>
          <div className="nostrswap-modal-description">
            <h3 className="nostrswap-modal-subtitle">Supporting Quality Projects</h3>
            <p>
              The fees collected for asset creation also contribute to the support and development of the platform,
              including security enhancements, ongoing monitoring, maintenance cost (blockchain servers etc) and the
              implementation of new features. This support is instrumental in maintaining the integrity of the ecosystem
              and promoting quality projects that are beneficial to the community.
            </p>
          </div>
          <div className="nostrswap-modal-description">
            <h3 className="nostrswap-modal-subtitle">User Experience Enhancement</h3>
            <p>
              Lastly, these fees are invested in improving the overall user experience, making NostrAssets more
              user-friendly and secure. They enable us to provide a better service to all participants and offer a
              seamless environment for users to explore and engage with Taproot Assets. We want to emphasize that these
              fees are designed with the best interests of the NostrAssets community in mind. They play a significant
              role in shaping a safe, high-quality, and user-centric ecosystem for the early stages of Taproot Assets.
            </p>
            <p>
              By creating assets on NostrAssets, you acknowledge and accept the fee structure and the benefits it brings
              to the platform. Your continued use of NostrAssets signifies your understanding of these fees and your
              agreement to the terms outlined in this disclaimer. If you are unwilling or unable to accept these terms,
              we recommend refraining from creating assets on this platform.
            </p>
          </div>
        </div>
        <div className="nostrswap-modal-footer">
          <Button
            size="middle"
            type="primary"
            onClick={() => {
              onNoticeModalCancel();
            }}
            disabled={!noticeConfirmBtnEnable}
          >
            I Understand
          </Button>
        </div>
      </Modal>
    </>
  );
}
