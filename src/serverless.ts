import { createProbot } from "probot";
import { findPrivateKey } from "probot/lib/private-key";
import { config } from "dotenv";

config();

const defaultOptions = {
  id: process.env.APP_ID,
  secret: process.env.WEBHOOK_SECRET,
  cert: findPrivateKey()
};

const serverless = (apps: any, options?: any) => {
  options = { ...defaultOptions, ...options };
  const probot = createProbot(options);
  apps = [].concat(apps); //  Coerce to array
  apps.forEach((a: any) => probot.load(a));
  return probot.server;
};

export default serverless;
