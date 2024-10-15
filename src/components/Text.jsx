const Text = (props) => {
  const noteView = props.noteView;
  let textarea;

  const handleInput = () => {
    props.note.body = textarea.value;
    props.setNote(props.note);
  };

  const handleFocus = () => {
    props.workspace.isTyping = true;
  };

  const handleFocusOut = () => {
    props.workspace.isTyping = false;
  };

  return (
    <div
      style={{
        width: `${noteView().width}px`,
        height: `${noteView().height}px`,
        background: "#252525",
        border:
          noteView().isSelected && props.selectionArea() === null
            ? "1px solid #ff4d00"
            : "none",
      }}
    >
      <textarea
        onInput={handleInput}
        onFocus={handleFocus}
        onFocusOut={handleFocusOut}
        ref={textarea}
        style={{
          "font-size": 15 + "px",
          padding: 20 + "px",
        }}
        class="resize-none text-zinc-400 w-full h-full bg-transparent focus:outline-none"
      >
        {props.note.body}
      </textarea>
    </div>
  );
};

export default Text;
