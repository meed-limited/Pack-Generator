import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useMoralis } from "react-moralis";
import { useMoralisDb } from "hooks/useMoralisDb";
import { Tooltip, Select, Space, Switch, Spin } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import "../../../../style.css";
import styles from "../styles";
import Text from "antd/lib/typography/Text";
import CollectionFactory from "./CollectionFactory";

const CollectionSelector = forwardRef(({ customCollectionInfo }, ref) => {
  const { account } = useMoralis();
  const { getCustomCollectionData, parseData } = useMoralisDb();
  const [displayFactory, setDisplayFactory] = useState(false);
  const [isExistingCollection, setIsExistingCollection] = useState(false);
  const [customCollection, setCustomCollection] = useState([]);
  const [currentCollection, setCurrentCollection] = useState({});
  const [name, setName] = useState();
  const [symbol, setSymbol] = useState();
  const [supply, setSupply] = useState(0);
  const [description, setDescription] = useState("");
  const [waiting, setWaiting] = useState(false);
  const { Option } = Select;

  const getCustomCollections = async () => {
    const res = await getCustomCollectionData(account);
    const parsedcollections = await parseData(res, account);
    setCustomCollection(parsedcollections);
  };

  useEffect(() => {
    getCustomCollections();
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (value, option) => {
    if (value === undefined) {
      handleDeselect();
    } else {
      const current = {
        name: option.option.name,
        image: option.option.image,
        maxSupply: option.option.maxSupply,
        collectionAddress: option.option.collectionAddress,
        description: option.option.description,
        metadataURI: option.option.metadataURI,
        symbol: option.option.symbol,
      };
      setIsExistingCollection(true);
      setCurrentCollection(current);
      customCollectionInfo(current);
      setName(value[0]);
      setDescription(value[4]);
    }
  };

  const handleDeselect = () => {
    setIsExistingCollection(false);
    setCurrentCollection({});
    setDisplayFactory(false);
    customCollectionInfo();
    setName();
    setSymbol();
    setDescription();
    setSupply(0);
  };

  const handleSwitch = () => {
    !displayFactory ? setDisplayFactory(true) : setDisplayFactory(false);
  };

  useImperativeHandle(ref, () => ({
    reset() {
      setIsExistingCollection(false);
      setCurrentCollection({});
      setDisplayFactory(false);
      customCollectionInfo();
      setName();
      setSymbol();
      setDescription();
    },
  }));

  return (
    <div style={styles.transparentContainerInside}>
      <Spin style={{ borderRadius: "20px" }} spinning={waiting} size="large">
        {!displayFactory && (
          <>
            <Select
              allowClear={true}
              placeholder="Pick an existing collection"
              optionFilterProp="children"
              optionLabelProp="label"
              onChange={handleChange}
              onDeselect={handleDeselect}
              style={{ width: "70%", marginTop: "20px" }}
            >
              {customCollection &&
                customCollection?.map((collection, i) => (
                  <Option
                    key={i}
                    value={collection.name}
                    option={collection}
                    label={
                      <div style={{ display: "inline-flex", alignItems: "center" }}>
                        <img
                          src={collection.image}
                          alt=""
                          style={{ width: "20px", height: "20px", borderRadius: "4px", marginRight: "5px" }}
                        />
                        <div>{collection.name}</div>
                      </div>
                    }
                  >
                    <Space size="middle">
                      <>
                        <img
                          src={collection.image}
                          alt=""
                          style={{ width: "30px", height: "30px", borderRadius: "4px" }}
                        />
                        <span>{collection.name}</span>
                      </>
                    </Space>
                  </Option>
                ))}
            </Select>
            {!isExistingCollection && (
              <div style={{ fontSize: "12px", margin: "20px", justifyContent: "center" }}>
                <p>OR</p>
              </div>
            )}
          </>
        )}

        {!isExistingCollection && !currentCollection.name?.length > 0 && (
          <>
            <div style={{ fontSize: "17px", margin: "20px", justifyContent: "center" }}>
              <span>Create a new collection: </span>
              <Tooltip
                title="Create your very own pack collection from scratch ! Define the name, symbol, supply and description. Leave blanck to use our default collection."
                style={{ position: "absolute", top: "35px", right: "80px" }}
              >
                <QuestionCircleOutlined style={{ color: "white", paddingLeft: "15px" }} />
              </Tooltip>
              <Switch style={{ marginLeft: "30px" }} size="small" defaultChecked={false} onChange={handleSwitch} />
            </div>

            {displayFactory && (
              <CollectionFactory
                name={name}
                setName={setName}
                symbol={symbol}
                setSymbol={setSymbol}
                supply={supply}
                setSupply={setSupply}
                description={description}
                setDescription={setDescription}
                setWaiting={setWaiting}
                setCurrentCollection={setCurrentCollection}
                customCollectionInfo={customCollectionInfo}
              />
            )}
          </>
        )}
      </Spin>

      {currentCollection && currentCollection.name?.length > 0 && (
        <>
          <div
            style={{
              ...styles.transparentContainerInside,
              display: "flex",
              flexDirection: "column",
              margin: "20px",
              padding: "20px",
            }}
          >
            <Text style={{ fontSize: "20px" }}>Selected collection:</Text>
            <p style={{ fontSize: "15px", marginTop: "15px" }}>
              Name: <span style={{ color: "yellow" }}>{currentCollection?.name}</span>
              <br></br>
              Max supply:{" "}
              <span style={{ color: "yellow" }}>
                {currentCollection?.maxSupply === 0 ? "Unlimited" : currentCollection?.maxSupply}
              </span>
              <br></br>
              Address: <span style={{ color: "yellow" }}>{currentCollection?.collectionAddress}</span>
              <br></br>
              <br></br>
            </p>

            <p style={{ textAlign: "center", fontSize: "16px" }}>
              Click on the button "NEXT" to start preparing your packs's content.
            </p>
          </div>
        </>
      )}

      {!displayFactory && !currentCollection.name?.length && (
        <p style={{ fontSize: "12px", marginTop: "30px", letterSpacing: "1px", fontWeight: "300", padding: "0 20px" }}>
          *Just leave everything blank and click on "NEXT" if you simply want to use our integrated PGNFT collection.
        </p>
      )}
    </div>
  );
});

CollectionSelector.displayName = "CollectionSelector";
export default CollectionSelector;
