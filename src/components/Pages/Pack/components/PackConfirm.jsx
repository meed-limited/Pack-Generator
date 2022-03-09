import React, { useEffect, useState } from "react";
import { useMoralis, useNativeBalance } from "react-moralis";
import { getContractName } from "../../../../helpers/generalContractCall";
import { getEllipsisTxt } from "../../../../helpers/formatters";
import { Modal, Table } from "antd";
import styles from "../styles";

const PackConfirm = ({
  isVisible,
  onOk,
  onCancel,
  NFTsArr,
  ethAmount,
  selectedTokens,
  packNumber,
  isBatch,
  ERC1155Number,
  ERC721Number,
  csv
}) => {
  const { chainId } = useMoralis();
  const { nativeToken } = useNativeBalance(chainId);
  const [name, setName] = useState();

  const singleNFTdata =
    !isBatch &&
    NFTsArr?.map((item, key) => ({
      key: key,
      contract_type: item.contract_type,
      name:
        item.contract_type === "ERC1155"
          ? "-"
          : item.name && item.name.length > 15
          ? item.name.slice(0, 15)
          : item.name,
      id: item.token_id.length > 8 ? getEllipsisTxt(item.token_id, 4) : item.token_id,
      amount: item.contract_type === "ERC1155" ? item.amount : "-"
    }));

  useEffect(() => {
    const cleanupFunction = () => {
      if (csv && csv?.filter((item) => item.contract_type === "ERC721").length > 0) {
        const contract_address = csv.filter((item) => item.contract_type === "ERC721")[0].token_address;
        getContractName(contract_address).then(res => {
          setName(res);
        });
        
      }
    }
    cleanupFunction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [csv]);

  const generateBatchNFTdata = () => {
    const ERC721element = {
      contract_type: "ERC721",
      name: name,
      id: "_id_",
      amount: "-"
    };
    const ERC1155element = {
      contract_type: "ERC1155",
      name: "-",
      id: "_id_",
      amount:
        csv &&
        csv.filter((item) => item.contract_type === "ERC1155").length > 0 &&
        csv.filter((item) => item.contract_type === "ERC1155")[0].amount
    };
    let arr = [];
    for (let i = 0; i < ERC721Number; i++) {
      arr = arr.concat(ERC721element);
    }
    for (let i = 0; i < ERC1155Number; i++) {
      arr = arr.concat(ERC1155element);
    }

    return arr?.map((item, key) => ({
      key: key,
      ...item
    }));
  };

  const NFTdata = isBatch ? generateBatchNFTdata() : singleNFTdata;

  const NFTcolumns = [
    {
      title: "Contract type",
      dataIndex: "contract_type",
      key: "key"
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "key"
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "key"
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "key"
    }
  ];

  const selectedTokensData = selectedTokens?.map((item, key) => ({
    key: key, //start after native asset amount
    asset: item.data.symbol,
    amount: item.value
  }));

  var assetsData;
  if (ethAmount && ethAmount > 0)
    assetsData = [
      {
        key: -1,
        asset: nativeToken?.name,
        amount: ethAmount
      },
      ...selectedTokensData
    ];
  else assetsData = selectedTokensData;

  const assetsColumns = [
    {
      title: "Asset",
      dataIndex: "asset",
      key: "key"
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "key"
    }
  ];

  const headerText = isBatch
    ? `You are about to create ${packNumber} packs, each one containing:`
    : "Your pack will contain the following:";

  return (
    <Modal
      title={"Confirm items to pack"}
      visible={isVisible}
      okText='PACK'
      onOk={onOk}
      onCancel={onCancel}
      width='fit-content'
    >
      <div style={{ color: "white", fontSize: "18px", textAlign: "center", paddingBottom: "10px" }}>{headerText}</div>
      <div style={styles.transparentContainerConfirmModal}>
        <div style={{ margin: "10px" }}>
          {NFTdata.length === 0 &&
            (ethAmount === null || ethAmount === 0) &&
            selectedTokens.length === 0 &&
            `Pack${isBatch ? "s" : ""} will be created empty!`}
          {NFTdata && NFTdata.length > 0 && (
            <p>
              <b>NFTs</b>
            </p>
          )}
          {NFTdata && NFTdata.length > 0 && (
            <Table dataSource={NFTdata} columns={NFTcolumns} pagination={false}></Table>
          )}
        </div>
        <div style={{ margin: "10px" }}>
          {((ethAmount && ethAmount > 0) || selectedTokens.length > 0) && (
            <>
              <p>
                <b>ASSETS:</b>
              </p>
              <Table dataSource={assetsData} columns={assetsColumns} pagination={false}></Table>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PackConfirm;
