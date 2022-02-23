import React, { useEffect, useState } from "react";
import { useMoralisQuery, useWeb3ExecuteFunction } from "react-moralis";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useQueryMoralisDb } from "hooks/useQueryMoralisDb";
import { getEllipsisTxt } from "helpers/formatters";
import { getExplorer } from "helpers/networks";
import { Table, Tag, Space, Spin } from "antd";
import moment from "moment";
import styles from "./Bundle/styles";
import { FileSearchOutlined } from "@ant-design/icons";

function NFTTransactions() {
  const contractProcessor = useWeb3ExecuteFunction();
  const { walletAddress, chainId } = useMoralisDapp();
  const {
    getCreatedCollectionData,
    getCreatedBundleData,
    getCreatedBatchBundleData,
    getClaimedBundleData,
    parseData,
    parseCreatedBundleData
  } = useQueryMoralisDb();
  const [fetchCollections, setFetchCollections] = useState();
  const [fetchCreatedBundle, setFetchCreatedBundle] = useState();
  const [fetchCreatedBatchBundle, setFetchCreatedBatchBundle] = useState();
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

  const fetchNameABI = [
    {
      inputs: [],
      name: "name",
      outputs: [{ internalType: "string", name: "_name", type: "string" }],
      stateMutability: "view",
      type: "function"
    }
  ];

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

    if (parsedcollections.length > 0) {
      for (let i = 0; i < parsedcollections.length; i++) {
        const ops = {
          contractAddress: parsedcollections[i].newCustomCollection,
          functionName: "name",
          abi: fetchNameABI,
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
    }
  };

  const getCreatedBundle = async () => {
    const res = await getCreatedBundleData(walletAddress);
    const parsedCreatedBundle = await parseCreatedBundleData(res, walletAddress);
    let sliced = parsedCreatedBundle.slice(0, 50);

    if (sliced.length > 0) {
      for (let i = 0; i < sliced.length; i++) {
        const ops = {
          contractAddress: sliced[i].address,
          functionName: "name",
          abi: fetchNameABI,
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
    }
  };

  const getClaimedBundle = async () => {
    const res = await getClaimedBundleData(walletAddress);
    const parsedClaimedBundle = await parseData(res, walletAddress);

    if (parsedClaimedBundle.length > 0) {
      for (let i = 0; i < parsedClaimedBundle.length; i++) {
        const ops = {
          contractAddress: parsedClaimedBundle[i].address,
          functionName: "name",
          abi: fetchNameABI,
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
    }
  };

  const getCreatedBatchBundle = async () => {
    const res = await getCreatedBatchBundleData(walletAddress);
    const parsedCreatedBatchBundle = await parseData(res, walletAddress);
    let sliced = parsedCreatedBatchBundle.slice(0, 100);
    if (sliced.length > 0) {
      setFetchCreatedBatchBundle(sliced);
    }
  };

  useEffect(() => {
    if (!fetchCollections) {
      getCollections();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCollections]);

  useEffect(() => {
    if (!fetchCreatedBundle) {
      getCreatedBundle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCreatedBundle]);

  useEffect(() => {
    if (!fetchCreatedBatchBundle) {
      getCreatedBatchBundle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCreatedBatchBundle]);

  useEffect(() => {
    if (!fetchClaimedBundle) {
      getClaimedBundle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchClaimedBundle]);

  const columns = [
    {
      title: "DATE",
      key: "date",
      dataIndex: "date"
    },
    {
      title: "ITEM / SYMBOL",
      key: "key",
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
      key: "key",
      dataIndex: "collection"
      // render: (collection) => {
      //   if (collection && collection.length > 0) {
      //     <a href={`${getExplorer(chainId)}address/${collection[1]}`} target='_blank' rel='noreferrer noopener'>
      //       {collection[0]}
      //     </a>;
      //   }
      // }
    },
    {
      title: "TYPE",
      key: "key",
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

  const collectionData = fetchCollections?.map((item) => ({
    date: moment(item.updatedAt).format("DD-MM-YYYY HH:mm"),
    collection: item.collectionName,
    item: getEllipsisTxt(item.newNFTsymbol, 6),
    tags: "Collection Created",
    link: item.transaction_hash
  }));

  const createdBundleData = fetchCreatedBundle?.map((item) => ({
    date: moment(item.updatedAt).format("DD-MM-YYYY HH:mm"),
    collection: item.collectionName,
    item: getEllipsisTxt(item.tokenId, 6),
    tags: "Bundle Created",
    link: item.transaction_hash
  }));

  const createBatchBundleData = fetchCreatedBatchBundle?.map((item) => ({
    date: moment(item.updatedAt).format("DD-MM-YYYY HH:mm"),
    collection: item.collectionName,
    item: item.collectionSymbol,
    tags: `Batch-Bundle x${item.amountOfBundle} Created`,
    link: item.transaction_hash
  }));

  const claimedBundleData = fetchClaimedBundle?.map((item) => ({
    date: moment(item.updatedAt).format("DD-MM-YYYY HH:mm"),
    collection: item.collectionName,
    item: getEllipsisTxt(item.tokenId, 6),
    tags: "Bundle Claimed",
    link: item.transaction_hash
  }));

  var data = [];
  data = data.concat(collectionData, createdBundleData, createBatchBundleData, claimedBundleData);
  data = data.sort((a, b) => (a.date < b.date ? 1 : b.date < a.date ? -1 : 0));
  data = data.map((item, index) => ({
    ...item,
    key: index
  }));

  return (
    <>
      <div style={{ marginTop: "60px" }}>
        <div style={styles.table}>
          <Spin
            size='large'
            spinning={!fetchCollections || !fetchCreatedBundle || !fetchCreatedBatchBundle || !fetchClaimedBundle}
          >
            <Table size='middle' columns={columns} dataSource={data} />
          </Spin>
        </div>
      </div>
    </>
  );
}

export default NFTTransactions;