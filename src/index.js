import Processor from "./processor.js";
import Poller from "./models/poller";
import logger from "./helpers/logger";
import Mempool from "./mempool.js";
import DB from "./db";
import app from "./app";
import events from "./events";

process.env.NODE_ENV = "development";

// create poller obj
const poller = new Poller(global.gConfig.poll_interval);

// create processor obj
const processor = new Processor();
const mempool = new Mempool();

// start api server
const server = app.listen(global.gConfig.port, () => {
  DB.AddGenesisState();
  processor.start(poller);
  mempool.StartSync();
  events();

  logger.info("Started listening for transactions", {
    port: global.gConfig.port
  });
});

// handle interruption
process.on("SIGINT", async () => {
  console.log("Received interruption stopping receiver...");
  process.exit();
});

// check for unhandledRejection
process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
});
