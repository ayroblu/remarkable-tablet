import { execSync } from "child_process";

import _ from "lodash";

import { makeState } from "./state";
import { bufferedGet, printToConsole } from "./utils";

// const maxMeta = {
//   rm2: {
//     maxX: 20966,
//     maxY: 15725,
//     maxPressure: 4095,
//   },
// };
const offsets = {
  minX: 2000,
  maxX: 18000,
  minY: 1000,
  maxY: 13000,
};

export const mapSubScreenPosToPct = (
  x: number,
  y: number,
  isMouseDown: boolean
): null | { x: number; y: number } => {
  const { minX, maxX, minY, maxY } = offsets;
  const diffX = maxX - minX;
  const diffY = maxY - minY;

  if (!isMouseDown && (x < minX || x > maxX || y < minY || y > maxY))
    return null;

  if (x < minX) x = minX;
  else if (x > maxX) x = maxX;
  if (y < minY) y = minY;
  else if (y > maxY) y = maxY;
  return {
    x: (x - minX) / diffX,
    y: (y - minY) / diffY,
  };
};

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
  const [typ] = b;
  const code = bufferedGet(b, 2) + bufferedGet(b, 3) * 0x100;
  const val =
    bufferedGet(c, 0) +
    bufferedGet(c, 1) * 0x100 +
    bufferedGet(c, 2) * 0x10_000 +
    bufferedGet(c, 3) * 0x1000_000;
  if (typ === 3)
    if (code === 0) state.setState({ x: val });
    else if (code === 1) state.setState({ y: val });
    else if (code === 24) state.setState({ pressure: val });

  // const { x, y, pressure } = state.getState();
  // printToConsole(`x = ${x}, y = ${y}, pressure = ${pressure}`);
  // x = 20966, y = 15725, pressure = 4095
};

export const handleTouchChunkStateful = (
  state: ReturnType<typeof makeState>
) => (chunk: Buffer) => {
  if (chunk.length !== 16) {
    console.log("Length is actually: ", chunk.length, " - skipping");
    return;
  }
  // const timestamp = chunk.slice(0, 4);
  // const a = chunk.slice(4, 8);
  const b = chunk.slice(8, 12);
  const c = chunk.slice(12, 16);
  const [typ] = b;
  const code = bufferedGet(b, 2) + bufferedGet(b, 3) * 0x100;
  const val =
    bufferedGet(c, 0) +
    bufferedGet(c, 1) * 0x100 +
    bufferedGet(c, 2) * 0x10_000 +
    bufferedGet(c, 3) * 0x1000_000;
  if (typ === 3) {
    switch (code) {
      case 25:
        state.setState({ touch25: val });
        break;
      case 47:
        // Which finger
        state.setState({ touch47: val });
        break;
      case 48:
        // 8 or 17?
        state.setState({ touch48: val });
        break;
      case 49:
        // 8 or 17?
        state.setState({ touch49: val });
        break;
      case 52:
        // Type of touch? Like down, drag or?
        state.setState({ touch52: val });
        break;
      case 53:
        // Y
        state.setState({ touch53: val });
        break;
      case 54:
        // X
        state.setState({ touch54: val });
        break;
      case 55:
        state.setState({ touch55: val });
        break;
      case 57:
        // Num touches or max int when letting go?
        state.setState({ touch57: val });
        break;
      case 58:
        // Pressure
        state.setState({ touch58: val });
        break;
    }

    const { x, y, pressure, ...touchStates } = state.getState();
    printToConsole(
      JSON.stringify(_.mapKeys(touchStates, (_v, k) => k.slice(5)))
    );
    // x = 20966, y = 15725, pressure = 4095
  }
};

export function getPenDevice(rmModel: string) {
  switch (rmModel) {
    case "reMarkable 1.0":
      return "/dev/input/event0";
    case "reMarkable 2.0":
      return "/dev/input/event1";
    default:
      throw new Error(`Unsupported reMarkable Model: ${rmModel}`);
  }
}
export function getTouchDevice(rmModel: string) {
  switch (rmModel) {
    case "reMarkable 1.0":
      return "/dev/input/event1";
    case "reMarkable 2.0":
      return "/dev/input/event2";
    default:
      throw new Error(`Unsupported reMarkable Model: ${rmModel}`);
  }
}
