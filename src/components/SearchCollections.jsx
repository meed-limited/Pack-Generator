import { Select, Space } from "antd";
import { useNetworkCollections } from "hooks/useNetworkCollections";

function SearchCollections({ setInputValue, inputValue }) {
  const { Option } = Select;
  const { NFTCollections } = useNetworkCollections();

  function onChange(value) {
    setInputValue(value);
  }

  return (
    <>
      <Select
        showSearch
        value={inputValue}
        placeholder='Find a Collection'
        optionFilterProp='children'
        optionLabelProp='label'
        onChange={onChange}
        style={{ width: "300px" }}
      >
        {NFTCollections &&
          NFTCollections?.map((collection, i) => (
            <Option
              value={collection.addrs}
              key={i}
              option={collection}
              label={
                <div style={{ display: "inline-flex", alignItems: "center" }}>
                  <img
                    src={collection.image}
                    alt=''
                    style={{ width: "20px", height: "20px", borderRadius: "4px", marginRight: "5px" }}
                  />
                  <div>{collection.name}</div>
                </div>
              }
            >
              <Space size='middle'>
                <>
                  <img src={collection.image} alt='' style={{ width: "30px", height: "30px", borderRadius: "4px" }} />
                  <span>{collection.name}</span>
                </>
              </Space>
            </Option>
          ))}
      </Select>
    </>
  );
}
export default SearchCollections;
