import { Card } from "antd";
import { useState, useEffect } from "react";
import { Radio } from "antd";
const { Meta } = Card;
import "./Inscription.scss";
export default function Inscription({ inscription, onInscriptionChange }) {
  const handleToggleChecked = () => {
    onInscriptionChange(inscription.inscriptionId, !inscription.checked);
  };

  return (
    <>
      <Card
        hoverable
        className="inscription-card"
        onClick={handleToggleChecked}
      >
        <Radio
          value={inscription.inscriptionId}
          className="inscription-card-radio"
          checked={inscription.checked}
        />
        <div className="inscription-name">{inscription?.tick}</div>
        <div className="inscription-amount">{inscription?.amt}</div>
        <div className="inscription-num">#{inscription?.inscriptionNumber}</div>
      </Card>
    </>
  );
}
