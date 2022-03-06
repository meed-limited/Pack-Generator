import React from "react";
import SinglePack from "./SinglePack";
import BatchPack from "./BatchPacks";
import PackClaim from "./PackClaim";
import { Tabs } from "antd";
import styles from "./styles";
import { useMoralis } from "react-moralis";
import ChainVerification from "components/Chains/ChainVerification";

const { TabPane } = Tabs;

const Pack = () => {
  const { isAuthenticated } = useMoralis();

  return (
    <div style={styles.content}>
      {!isAuthenticated && (
        <>
          <div style={styles.transparentContainerNotconnected}>
            <p style={{ textAlign: "center" }}>Connect your wallet to start packing!</p>
          </div>
          <div style={{ marginBottom: "30px" }}> </div>
        </>
      )}
      <ChainVerification />
      <Tabs centered tabBarGutter='50px' tabBarStyle={styles.tabs} type='line'>
        <TabPane tab='SINGLE PACK' key='1'>
          <SinglePack />
        </TabPane>
        <TabPane tab='BATCH PACK' key='2'>
          <BatchPack />
        </TabPane>
        <TabPane tab='CLAIM PACK' key='3'>
          <PackClaim />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Pack;
