import { Select } from "antd";
import { useNetworkCollections } from "hooks/useNetworkCollections";
import { useEffect } from "react";

function SearchCollections({ setInputValue }) {
  const { Option } = Select;
  const { NFTCollections } = useNetworkCollections();

  function onChange(value) {
    setInputValue(value);
  }

  return (
    <>
      <Select
        showSearch
        style={{ width: "300px" }}
        placeholder='Find a Collection'
        optionFilterProp='children'
        onChange={onChange}
      >
        {NFTCollections &&
          NFTCollections.map((collection, i) => (
            <Option value={collection.addrs} key={i}>
              {collection.name}
            </Option>
          ))}
      </Select>
    </>
  );
}
export default SearchCollections;
