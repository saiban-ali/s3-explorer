"use client";

import useS3Service from "@/hooks/useS3Service";
import SessionStorage from "@/services/sessionStorage";
import { Button, Flex, Layout } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FC, PropsWithChildren, useEffect } from "react";

const { Header, Content } = Layout;

const MainLayout: FC<PropsWithChildren> = (props) => {
  const { children } = props;

  const router = useRouter();

  return (
    <main>
      <Header
        style={{
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Flex align="center" gap={16}>
          <Image width={50} height={50} src="/logo.svg" alt="logo" />
          <h1 style={{ margin: 0 }}>S3 Explorer</h1>
        </Flex>
        <Button
          type="default"
          onClick={() => {
            SessionStorage.clear();
            router.push("/");
          }}
        >
          Disconnect
        </Button>
      </Header>
      <Layout style={{ padding: "24px 50px", background: "transparent" }}>
        <Content>{children}</Content>
      </Layout>
    </main>
  );
};

export default MainLayout;
