import waitPort from "wait-port";
import * as DynamoDbLocal from "dynamo-db-local";

const PORT = parseInt(process.env.PORT || "4567");

/*
 *  Setup -- start dynamodb instance
 */
export const setup = async () => {
  const dynamodb = DynamoDbLocal.spawn({ port: PORT });
  const result = await waitPort({
    host: "0.0.0.0",
    port: PORT,
    timeout: 20000,
  });
  if (!result.open) {
    throw new Error("Cannot open port: " + PORT);
  }
  process.env.DYNAMODB_PID = String(dynamodb.pid);
  process.env.DYNAMODB_PORT = String(PORT);

  // When Vitest throws anything unhandled, ensure we kill the spawned process
  process.on("unhandledRejection", (_) => {
    const pid = parseInt(process.env.DYNAMODB_PID || "");
    if (pid) {
      process.kill(pid);
    }
  });
};

export const teardown = async () => {
  const pid = parseInt(process.env.DYNAMODB_PID || "");
  if (pid) {
    try {
      process.kill(pid);
    } catch (err) {
      return;
    }
  }
};
