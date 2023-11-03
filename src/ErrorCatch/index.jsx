import useUnhandledError from "hooks/useUnhandleError";
export default function ErrorCatch({ children }) {
  useUnhandledError();
  return <>{children}</>;
}
