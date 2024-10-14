interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

const detectCollision = (rect1: Rect, rect2: Rect): boolean =>
  rect1.left < rect2.right &&
  rect1.right > rect2.left &&
  rect1.top < rect2.bottom &&
  rect1.bottom > rect2.top;

export default detectCollision ;
