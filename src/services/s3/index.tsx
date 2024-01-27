import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export type S3Config = {
  clientId: string;
  clientSecret: string;
  bucket?: string;
  region?: string;
};

class S3Service {
  private s3: S3Client;
  private bucket: string;
  private initialized = false;

  constructor(config?: S3Config) {
    if (!config) {
      this.s3 = new S3Client({
        region: "us-east-1",
      });
      this.bucket = "";
      return;
    }

    this.s3 = new S3Client({
      region: config.region ?? "us-east-1",
      credentials: {
        accessKeyId: config.clientId,
        secretAccessKey: config.clientSecret,
      },
    });

    this.bucket = config.bucket ?? "";
  }

  setBucket(bucket: string) {
    this.bucket = bucket;
  }

  getBucket() {
    return this.bucket;
  }

  setConfig(config: S3Config) {
    this.s3 = new S3Client({
      region: config.region ?? "us-east-1",
      credentials: {
        accessKeyId: config.clientId,
        secretAccessKey: config.clientSecret,
      },
    });

    if (config.bucket) {
      this.bucket = config.bucket;
    }

    this.initialized = true;
  }

  isInitialized() {
    return this.initialized;
  }

  async listObjectsCommand(prefix?: string) {
    const command = new ListObjectsCommand({
      Bucket: this.bucket,
      Prefix: prefix,
      Delimiter: "/",
    });

    return this.s3.send(command);
  }

  async deleteObjectCommand(key: string) {
    return this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    );
  }

  async getObjectUrlCommand(key: string) {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    const url = await getSignedUrl(this.s3, command, { expiresIn: 15 * 60 }); // expires in 15 minutes

    return url;
  }

  async putObjectUrlCommand(key: string) {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    const url = await getSignedUrl(this.s3, command, { expiresIn: 15 * 60 }); // expires in 15 minutes

    return url;
  }

  async uploadCommand(
    key: string,
    file: File,
    onProgress: (progress: number) => void
  ) {
    return new Promise((resolve, reject) => {
      const upload = new Upload({
        client: this.s3,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: file,
          ContentType: file.type,
        },
      });

      upload.on("httpUploadProgress", (progress) => {
        if (progress.loaded != null && progress.total != null) {
          onProgress(progress.loaded / progress.total);
        }
      });

      upload.done().then(resolve).catch(reject);
    });
  }
}

export default S3Service;
