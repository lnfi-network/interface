import React, { useCallback } from "react";

export default function FunctionEnableButton({ children, enable = false }) {
  const handleClick = useCallback(() => {
    window._message.warning("Coming soon.");
  }, []);
  const childWithNewOnClick = React.cloneElement(children, { onClick: handleClick });

  return <>{!enable ? childWithNewOnClick : children}</>;
}
