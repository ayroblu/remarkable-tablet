import { spawn } from "child_process";

import { moveMouse } from "./mouse";
import { checkRemarkable, getDevice, handleChunkStateful } from "./remarkable";
import { makeState, State } from "./state";
import { chunkBuffer } from "./utils";

async function run(rmHost = "remarkable") {
  const rmModel = checkRemarkable(rmHost);
  console.log(rmModel);
  const device = getDevice(rmModel);

  // Primary ssh stream connection, stays open until closed
  const command = `ssh -o ConnectTimeout=2 ${rmHost} cat ${device}`;
  const child = spawn(command, {
    shell: true,
  });
  child.on("close", () => {
    console.log("Disconnected from ReMarkable.");
    process.exit();
  });

  const state = makeState(onStateChange);
  const handleChunk = handleChunkStateful(state);

  for await (const multiChunk of child.stdout) 
    chunkBuffer(multiChunk as Buffer, 16).forEach(handleChunk);
  
}
const onStateChange = ({ x, y, pressure }: State) =>
  moveMouse(x, y, pressure > 0);

run().catch(console.error);
