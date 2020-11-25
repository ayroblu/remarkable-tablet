import { execSync } from "child_process";
import { makeState } from "state";
import { bufferedGet, printToConsole } from "utils";

export function checkRemarkable(rmHost: string) {
  try {
    const result = execSync(
      `ssh -o ConnectTimeout=2 ${rmHost} cat /proc/device-tree/model`,
      { encoding: "utf-8" }
    );
    return result.slice(0, 14);
  } catch (err) {
    console.error(
      `Error: Can't connect to reMarkable table on hostname : ${rmHost}`
    );
    process.exit(1);
  }
}

export const handleChunkStateful = (state: ReturnType<typeof makeState>) => (
  chunk: Buffer
) => {
  if (chunk.length !== 16) {
    console.log("Length is actually: ", chunk.length, " - skipping");
    return;
  }
  // const timestamp = chunk.slice(0, 4);
  // const a = chunk.slice(4, 8);
  const b = chunk.slice(8, 12);
  const c = chunk.slice(12, 16);
  const typ = b[0];
  const code = bufferedGet(b, 2) + bufferedGet(b, 3) * 0x100;
  const val =
    bufferedGet(c, 0) +
    bufferedGet(c, 1) * 0x100 +
    bufferedGet(c, 2) * 0x10_000 +
    bufferedGet(c, 3) * 0x1000_000;
  if (typ === 3) {
    if (code === 0) {
      state.setState({ x: val });
    } else if (code === 1) {
      state.setState({ y: val });
    } else if (code === 24) {
      state.setState({ pressure: val });
    }
    const { x, y, pressure } = state.getState();
    printToConsole(`x = ${x}, y = ${y}, pressure = ${pressure}`);
    // x = 20966, y = 15725, pressure = 4095
  }
};

export function getDevice(rmModel: string) {
  switch (rmModel) {
    case "reMarkable 1.0":
      return "/dev/input/event0";
    case "reMarkable 2.0":
      return "/dev/input/event1";
    default:
      throw new Error(`Unsupported reMarkable Device: ${rmModel}`);
  }
}
