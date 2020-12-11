import robot from "robotjs";

// Speed up the mouse.
robot.setMouseDelay(2);

export function moveMouse(x: number, y: number, isClicked: boolean) {
  if (isClicked) 
    robot.dragMouse(x, y);
   else 
    robot.moveMouse(x, y);
  
}
