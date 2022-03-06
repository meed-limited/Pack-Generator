# PACK-GENRATOR - Quick Start

```
💿 Install all dependencies:
```sh
cd NFT-Bundle-WebApp
yarn install 
```
✏ Create a `.env` file in the main folder and provide your `appId` and `serverUrl` from Moralis ([How to start Moralis Server](https://docs.moralis.io/moralis-server/getting-started/create-a-moralis-server)) 
Example:
```jsx
REACT_APP_MORALIS_APPLICATION_ID = xxxxxxxxxxxx
REACT_APP_MORALIS_SERVER_URL = https://xxxxxx.grandmoralis.com:2053/server
```

🔎 Locate the DappProvider in `src/dappProvider/DappProvider.js` and paste your smart-contracts addresses and ABI;
```jsx
const marketABI = useState();
const marketAddressMumbai = useState();
```

🔃 Sync any smart-contracts events with your Moralis Server


🚴‍♂️ Run your App:
```sh
yarn start
```


