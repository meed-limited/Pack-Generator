import React from "react";
import { useMoralis } from "react-moralis";
import SinglePack from "./SinglePack";
import BatchPack from "./BatchPacks";
import PackClaim from "./PackClaim";
import AccountVerification from "components/Account/AccountVerification";
import ChainVerification from "components/Chains/ChainVerification";
import { Tabs } from "antd";
import styles from "./styles";

const { TabPane } = Tabs;

const Pack = () => {
  const { isAuthenticated } = useMoralis();

  return (
    <div style={styles.content}>
      <AccountVerification param={"pack"} />
      <ChainVerification />
      {isAuthenticated && (
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
      )}
    </div>
  );
};

export default Pack;
