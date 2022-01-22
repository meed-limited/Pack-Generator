import { Form, Input, Button, Space } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

const Erc1155Form = ({ getNFT1155Addresses }) => {
  const onFinish = values => {
    getNFT1155Addresses(values)
    console.log(values);
  };

  return (
    <Form  name="dynamic_form_nest_item" onFinish={onFinish} autoComplete="off">
      <Form.List  name="addresses">      
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Space key={key} style={{ display: 'flex', marginBottom: 0 }} align="baseline">
                <Form.Item 
                  {...restField}
                  label="Enter contract address"
                  name={[name, 'Nftaddress']}
                  rules={[{ required: false }]}
                >
                  <Input placeholder="NFT contract address" />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                Add ERC1155 contract address
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Save ERC1155 addresses
        </Button>
      </Form.Item>
    </Form>
  );
};

export default Erc1155Form;