import { useMoralis, useNativeBalance } from "react-moralis";

function NativeBalance(props) {
  const { data: balance, nativeName } = useNativeBalance(props);
  const { account, isAuthenticated } = useMoralis();

  if (!account || !isAuthenticated) return null;

  return (
    <div style={{ textAlign: "center", whiteSpace: "nowrap", color: "white" }}>
      {balance.formatted} {nativeName}
    </div>
  );
}

export default NativeBalance;
