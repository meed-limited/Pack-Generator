import React, { useEffect, useState } from "react";
import { useMoralis, useMoralisQuery } from "react-moralis";
import { useQueryMoralisDb } from "hooks/useQueryMoralisDb";
import { getEllipsisTxt } from "helpers/formatters";
import { getExplorer } from "helpers/networks";
import { getContractName } from "helpers/generalContractCall";
import { Table, Spin } from "antd";
import moment from "moment";
import styles from "./Pack/styles";
import { FileSearchOutlined } from "@ant-design/icons";
import ChainVerification from "components/Chains/ChainVerification";

function Transactions() {
  const { account, chainId, isAuthenticated } = useMoralis();
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
    (item) => item.sold === true && (item.seller === account || item.owner === account)
  );

  const getCollections = async () => {
    const res = await getCustomCollectionData(account);
    const parsedcollections = await parseData(res, account);
    setFetchCollections(parsedcollections);
  };

  const getCreatedPack = async () => {
    const res = await getCreatedPackData(account);
    const parsedCreatedPack = await parseCreatedPackData(res, account);
    let sliced = parsedCreatedPack.slice(0, 50);

    if (sliced.length > 0) {
      for (let i = 0; i < sliced.length; i++) {
        const res = await getContractName(sliced[i].address);
        sliced[i].collectionName = res;
      }
    }
    setFetchCreatedPack(sliced);
  };

  const getClaimedPack = async () => {
    const res = await getClaimedPackData(account);
    const parsedClaimedPack = await parseData(res, account);

    if (parsedClaimedPack.length > 0) {
      for (let i = 0; i < parsedClaimedPack.length; i++) {
        const res = await getContractName(parsedClaimedPack[i].address);
        parsedClaimedPack[i].collectionName = res;
      }
    }
    setFetchClaimedPack(parsedClaimedPack);
  };

  const getCreatedBatchPack = async () => {
    const res = await getCreatedBatchPackData(account);
    const parsedCreatedBatchPack = await parseData(res, account);
    let sliced = parsedCreatedBatchPack.slice(0, 100);
    setFetchCreatedBatchPack(sliced);
  };

  useEffect(() => {
    const cleanupFunction1 = () => {
      if (!fetchCollections) {
        getCollections();
      }
    };
    cleanupFunction1();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCollections]);

  useEffect(() => {
    const cleanupFunction2 = () => {
      if (!fetchCreatedPack) {
        getCreatedPack();
      }
    };
    cleanupFunction2();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCreatedPack]);

  useEffect(() => {
    const cleanupFunction3 = () => {
      if (!fetchCreatedBatchPack) {
        getCreatedBatchPack();
      }
    };
    cleanupFunction3();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchCreatedBatchPack]);

  useEffect(() => {
    const cleanupFunction4 = () => {
      if (!fetchClaimedPack) {
        getClaimedPack();
      }
    };
    cleanupFunction4();
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
    tags: item.seller === account ? "Market sell" : "Market buy",
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
      {!isAuthenticated && (
        <div style={styles.transparentContainerNotconnected}>
          <p style={{ textAlign: "center" }}>Connect your wallet to show your transactions history.</p>
        </div>
      )}
      <ChainVerification />
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

export default Transactions;
