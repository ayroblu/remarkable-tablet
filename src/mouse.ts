import robot from "robotjs";

// Speed up the mouse.
robot.setMouseDelay(0);
const { width, height } = robot.getScreenSize();

const moveMouseDebounced = (diff: number) => {
  const metadata = {
    lastCalled: new Date().getTime(),
    isMouseDown: false,
  };
  return (xPct: number, yPct: number, isClicked: boolean) => {
    const now = new Date().getTime();
    if (metadata.lastCalled + diff > now) return;
    metadata.lastCalled = now;

    const x = xPct * width;
    const y = yPct * height;
    if (!metadata.isMouseDown && isClicked) {
      robot.mouseToggle("down");
      metadata.isMouseDown = true;
    }
    if (metadata.isMouseDown && !isClicked) {
      robot.mouseToggle("up");
      metadata.isMouseDown = false;
    }
    if (isClicked) robot.dragMouse(x, y);
    else robot.moveMouse(x, y);
  };
};
export const moveMousePercentage = moveMouseDebounced(10);
