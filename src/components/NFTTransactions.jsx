import React, { useEffect, useState } from "react";
import { useMoralisQuery, useWeb3ExecuteFunction } from "react-moralis";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useQueryMoralisDb } from "hooks/useQueryMoralisDb";
import { getEllipsisTxt } from "helpers/formatters";
import { getExplorer } from "helpers/networks";
import { Table, Tag, Space, Spin } from "antd";
import moment from "moment";
import styles from "./Pack/styles";
import { FileSearchOutlined } from "@ant-design/icons";

function NFTTransactions() {
  const contractProcessor = useWeb3ExecuteFunction();
  const { walletAddress, chainId } = useMoralisDapp();
  const {
    getCreatedCollectionData,
    getCreatedPackData,
    getCreatedBatchPackData,
    getClaimedPackData,
    parseData,
    parseCreatedPackData
  } = useQueryMoralisDb();

  const [fetchCollections, setFetchCollections] = useState();
  const [fetchCreatedPack, setFetchCreatedPack] = useState();
  const [fetchCreatedBatchPack, setFetchCreatedBatchPack] = useState();
  const [fetchClaimedPack, setFetchClaimedPack] = useState();
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

  const getCreatedPack = async () => {
    const res = await getCreatedPackData(walletAddress);
    const parsedCreatedPack = await parseCreatedPackData(res, walletAddress);
    let sliced = parsedCreatedPack.slice(0, 50);

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
      setFetchCreatedPack(sliced);
    }
  };

  const getClaimedPack = async () => {
    const res = await getClaimedPackData(walletAddress);
    const parsedClaimedPack = await parseData(res, walletAddress);

    if (parsedClaimedPack.length > 0) {
      for (let i = 0; i < parsedClaimedPack.length; i++) {
        const ops = {
          contractAddress: parsedClaimedPack[i].address,
          functionName: "name",
          abi: fetchNameABI,
          params: {}
        };

        await contractProcessor.fetch({
          params: ops,
          onSuccess: async (response) => {
            parsedClaimedPack[i].collectionName = response;
          },
          onError: (error) => {
            console.log(error);
          }
        });
      }
      setFetchClaimedPack(parsedClaimedPack);
    }
  };

  const getCreatedBatchPack = async () => {
    const res = await getCreatedBatchPackData(walletAddress);
    const parsedCreatedBatchPack = await parseData(res, walletAddress);
    let sliced = parsedCreatedBatchPack.slice(0, 100);
    if (sliced.length > 0) {
      setFetchCreatedBatchPack(sliced);
    }
  };

  useEffect(() => {
    if (!fetchCollections) {
      getCollections();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCollections]);

  useEffect(() => {
    if (!fetchCreatedPack) {
      getCreatedPack();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCreatedPack]);

  useEffect(() => {
    if (!fetchCreatedBatchPack) {
      getCreatedBatchPack();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCreatedBatchPack]);

  useEffect(() => {
    if (!fetchClaimedPack) {
      getClaimedPack();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchClaimedPack]);

  const columns = [
    {
      title: "DATE",
      key: "date",
      dataIndex: "date"
    },
    {
      title: "ID / SYMBOL",
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

  const createdPackData = fetchCreatedPack?.map((item) => ({
    date: moment(item.updatedAt).format("DD-MM-YYYY HH:mm"),
    collection: item.collectionName,
    item: getEllipsisTxt(item.tokenId, 4),
    tags: "Pack Created",
    link: item.transaction_hash
  }));

  const createBatchPackData = fetchCreatedBatchPack?.map((item) => ({
    date: moment(item.updatedAt).format("DD-MM-YYYY HH:mm"),
    collection: item.collectionName.slice(0, 15),
    item: item.collectionSymbol,
    tags: `Batch-Pack x${item.amountOfPack} Created`,
    link: item.transaction_hash
  }));

  const claimedPackData = fetchClaimedPack?.map((item) => ({
    date: moment(item.updatedAt).format("DD-MM-YYYY HH:mm"),
    collection: item.collectionName,
    item: getEllipsisTxt(item.tokenId, 4),
    tags: "Pack Claimed",
    link: item.transaction_hash
  }));

  var data = [];
  data = data.concat(collectionData, createdPackData, createBatchPackData, claimedPackData);
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
            spinning={!fetchCollections || !fetchCreatedPack || !fetchCreatedBatchPack || !fetchClaimedPack}
          >
            <Table size='middle' columns={columns} dataSource={data} />
          </Spin>
        </div>
      </div>
    </>
  );
}

export default NFTTransactions;
