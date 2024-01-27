import { Flex, Spin } from "antd";
import { FC, PropsWithChildren } from "react";

const Loading: FC<PropsWithChildren> = (props) => {
  const { children } = props;

  return (
    <Flex style={{ height: "100vh" }} align="center" justify="center">
      <Spin spinning={true}>{children}</Spin>
    </Flex>
  );
};

export default Loading;
