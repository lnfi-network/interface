import { Typography } from "antd";
const { Text } = Typography;
const EllipsisMiddle = ({
  suffixCount,
  children,
  copyable = true,
  suffixCountMore = 2,
  suffixEnable = true,
  handleClick,
  className
}) => {
  const formatChildren = suffixEnable && (children?.length > suffixCount * 2 + suffixCountMore)
    ? `${children.substring(
      0,
      suffixCount + suffixCountMore
    )}...${children.substring(children.length - suffixCount)}`
    : children;
  return (
    <Text
      style={{
        maxWidth: "100%",
      }}
      className={className || ""}
      copyable={
        copyable
          ? {
            text: children,
          }
          : false
      }
      onClick={() => handleClick && handleClick()}
    >
      {formatChildren}
    </Text>
  );
};
export default EllipsisMiddle;
