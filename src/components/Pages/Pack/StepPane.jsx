/*eslint no-dupe-keys: "Off"*/
import { Steps } from "antd";
import { useEffect, useState } from "react";
const { Step } = Steps;

const styles = {
  pane: {
    display: "flex",
    alignItems: "flex-start",
    borderRadius: "20px",
    background: "rgba(240, 248, 255, 0.10)",
    background:
      "-moz-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background:
      "-webkit-linear-gradient(left, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    background:
      "linear-gradient(to right, rgba(240, 248, 255, 0.40) 0%, rgba(240, 248, 255, 0.25) 50%, rgba(240, 248, 255, 0.10) 100%)",
    border: "1px solid",
    padding: "20px 15px 0px 20px",
    color: "white",
    overflow: "auto",
  },
};

const StepsPane = ({ displayPaneMode, isBatch }) => {
  const [text, setText] = useState("");

  useEffect(() => {
    if (displayPaneMode === "factory") {
      setText("Select a collection, create one, or click 'NEXT' to skip and use our integrated one.");
    } else if (displayPaneMode === "tokens") {
      setText("Select some of your ERC20 tokens, or all, or none, and click on 'NEXT' when you're done.");
    } else if (displayPaneMode === "nfts") {
      setText("Select some of your NFTs, or all, or none, and click on 'NEXT' when you're done.");
    } else if (displayPaneMode === "confirm") {
      setText("Check everything before packing");
    } else if (displayPaneMode === "pack") {
      setText("Select the service fee payment method and create your pack(s)!");
    } else if (displayPaneMode === "done") {
      setText("Pack(s) succesfully created!");
    }
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayPaneMode]);

  const switchStep = () => {
    if (isBatch) {
      switch (displayPaneMode) {
        case "factory":
          return 0;
        case "tokens":
          return 1;
        case "nfts":
          return 2;
        case "confirm":
          return 3;
        case "pack":
          return 4;
        case "done":
          return 6;
        default:
          return 0;
      }
    } else {
      switch (displayPaneMode) {
        case "tokens":
          return 0;
        case "nfts":
          return 1;
        case "confirm":
          return 2;
        case "pack":
          return 3;
        case "done":
          return 5;
        default:
          return 0;
      }
    }
  };

  return (
    <div style={styles.pane}>
      <Steps direction="vertical" current={switchStep()}>
        {isBatch && <Step title="Choose Collection" description={displayPaneMode === "factory" ? `${text}` : ""} />}
        <Step title="Choose Tokens" description={displayPaneMode === "tokens" ? `${text}` : ""} />
        <Step title="Choose NFTs" description={displayPaneMode === "nfts" ? `${text}` : ""} />
        <Step title="Recap" description={displayPaneMode === "confirm" ? `${text}` : ""} />
        <Step title="Pack" description={displayPaneMode === "pack" ? `${text}` : ""} />
        <Step title="Done" description={displayPaneMode === "done" ? `${text}` : ""} />
      </Steps>
    </div>
  );
};

export default StepsPane;
