import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const streamUpload = (fileBuffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(result);
    });

    stream.end(fileBuffer);
  });

export const uploadBufferToCloudinary = async ({
  buffer,
  folder,
  resourceType = "image"
}) =>
  streamUpload(buffer, {
    folder,
    resource_type: resourceType
  });

export default cloudinary;

