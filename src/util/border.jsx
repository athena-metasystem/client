import { checkIfInRange } from "./common";

const checkIfBorderCollision = (border, mousePos, lowerLimit, upperLimit) => {
  return checkIfInRange(mousePos[0], border - 2, border + 2) && checkIfInRange(mousePos[1], lowerLimit, upperLimit);
}
  
const getBorderCollision = (note, workspace) => {
  let border = {north: false, south: false, west: false, east: false};
  const mouseX = (workspace.mouseX - workspace.relativeX) / workspace.scale;
  const mouseY = (workspace.mouseY - workspace.relativeY) / workspace.scale;

  border.north = checkIfBorderCollision(note.y, [mouseY, mouseX], note.x, note.x + note.width);
  border.south = checkIfBorderCollision(note.y + note.height, [mouseY, mouseX], note.x, note.x + note.width);
  border.west = checkIfBorderCollision(note.x, [mouseX, mouseY], note.y, note.y + note.height);
  border.east = checkIfBorderCollision(note.x + note.width, [mouseX, mouseY], note.y, note.y + note.height);
    
  return border;
}

export { getBorderCollision };
