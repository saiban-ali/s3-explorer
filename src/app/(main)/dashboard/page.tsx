"use client";

import useS3Service from "@/hooks/useS3Service";
import {
  DeleteOutlined,
  FileOutlined,
  FolderOutlined,
  InboxOutlined,
  LinkOutlined,
  MoreOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Breadcrumb,
  Button,
  Dropdown,
  Flex,
  GetProp,
  Modal,
  Space,
  Table,
  TableProps,
  Upload,
  UploadProps,
  message,
} from "antd";
import { useRouter } from "next/navigation";
import {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type ColumnsType<T> = TableProps<T>["columns"];

type DataType = {
  name: string;
  type: string;
  size?: number;
  lastModified?: string;
};

const ActionItem: FC<{ label: string; icon?: ReactNode }> = (props) => (
  <Flex align="center" gap={4}>
    {props.icon}
    {props.label}
  </Flex>
);

const actions = [
  {
    key: "delete",
    label: <ActionItem label="Delete" icon={<DeleteOutlined />} />,
  },
  {
    key: "open",
    label: <ActionItem label="Open" icon={<LinkOutlined />} />,
  },
];

const Dashboard = () => {
  const [data, setData] = useState<DataType[]>();
  const [loading, setLoading] = useState(false);
  const [prefixes, setPrefixes] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const router = useRouter();

  const s3Service = useS3Service();

  const onNameClick = useCallback((record: DataType) => {
    if (record.type === "file") {
      handleOpen(record);
      return;
    }

    setPrefixes((prev) => [...prev, record.name]);
  }, []);

  const handleDelete = useCallback((record: DataType) => {
    setLoading(true);
    s3Service
      .sendCommand("deleteObjectCommand", prefixes.join("") + record.name)
      .then(() => {
        setData((prev) => prev?.filter((item) => item.name !== record.name));
      })
      .catch((error) => {
        message.error(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleOpen = useCallback((record: DataType) => {
    s3Service
      .sendCommand("getObjectUrlCommand", prefixes.join("") + record.name)
      .then((url) => {
        window.open(url, "_blank");
      })
      .catch((error) => {
        message.error(error.message);
      });
  }, []);

  const columns: ColumnsType<DataType> = useMemo(
    () => [
      {
        title: "Name",
        dataIndex: "name",
        render: (text, record) => (
          <Space>
            {record.type === "file" ? <FileOutlined /> : <FolderOutlined />}
            <a
              role="button"
              onClick={() => onNameClick(record)}
              style={{ textDecoration: "underline" }}
            >
              {text}
            </a>
          </Space>
        ),
      },
      {
        title: "Type",
        dataIndex: "type",
        width: "20%",
      },
      {
        title: "Size (Bytes)",
        dataIndex: "size",
        width: "20%",
      },
      {
        title: "Last Modified (UTC)",
        dataIndex: "lastModified",
        width: "20%",
      },
      {
        title: "Action",
        dataIndex: "action",
        key: "action",
        fixed: "right",
        align: "center",
        width: "100px",
        render: (_, record) =>
          record.type === "directory" ? null : (
            <Dropdown
              trigger={["click"]}
              menu={{
                items: actions,
                onClick({ key }) {
                  if (key === "delete") {
                    Modal.confirm({
                      title: "Delete file",
                      content:
                        "Are you sure you want to delete this file? Action is irreversible.",
                      icon: <DeleteOutlined style={{ color: "red" }} />,
                      footer: (_, { OkBtn, CancelBtn }) => (
                        <>
                          <CancelBtn />
                          <OkBtn />
                        </>
                      ),
                      onOk() {
                        handleDelete(record);
                      },
                    });
                  } else if (key === "open") {
                    handleOpen(record);
                  }
                },
              }}
            >
              <MoreOutlined />
            </Dropdown>
          ),
      },
    ],
    [handleDelete, handleOpen, onNameClick]
  );

  useEffect(() => {
    setLoading(true);
    try {
      s3Service
        .sendCommand("listObjectsCommand", prefixes.join(""))
        .then((res) => {
          const directories =
            res.CommonPrefixes?.filter((item) => !!item.Prefix).map((item) => ({
              name: item.Prefix!.replace(prefixes.join(""), ""),
              type: "directory",
            })) ?? [];

          const files =
            res.Contents?.filter(
              (item) => !!item.Key?.replace(prefixes.join(""), "")
            ).map((item) => ({
              name: item.Key!.replace(prefixes.join(""), ""),
              type: item.Key?.split(".").at(-1) || "file",
              size: item.Size,
              lastModified: item.LastModified?.toISOString(),
            })) ?? [];
          setData([...directories, ...files]);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      message.error((error as Error).message);
      if ((error as Error).message === "Could not initialize S3 Service") {
        router.push("/");
      }
    }
  }, [prefixes]);

  const draggerProps: UploadProps = useMemo(
    () => ({
      name: "file",
      multiple: true,
      customRequest: (options) => {
        const file = options.file as File;
        s3Service
          .sendCommand(
            "uploadCommand",
            prefixes.join("") + file.name,
            file,
            (progress) => {
              options.onProgress?.({ percent: progress });
            }
          )
          .then(() => {
            setData((prev) => [
              ...(prev ?? []),
              {
                name: file.name,
                type: file.type,
                size: file.size,
                lastModified: new Date(file.lastModified).toISOString(),
              },
            ]);
            options.onSuccess?.(null);
          })
          .catch((error) => {
            options.onError?.(error);
          });
      },
      onChange(info) {
        const { status } = info.file;
        if (status !== "uploading") {
          console.log(info.file, info.fileList);
        }
        if (status === "done") {
          message.success(`${info.file.name} file uploaded successfully.`);
        } else if (status === "error") {
          message.error(
            `${info.file.name} file upload failed. ${info.file.error.message}`
          );
        }
      },
    }),
    [prefixes, s3Service]
  );

  return (
    <Space direction="vertical" size={16}>
      <Breadcrumb
        separator={<span style={{}}>/</span>}
        items={[
          {
            title: (
              <a
                onClick={() => {
                  setPrefixes([]);
                }}
              >
                {s3Service.getBucket()}
              </a>
            ),
          },
          ...prefixes.map((prefix, index) => ({
            title:
              index === prefixes.length - 1 ? (
                <span>{prefixes.at(-1)?.slice(0, -1)}</span>
              ) : (
                <a
                  onClick={() => {
                    setPrefixes((prev) => prev.slice(0, index + 1));
                  }}
                >
                  {prefix.slice(0, -1)}
                </a>
              ),
          })),
        ]}
      />
      <Flex justify="flex-end">
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          Upload
        </Button>
      </Flex>
      <Table
        columns={columns}
        rowKey={(record) => record.name}
        dataSource={data}
        loading={loading}
        sticky={{ offsetHeader: 64 }}
      />
      <Modal
        centered
        title="Upload files"
        open={isModalOpen}
        footer={null}
        onCancel={() => {
          setIsModalOpen(false);
        }}
        destroyOnClose
        maskClosable
      >
        <Upload.Dragger {...draggerProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
          <p className="ant-upload-hint">
            Support for a single or bulk upload. Strictly prohibited from
            uploading company data or other banned files.
          </p>
        </Upload.Dragger>
      </Modal>
    </Space>
  );
};

export default Dashboard;
