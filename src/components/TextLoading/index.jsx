import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
const antIcon = (
  <LoadingOutlined
    // style={{
    //   fontSize: 14,
    // }}
    spin
  />
);
const TextLoading = () => <Spin size='small' indicator={antIcon} />;
export default TextLoading;