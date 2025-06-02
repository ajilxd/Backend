import AWS from "aws-sdk";
import { NextFunction, Request, Response } from "express";


AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: 's3uploader' });

const s3 = new AWS.S3({
  region: "eu-north-1",
  endpoint: new AWS.Endpoint("s3.eu-north-1.amazonaws.com"),
  signatureVersion: "v4",
});

export const getPresignedUploadUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { filename } = req.query;
  const fileType = req.query["fileType"];
  if (!filename || typeof filename !== "string") {
    return res.status(400).json({ error: "Filename is required" });
  }

  const params = {
    Bucket: "fluentawork-assets",
    Key: filename,
    Expires: 300,
    ContentType: fileType,
  };

  try {
    const url = await s3.getSignedUrlPromise("putObject", params);
    res.status(200).json({ url });
  } catch (err) {
    console.error("Error generating URL:", err);
    res.status(500).json({ error: "Failed to generate URL" });
  }
};
