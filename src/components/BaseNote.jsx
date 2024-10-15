import {
  createEffect,
  createMemo,
} from "solid-js";
import {
  noteModelToView
} from "../model";
import dragg from "../util/dragging";
import { getBorderCollision } from "../util/border";
import detectCollision from "../util/collistions";
import { checkIfInRange } from "../util/common";

const BaseNote = (props) => {
  const noteView = props.noteView;
  const setNoteView = props.setNoteView;

  createMemo(() => {
    const selectionArea = props.selectionArea();
    setNoteView((prev) => ({
      ...prev,
      ...noteModelToView(props.note, props.workspace),
      isSelected: (selectionArea != null
        ? detectCollision(
            {
              left: selectionArea.start[0],
              right: selectionArea.end[0],
              top: selectionArea.start[1],
              bottom: selectionArea.end[1],
            },
            {
              left: prev.x,
              right: prev.x + prev.width,
              top: prev.y,
              bottom: prev.y + prev.height,
            }
          )
        : prev.isSelected),
    }));
  });

  createEffect(() => {
    if (noteView().isSelected && props.selectionArea() === null) {
      props.selectNote();
    } else {
      props.cancelSelection();
    }
  });

  const handleMouseDown = (event) => {
    if (event.button != 0) return;
    const note = { ...noteView(), zIndex: 2 };

    const eventX =
      (event.x - props.workspace.relativeX) / props.workspace.scale;
    const eventY =
      (event.y - props.workspace.relativeY) / props.workspace.scale;

    const handleMouseMove = (event) => {
      const eventX =
        (event.x - props.workspace.relativeX) / props.workspace.scale;
      const eventY =
        (event.y - props.workspace.relativeY) / props.workspace.scale;

      if (props.workspace.isDragging) {
        dragg({ note, eventX, eventY });
      } else if (props.workspace.isResizing) {
        props.resize(note, eventX, eventY);
      }

      props.note.x = Math.round(
        note.x +
          props.workspace.x +
          props.workspace.relativeX / props.workspace.scale
      );
      props.note.y = Math.round(
        note.y +
          props.workspace.y +
          props.workspace.relativeY / props.workspace.scale
      );
      props.note.width = Math.round(note.width);
      props.note.height = Math.round(note.height);

      setNoteView({ ...note });
      props.setNote(props.note);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      note.zIndex = 1;

      setNoteView({ ...note });
      props.workspace.isDragging = false;
      props.workspace.isResizing = false;
      document.body.style.cursor = "default";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    if (
      note.border.north ||
      note.border.south ||
      note.border.west ||
      note.border.east
    ) {
      props.workspace.isResizing = true;
    } else if (
      checkIfInRange(eventX, note.x, note.x + note.width) &&
      checkIfInRange(eventY, note.y, note.y + note.height)
    ) {
      props.workspace.isDragging = true;
      note.clickX = eventX;
      note.clickY = eventY;
      document.body.style.cursor = "move";
    }
    setNoteView({ ...note });
  };

  const handleMouseMove = () => {
    const note = { ...noteView() };

    if (!props.workspace.isDragging && !props.workspace.isResizing) {
      note.border = getBorderCollision(note, props.workspace);
      let cursor;
      if (
        (note.border.north && note.border.west) ||
        (note.border.south && note.border.east)
      ) {
        cursor = "nwse-resize";
      } else if (
        (note.border.north && note.border.east) ||
        (note.border.south && note.border.west)
      ) {
        cursor = "nesw-resize";
      } else if (note.border.west || note.border.east) {
        cursor = "ew-resize";
      } else if (note.border.north || note.border.south) {
        cursor = "ns-resize";
      } else {
        cursor = "default";
      }
      document.body.style.cursor = cursor;
      setNoteView({ ...note });
    }
  };

  return (
    <div
      class={"note absolute p-[10px]"}
      style={{
        left: `${noteView().x - 10}px`,
        top: `${noteView().y - 10}px`,
        "z-index": noteView().zIndex,
      }}
      onmousemove={handleMouseMove}
      onmousedown={handleMouseDown}
    >
      {props.children}
    </div>
  );
};

export default BaseNote;
