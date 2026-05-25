import CONFIG from "./config";

interface MongoConfig {
  development: {
    uri: string;
    options: Record<string, unknown>;
  };
  production: {
    uri: string;
    options: Record<string, unknown>;
  };
}

const dbConfig: MongoConfig = {
  development: {
    uri: CONFIG.ENV.MONGODB_URI || "mongodb://localhost:27017/dev_db",
    options: {},
  },
  production: {
    uri: CONFIG.ENV.MONGODB_URI || "",
    options: {
      ssl: true,
    },
  },
};

export default dbConfig;
