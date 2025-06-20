import { Request, response, Response } from "express";
import { S3Client, PutObjectCommand,GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";



interface S3uploadElement {
  key: string;
  contentType: string;
}


class S3uploadController {
  static async index(req: Request, res: Response) {

    try{

    const body:S3uploadElement=req.body;

    const key=body.key;
    const contentType=body.contentType;

    
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    ContentType: contentType,
  });

  
  const url = await getSignedUrl(s3, command, { expiresIn: 60 }); // 60 sec
  res.status(200).json({"url":url})

    }
    catch(error){
      res.status(500).json(error.message)
    }

  }


  
static async get(req: Request, res: Response) {

     try {
      const fullUrl = req.query.key as string;

      if (!fullUrl) {
        return res.status(400).json({ error: "Missing key" });
      }

    //  return res.json({fullUrl})

      // ✅ Extract just the S3 object key after the bucket URL
      const urlObj = new URL(fullUrl);
      const key = urlObj.pathname.startsWith("/") ? urlObj.pathname.slice(1) : urlObj.pathname;

      console.log("Extracted S3 Key:", key); // uploads/...

      const client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY!,
          secretAccessKey: process.env.AWS_SECRET_KEY!,
        },
      });

      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
      });

      const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });

      res.json({ signedUrl });
    } catch (error: any) {
      console.error("Error generating signed URL:", error);
      res.status(500).json({
        error: error?.message || "Internal Server Error",
      });
    }
}
}

export default S3uploadController;
