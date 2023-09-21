import { Alert } from "antd";
import { useCallback, useState } from "react";
import * as Lockr from "lockr";
import "./index.scss";
export default function AlertTip({ id, description, type = "success", ...props }) {
  const [hasVisited, setHasVisitied] = useState(!!Lockr.get(`${id}`));
  const onClose = useCallback(() => {
    setHasVisitied(true);
    Lockr.set(`${id}`, true);
  }, [id]);
  return (
    <>
      {!hasVisited && (
        <Alert className="form-alert" description={description} type={type} closable onClose={onClose} {...props} />
      )}
    </>
  );
}
