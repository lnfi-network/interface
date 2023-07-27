import { Button, Steps } from "antd";
import { useState, useMemo, useCallback, useEffect } from "react";

import DepositForm from "./comps/DepositForm";

/* import DepositHelpModal from "./comps/DepositHelpModal"; */
import SetupNetWorkModal from "components/Modals/SetupNetWorkModal";
export default function StepForms() {
  return (
    <>
      {/* <DepositHelpModal /> */}
      <DepositForm />
      <SetupNetWorkModal />
    </>
  );
}
