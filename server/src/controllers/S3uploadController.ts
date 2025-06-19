import { Request, Response } from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
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
}

export default S3uploadController;
