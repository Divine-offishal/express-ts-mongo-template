import dotenv from "dotenv";

dotenv.config({ path: ".env", debug: true, override: true });

interface Config {
  ENV: {
    PORT: number;
    MONGODB_URI?: string;
    JWT_SECRET?: string;
    APP_NAME?: string;
    EMAIL_USER?: string;
    EMAIL_PASSWORD?: string;
    EMAIL_HOST?: string;
    EMAIL_PORT_OUT?: string;
    FROM_EMAIL?: string;
    CLOUDINARY_CLOUD_NAME?: string;
    CLOUDINARY_API_KEY?: string;
    CLOUDINARY_API_SECRET?: string;
  };
}

const CONFIG: Config = {
  ENV: {
    PORT: parseInt(process.env.PORT ?? "5005"),
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    APP_NAME: process.env.APP_NAME,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT_OUT: process.env.EMAIL_PORT_OUT,
    FROM_EMAIL: process.env.FROM_EMAIL,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  },
};

export default CONFIG;
