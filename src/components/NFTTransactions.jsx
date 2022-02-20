import React, { useEffect, useState } from "react";
import { useMoralisQuery, useWeb3ExecuteFunction } from "react-moralis";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useContractEvents } from "hooks/useContractEvents";
import { getEllipsisTxt } from "helpers/formatters";
import { Table, Tag, Space } from "antd";
import moment from "moment";
import styles from "./Bundle/styles";
import { FileSearchOutlined } from "@ant-design/icons";
import { getExplorer } from "helpers/networks";
import { useQueryMoralisDb } from "hooks/useQueryMoralisDb";

function NFTTransactions() {
  const contractProcessor = useWeb3ExecuteFunction();
  const { walletAddress, chainId, factoryAddressEthereum, factoryAddressPolygon, factoryAddressMumbai, factoryABI } =
    useMoralisDapp();
  //const { retrieveCreatedAssemblyEvent } = useContractEvents();
  const { getCreatedCollectionData, getCreatedBundleData, getClaimedBundleData, parseData, parseCreatedBundleData } =
    useQueryMoralisDb();
  const Web3 = require("web3");
  const web3 = new Web3(Web3.givenProvider);
  const [fetchCollections, setFetchCollections] = useState();
  const [fetchCreatedBundle, setFetchCreatedBundle] = useState();
  const [fetchClaimedBundle, setFetchClaimedBundle] = useState();

  const queryItemImages = useMoralisQuery("ItemImages");
  const fetchItemImages = JSON.parse(JSON.stringify(queryItemImages.data, ["nftContract", "tokenId", "name", "image"]));
  const queryMarketItems = useMoralisQuery("MarketItems");
  const fetchMarketItems = JSON.parse(
    JSON.stringify(queryMarketItems.data, [
      "updatedAt",
      "price",
      "nftContract",
      "itemId",
      "sold",
      "tokenId",
      "seller",
      "owner"
    ])
  )
    .filter((item) => item.seller === walletAddress || item.owner === walletAddress)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : b.updatedAt < a.updatedAt ? -1 : 0));

  function getImage(addrs, id) {
    const img = fetchItemImages.find((element) => element.nftContract === addrs && element.tokenId === id);
    return img?.image;
  }

  function getName(addrs, id) {
    const nme = fetchItemImages.find((element) => element.nftContract === addrs && element.tokenId === id);
    return nme?.name;
  }

  const getCollections = async () => {
    const res = await getCreatedCollectionData(walletAddress);
    const parsedcollections = await parseData(res, walletAddress);

    for (let i = 0; i < parsedcollections.length; i++) {
      const ops = {
        contractAddress: parsedcollections[i].newCustomCollection,
        functionName: "name",
        abi: [
          {
            inputs: [],
            name: "name",
            outputs: [
              {
                internalType: "string",
                name: "_name",
                type: "string"
              }
            ],
            stateMutability: "view",
            type: "function"
          }
        ],
        params: {}
      };

      await contractProcessor.fetch({
        params: ops,
        onSuccess: async (response) => {
          parsedcollections[i].collectionName = response;
        },
        onError: (error) => {
          console.log(error);
        }
      });
      setFetchCollections(parsedcollections);
    }
  };

  const getCreatedBundle = async () => {
    const res = await getCreatedBundleData(walletAddress);
    const parsedCreatedBundle = await parseCreatedBundleData(res, walletAddress);
    let sliced = parsedCreatedBundle.slice(0, 50);

    for (let i = 0; i < sliced.length; i++) {
      const ops = {
        contractAddress: sliced[i].address,
        functionName: "name",
        abi: [
          {
            inputs: [],
            name: "name",
            outputs: [
              {
                internalType: "string",
                name: "_name",
                type: "string"
              }
            ],
            stateMutability: "view",
            type: "function"
          }
        ],
        params: {}
      };

      await contractProcessor.fetch({
        params: ops,
        onSuccess: async (response) => {
          sliced[i].collectionName = response;
        },
        onError: (error) => {
          console.log(error);
        }
      });
    }

    setFetchCreatedBundle(sliced);
  };

  const getClaimedBundle = async () => {
    const res = await getClaimedBundleData(walletAddress);
    const parsedClaimedBundle = await parseData(res, walletAddress);

    for (let i = 0; i < parsedClaimedBundle.length; i++) {
      const ops = {
        contractAddress: parsedClaimedBundle[i].address,
        functionName: "name",
        abi: [
          {
            inputs: [],
            name: "name",
            outputs: [
              {
                internalType: "string",
                name: "_name",
                type: "string"
              }
            ],
            stateMutability: "view",
            type: "function"
          }
        ],
        params: {}
      };

      await contractProcessor.fetch({
        params: ops,
        onSuccess: async (response) => {
          parsedClaimedBundle[i].collectionName = response;
        },
        onError: (error) => {
          console.log(error);
        }
      });
    }
    setFetchClaimedBundle(parsedClaimedBundle);
  };

  useEffect(() => {
    if (!fetchCollections) {
      getCollections();
    }
  }, [fetchCollections]);

  useEffect(() => {
    if (!fetchCollections) {
      getCreatedBundle();
    }
  }, [fetchCreatedBundle]);

  useEffect(() => {
    if (!fetchClaimedBundle) {
      getClaimedBundle();
    }
  }, [fetchClaimedBundle]);

  const columns = [
    {
      title: "DATE",
      key: "date",
      dataIndex: "date"
    },
    {
      title: "ITEM / SYMBOL",
      key: "item",
      dataIndex: "item"
      //   // render: (text, record) => (
      //   //   <Space size='middle'>
      //   //     <img src={getImage(record.collection, record.item)} alt='' style={{ width: "40px", borderRadius: "4px" }} />
      //   //     <span>#{record.item}</span>
      //   //   </Space>
      //   // )
    },
    // {
    //   title: "Collection",
    //   key: "collection",
    //   render: (text, record) => (
    //     <Space size='middle'>
    //       <span>{getName(record.collection, record.item)}</span>
    //     </Space>
    //   )
    // },
    {
      title: "COLLECTION",
      key: "collection",
      dataIndex: "collection",
      // render: (e, f) => (
      //   <a href={`${getExplorer(chainId)}tx/${f}`} target='_blank' rel='noreferrer noopener'>
      //     {e}
      //   </a>
      // )
    },
    {
      title: "TXs TYPE",
      key: "tags",
      dataIndex: "tags"
      // render: (tags) => (
      //   <>
      //     {tags.map((tag) => {
      //       let color = "geekblue";
      //       let status = "BUY";
      //       if (tag === false) {
      //         color = "volcano";
      //         status = "waiting";
      //       } else if (tag === true) {
      //         color = "green";
      //         status = "confirmed";
      //       }
      //       if (tag === walletAddress) {
      //         status = "SELL";
      //       }
      //       return (
      //         <Tag color={color} key={tag}>
      //           {status.toUpperCase()}
      //         </Tag>
      //       );
      //     })}
      //   </>
      // )
    },
    {
      title: "TXs HASH",
      key: "link",
      dataIndex: "link",
      render: (e) => (
        <a href={`${getExplorer(chainId)}tx/${e}`} target='_blank' rel='noreferrer noopener'>
          View in explorer: &nbsp;
          <FileSearchOutlined style={{ transform: "scale(1.3)", color: "purple" }} />
        </a>
      )
    }
  ];

  // const marketData = fetchMarketItems?.map((item, index) => ({
  //   key: index,
  //   date: moment(item.updatedAt).format("DD-MM-YYYY HH:mm"),
  //   collection: item.nftContract,
  //   item: item.tokenId,
  //   tags: [item.seller, item.sold]
  //   //price: item.price / ("1e" + 18)
  // }));

  const collectionData = fetchCollections?.map((item, index) => ({
    key: index,
    date: moment(item.updatedAt).format("DD-MM-YYYY HH:mm"),
    collection: item.collectionName,
    item: getEllipsisTxt(item.newNFTsymbol, 6),
    tags: "Collection Created",
    link: item.transaction_hash
  }));

  const createdBundleData = fetchCreatedBundle?.map((item, index) => ({
    key: item.objectId,
    date: moment(item.updatedAt).format("DD-MM-YYYY HH:mm"),
    collection: item.collectionName,
    item: getEllipsisTxt(item.tokenId, 6),
    tags: "Bundle Created",
    link: item.transaction_hash
  }));

  const claimedBundleData = fetchClaimedBundle?.map((item, index) => ({
    key: item.customCollection_id,
    date: moment(item.updatedAt).format("DD-MM-YYYY HH:mm"),
    collection: item.collectionName,
    item: getEllipsisTxt(item.tokenId, 6),
    tags: "Bundle Claimed",
    link: item.transaction_hash
  }));

  var data = [];
  data = data.concat(collectionData, createdBundleData, claimedBundleData);
  data = data.sort((a, b) => (a.date < b.date ? 1 : b.date < a.date ? -1 : 0));

  return (
    <>
      <div style={{ marginTop: "60px" }}>
        <div style={styles.table}>
          <Table size='middle' columns={columns} dataSource={data} />
        </div>
      </div>
    </>
  );
}

export default NFTTransactions;
