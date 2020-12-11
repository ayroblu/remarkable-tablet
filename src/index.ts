import { ChildProcessWithoutNullStreams, spawn } from "child_process";

import { moveMousePercentage } from "./mouse";
import {
  checkRemarkable,
  getPenDevice,
  getTouchDevice,
  handleChunkStateful,
  handleTouchChunkStateful,
  mapSubScreenPosToPct,
} from "./remarkable";
import { makeState, State } from "./state";
import { chunkBuffer } from "./utils";

async function run(rmHost = "remarkable") {
  const rmModel = checkRemarkable(rmHost);
  console.log(rmModel);
  const device = getPenDevice(rmModel);
  const touchDevice = getTouchDevice(rmModel);

  // Primary ssh stream connection, stays open until closed
  const penStream = shellStreamDevice(rmHost, device);
  const touchStream = shellStreamDevice(rmHost, touchDevice);

  const state = makeState(onStateChange);
  const handleChunk = handleChunkStateful(state);
  const handleTouchChunk = handleTouchChunkStateful(state);

  handleStream(penStream, handleChunk);
  handleStream(touchStream, handleTouchChunk);
}
async function handleStream(
  stream: ChildProcessWithoutNullStreams,
  handleChunk: (chunk: Buffer) => void
) {
  for await (const multiChunk of stream.stdout)
    chunkBuffer(multiChunk as Buffer, 16).forEach(handleChunk);
}

function shellStreamDevice(rmHost: string, device: string) {
  const command = `ssh -o ConnectTimeout=2 ${rmHost} cat ${device}`;
  const child = spawn(command, {
    shell: true,
  });
  child.on("close", () => {
    console.log("Disconnected from ReMarkable.");
    process.exit();
  });
  return child;
}
const onStateChange = ({ x, y, pressure }: State) => {
  const isMouseDown = pressure > 0;
  const posPct = mapSubScreenPosToPct(x, y, isMouseDown);
  if (!posPct) return;
  moveMousePercentage(posPct.x, posPct.y, isMouseDown);
};

run().catch(console.error);
