import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { useUserData } from "userContext/UserContextProvider";
import AccountVerification from "components/Account/AccountVerification";
import ChainVerification from "components/Chains/ChainVerification";
import SinglePack from "./SinglePack";
import BatchPack from "./BatchPacks";
import PackClaim from "./ClaimPack";
import StepsPane from "./StepPane";

const styles = {
  content: {
    height: "90%",
    margin: "auto",
    marginTop: "30px",
    textAlign: "center"
  },
  title: {
    marginBottom: "35px",
    fontSize: "22px",
    fontWeight: "600",
    color: "white",
    letterSpacing: "2px"
  },
  tabsContent: {
    display: "flex",
    flexDirection: "row",
    height: "65vh",
    gap: "30px"
  },
  leftColumn: {
    flex: "1",
    display: "flex"
  }
};

const Pack = ({ paneToShow }) => {
  const { isAuthenticated } = useMoralis();
  const { onSupportedChain } = useUserData();
  const [displayPaneMode, setDisplayPaneMode] = useState("tokens");
  const [titleText, setTitleText] = useState("");
  const [isBatch, setIsBatch] = useState(false);

  const switchPane = () => {
    switch (paneToShow) {
      case "single":
        return <SinglePack displayPaneMode={displayPaneMode} setDisplayPaneMode={setDisplayPaneMode} />;
      case "batch":
        return <BatchPack displayPaneMode={displayPaneMode} setDisplayPaneMode={setDisplayPaneMode} />;
      case "claim":
        return <PackClaim displayPaneMode={displayPaneMode} setDisplayPaneMode={setDisplayPaneMode} />;
      default:
    }
  };

  useEffect(() => {
    if (paneToShow === "single") {
      setIsBatch(false);
      setTitleText("Prepare your single Pack");
    } else if (paneToShow === "batch") {
      setIsBatch(true);
      setTitleText("Prepare your Multiple Packs");
    } else if (paneToShow === "claim") {
      setIsBatch(false);
      setTitleText("Select a Pack to reveal its content");
    }
    return;
  }, [paneToShow]);

  return (
    <div style={styles.content}>
      <AccountVerification param={"pack"} />
      <ChainVerification />
      {isAuthenticated && onSupportedChain && (
        <>
          <div style={styles.title}>
            <p>{titleText}</p>
          </div>

          <div style={styles.tabsContent}>
            {paneToShow !== "claim" && (
              <div style={styles.leftColumn}>
                <StepsPane displayPaneMode={displayPaneMode} isBatch={isBatch} />
              </div>
            )}

            <div style={{ flex: "3" }}>{switchPane()}</div>
          </div>
        </>
      )}
    </div>
  );
};

export default Pack;
