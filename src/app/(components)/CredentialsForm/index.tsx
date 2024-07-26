"use client";

import useS3Service from "@/hooks/useS3Service";
import {
  DatabaseOutlined,
  IdcardOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { Button, Form, Input } from "antd";
import { useRouter } from "next/navigation";
import { FC } from "react";

const CredentialsForm: FC = () => {
  const s3Service = useS3Service();
  const router = useRouter();

  const onFinish = async (values: any) => {
    const { clientId, clientSecret, bucket, host, region } = values;
    s3Service.setConfig({ clientId, clientSecret, bucket, host, region });

    router.push("/dashboard");
  };

  return (
    <Form name="connect" onFinish={onFinish} initialValues={{}}>
      <Form.Item
        name="clientId"
        rules={[{ required: true, message: "Please input Client ID!" }]}
      >
        <Input prefix={<IdcardOutlined />} placeholder="Client ID" />
      </Form.Item>
      <Form.Item
        name="clientSecret"
        rules={[{ required: true, message: "Please input Client Secret!" }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          type="password"
          placeholder="Client Secret"
        />
      </Form.Item>
      <Form.Item
        name="bucket"
        rules={[{ required: true, message: "Please input bucket name!" }]}
      >
        <Input prefix={<DatabaseOutlined />} placeholder="Bucket Name" />
      </Form.Item>
      <Form.Item name="host">
        <Input placeholder="Host" />
      </Form.Item>
      <Form.Item name="region">
        <Input placeholder="Region" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
          Connect
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CredentialsForm;
