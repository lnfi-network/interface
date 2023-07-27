import "./DepositDescription.scss";
export default function DepositDescription() {
  return (
    <>
      <ul className="deposit-description">
        <li className="deposit-description-item OpenSans">
          1. We currently support deposit ERC20 USDT and some BRC20 Tokens.
        </li>
        <li className="deposit-description-item OpenSans">
          2. Please be sure to confirm that your receiving Nostr address is
          correct. Nostr addresses are generally obtained from some Nostr
          clients or wallets that support Nostr Protocol.
        </li>
        <li className="deposit-description-item OpenSans">
          3. All deposit transactions are transparent, and you can check and pay
          attention to the deposit status in real time;
        </li>
      </ul>
    </>
  );
}
