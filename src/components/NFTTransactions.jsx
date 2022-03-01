import React, { useEffect, useState } from "react";
import { useMoralisQuery, useWeb3ExecuteFunction } from "react-moralis";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useQueryMoralisDb } from "hooks/useQueryMoralisDb";
import { getEllipsisTxt } from "helpers/formatters";
import { getExplorer } from "helpers/networks";
import { Table, Spin } from "antd";
import moment from "moment";
import styles from "./Pack/styles";
import { FileSearchOutlined } from "@ant-design/icons";

function NFTTransactions() {
  const contractProcessor = useWeb3ExecuteFunction();
  const { walletAddress, chainId } = useMoralisDapp();
  const {
    getCustomCollectionData,
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
  const queryMarketItems = useMoralisQuery("CreatedMarketItems");
  const fetchMarketItems = JSON.parse(JSON.stringify(queryMarketItems.data)).filter(
    (item) => item.sold === true && (item.seller === walletAddress || item.owner === walletAddress)
  );

  const fetchNameABI = [
    {
      inputs: [],
      name: "name",
      outputs: [{ internalType: "string", name: "_name", type: "string" }],
      stateMutability: "view",
      type: "function"
    }
  ];

  const getCollections = async () => {
    const res = await getCustomCollectionData(walletAddress);
    const parsedcollections = await parseData(res, walletAddress);
    setFetchCollections(parsedcollections);
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
    }
    setFetchCreatedPack(sliced);
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
    }
    setFetchClaimedPack(parsedClaimedPack);
  };

  const getCreatedBatchPack = async () => {
    const res = await getCreatedBatchPackData(walletAddress);
    const parsedCreatedBatchPack = await parseData(res, walletAddress);
    let sliced = parsedCreatedBatchPack.slice(0, 100);
    setFetchCreatedBatchPack(sliced);
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
    },
    {
      title: "COLLECTION",
      key: "key",
      dataIndex: "collection"
    },
    {
      title: "TYPE",
      key: "key",
      dataIndex: "tags"
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

  const collectionData = fetchCollections
    ?.map((item) => ({
      date: moment(item.updatedAt).format("YYYY-MM-DD HH:mm"),
      collection: item.name,
      item: item.symbol,
      tags: "Collection Created",
      link: item.transaction_hash
    }))
    .sort((a, b) => (a.date < b.date ? 1 : b.date < a.date ? -1 : 0));

  const createdPackData = fetchCreatedPack
    ?.map((item) => ({
      date: moment(item.updatedAt).format("YYYY-MM-DD HH:mm"),
      collection: item.collectionName,
      item: getEllipsisTxt(item.tokenId, 4),
      tags: "Pack Created",
      link: item.transaction_hash
    }))
    .sort((a, b) => (a.date < b.date ? 1 : b.date < a.date ? -1 : 0));

  const createBatchPackData = fetchCreatedBatchPack?.map((item) => ({
    date: moment(item.updatedAt).format("YYYY-MM-DD HH:mm"),
    collection: item.collectionName.slice(0, 15),
    item: item.collectionSymbol,
    tags: `Batch-Pack x${item.amountOfPack} Created`,
    link: item.transaction_hash
  }));

  const claimedPackData = fetchClaimedPack?.map((item) => ({
    date: moment(item.updatedAt).format("YYYY-MM-DD HH:mm"),
    collection: item.collectionName,
    item: getEllipsisTxt(item.tokenId, 4),
    tags: "Pack Claimed",
    link: item.transaction_hash
  }));

  const marketData = fetchMarketItems?.map((item) => ({
    date: moment(item.updatedAt).format("YYYY-MM-DD HH:mm"),
    collection: item.collectionName,
    item: getEllipsisTxt(item.tokenId, 4),
    tags: item.seller === walletAddress ? "Market sell" : "Market buy",
    link: item.transaction_hash
  }));

  var data = [];
  data = data.concat(collectionData, createdPackData, createBatchPackData, claimedPackData, marketData);
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
            spinning={
              fetchCollections === undefined ||
              fetchCreatedPack === undefined ||
              fetchCreatedBatchPack === undefined ||
              fetchClaimedPack === undefined ||
              marketData === undefined
            }
          >
            <Table size='middle' columns={columns} dataSource={data} />
          </Spin>
        </div>
      </div>
    </>
  );
}

export default NFTTransactions;
