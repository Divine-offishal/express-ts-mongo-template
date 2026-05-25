import cloudinary from "../config/cloudinaryConfig";

const MediaService = {
  async uploadSingle(file: Express.Multer.File): Promise<string> {
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: "auto", folder: "uploads" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(file.buffer);
    });

    return result.secure_url;
  },

  async uploadMultiple(files: Express.Multer.File[]): Promise<string[]> {
    const uploads = files.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              { resource_type: "auto", folder: "uploads" },
              (error, result) => {
                if (error) return reject(error);
                if (!result?.secure_url) return reject(new Error("Upload failed: no URL returned"));
                resolve(result.secure_url);
              }
            )
            .end(file.buffer);
        })
    );
    return Promise.all(uploads);
  },
};

export default MediaService;
