import S3Service, { S3Config } from "@/services/s3";
import SessionStorage from "@/services/sessionStorage";
import { useCallback } from "react";

const service = new S3Service();

type ExtractMethodNamesThatEndsWith<T, U extends string> = {
  [K in keyof T]: K extends `${infer Prefix}${U}` ? K : never;
}[keyof T];

type Command = ExtractMethodNamesThatEndsWith<S3Service, "Command">;

const useS3Service = () => {
  const sendCommand = useCallback(
    <C extends Command, D extends Parameters<(typeof service)[C]>>(
      command: C,
      ...args: D
    ): ReturnType<(typeof service)[C]> => {
      if (!service.isInitialized()) {
        initialize();
      }

      // @ts-ignore
      return service[command](...args);
    },
    []
  );

  const initialize = useCallback(() => {
    const clientId = SessionStorage.get("clientId");
    const clientSecret = SessionStorage.get("clientSecret");
    const region = SessionStorage.get("region") ?? "us-east-1";
    const bucket = SessionStorage.get("bucket");

    if (clientId && clientSecret && bucket) {
      service.setConfig({
        clientId,
        clientSecret,
        region,
        bucket,
      });
    } else {
      throw new Error("Could not initialize S3 Service");
    }
  }, []);

  const setConfig = useCallback((config: S3Config) => {
    service.setConfig(config);
    SessionStorage.set("clientId", config.clientId);
    SessionStorage.set("clientSecret", config.clientSecret);
    SessionStorage.set("region", config.region);
    SessionStorage.set("bucket", config.bucket);
  }, []);

  const setBucket = useCallback((bucket: string) => {
    service.setBucket(bucket);
    SessionStorage.set("bucket", bucket);
  }, []);

  const getBucket = useCallback(() => {
    return service.getBucket();
  }, []);

  return {
    sendCommand,
    setConfig,
    setBucket,
    getBucket,
    initialize,
  };
};

export default useS3Service;
