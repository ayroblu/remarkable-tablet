import { spawn } from "child_process";
import { checkRemarkable, getDevice, handleChunkStateful } from "remarkable";
import { makeState } from "state";
import { chunkBuffer } from "utils";

async function run(rmHost = "remarkable") {
  const rmModel = checkRemarkable(rmHost);
  console.log(rmModel);
  const device = getDevice(rmModel);
  const command = `ssh -o ConnectTimeout=2 ${rmHost} cat ${device}`;
  const child = spawn(command, {
    shell: true,
  });
  child.on("close", () => {
    console.log("Disconnected from ReMarkable.");
    process.exit();
  });
  const state = makeState();
  const handleChunk = handleChunkStateful(state);
  for await (const multiChunk of child.stdout) {
    chunkBuffer(multiChunk as Buffer, 16).forEach(handleChunk);
  }
}
run().catch(console.error);
