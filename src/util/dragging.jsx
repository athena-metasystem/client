const dragg = ({note, eventX, eventY}) => {
    note.x = note.x + eventX - note.clickX;
    note.y = note.y + eventY - note.clickY;
    note.clickX = eventX
    note.clickY = eventY;
}

export default dragg;
