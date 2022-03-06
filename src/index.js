import React, { Text } from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Moralis } from 'moralis';
import { MoralisProvider } from "react-moralis";
import "./index.css";
import { DappProvider } from "./dappProvider/DappProvider.js";

const APP_ID = process.env.REACT_APP_MORALIS_APPLICATION_ID;
const SERVER_URL = process.env.REACT_APP_MORALIS_SERVER_URL;

Moralis.initialize(APP_ID);
Moralis.serverURL = SERVER_URL;

const Application = () => {
  const isServerInfo = APP_ID && SERVER_URL ? true : false;
  if (!APP_ID || !SERVER_URL)
    throw new Error("Missing Moralis Application ID or Server URL. Make sure to set your .env file.");
  if (isServerInfo)
    return (
      <MoralisProvider appId={APP_ID} serverUrl={SERVER_URL}>
        <DappProvider>
          <App isServerInfo />
        </DappProvider>
      </MoralisProvider>
    );
  else {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Text>This is a problem from index.js</Text>
      </div>
    );
  }
};

ReactDOM.render(<Application />, document.getElementById("root"));
