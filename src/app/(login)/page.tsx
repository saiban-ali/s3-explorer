import CredentialsForm from "@/app/(components)/CredentialsForm";
import { Card, Flex } from "antd";
import Image from "next/image";

export default function Home() {
  return (
    <Flex
      align="center"
      justify="center"
      style={{ flex: 1, background: "#001529" }}
    >
      <Card
        style={{
          width: 500,
          textAlign: "center",
        }}
      >
        <Image width={180} height={125} src="/logo-full.svg" alt="logo" />
        <h3 style={{ marginTop: 0 }}>
          <b>
            <i>Connect, explore, conquer</i>
          </b>
        </h3>
        <CredentialsForm />
      </Card>
    </Flex>
  );
}
