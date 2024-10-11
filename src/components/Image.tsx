import { Accessor, Component } from 'solid-js';
import { NoteView, NoteModel, Range } from "../model";

interface ImageProps {
  selectionRange: Accessor<Range>;
	noteView: Accessor<NoteView>;
	note: NoteModel;
}

const Image: Component<ImageProps> = (props: ImageProps) => {
  const noteView = props.noteView;

  return (
    <img
      class='max-w-none max-h-none'
      src={`http://localhost:80/api/files/${props.note.fileId}`}
      width={noteView().width + "px"}
      height={noteView().height + "px"}
      style={{
        border: noteView().isSelected
        && props.selectionRange() === null ? "1px solid #ff4d00" : "none"
      }} draggable="false">
    </img>
  )
}

export default Image;
