"use client";

import { ConfigProvider, Layout } from "antd";
import { FC, PropsWithChildren } from "react";

const AppLayout: FC<PropsWithChildren> = (props) => {
  const { children } = props;

  return (
    <Layout className="layout">
      <ConfigProvider theme={{ token: { colorPrimary: "#001529" } }}>
        {children}
      </ConfigProvider>
    </Layout>
  );
};

export default AppLayout;
