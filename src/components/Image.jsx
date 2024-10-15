const Image = (props) => {
  const noteView = props.noteView;

  return (
    <img
      class="max-w-none max-h-none"
      src={`http://localhost:80/api/files/${props.note.fileId}`}
      width={noteView().width + "px"}
      height={noteView().height + "px"}
      style={{
        border:
          noteView().isSelected && props.selectionArea() === null
            ? "1px solid #ff4d00"
            : "none",
      }}
      draggable="false"
    ></img>
  );
};

export default Image;
