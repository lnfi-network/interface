export default function ClaimDescription() {
  return (
    <>
      <ul className="claim-description">
        <li className="claim-description-item OpenSans">
          <h4> 1. How to claim Testnet tokens?</h4>
          <div className="claim-description-item__child">
            1) Your Nostr Address must be whitelisted. (After you have took part in our Zealy campaign, a strict
            verification process have been done, and only Nostr address that are announced here are qualified and are
            whitelisted)
          </div>
          <div className="claim-description-item__child">Check if your Nostr address qualifies: [url]</div>
          <div className="claim-description-item__child">
            3) You may only pick 1 option. ‘Trick’ or ‘Treat’. Once you have selected, the respective Taproot Asset will
            be send directly to your Nostr Address.
          </div>
          <div className="claim-description-item__child">
            eg. If you select ‘Trick’, you will receive 10,000 TRICK, and vice versa if you select ‘Treat’)
          </div>
          <div className="claim-description-item__child">
            4) You may check your asset on the NostrAsset Asset Dashboard after confirmation.
          </div>
        </li>

        <li className="claim-description-item OpenSans">
          <h4>About ‘TRICK’ or ‘TREAT’ Taproot Assets</h4>
          <div className="claim-description-item__child">
            TRICK or TREAT assets are created by NostrAssets aims to enable more people around the globe to have access
            to Taproot Assets. As a leading pioneer in Taproot Assets, NostrAssets allows users to send, receive,
            transfer and trade Taproot Assets on our platform. More features
          </div>
        </li>
      </ul>
    </>
  );
}
