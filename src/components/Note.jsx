import { noteModelToView } from '../model';
import { Switch, Match, createSignal } from 'solid-js';
import Text from './Text'
import BaseNote from "./BaseNote";
import Image from './Image'
import Video from './Video'
import { proportionResize, resize } from "../util/resizing";

const Note= (props) => {
  const [noteView, setNoteView] = createSignal({
    zIndex: 1,
    clickX: 0,
    clickY: 0,
    border: { north: false, west: false, south: false, east: false },
    isSelected: false,
    ...noteModelToView(props.note, props.workspace)
  });

  let dtype = props.note.dtype;

  return <>
    <Switch fallback={dtype}>
      <Match when={dtype == "text"}>
        <BaseNote {...props} noteView={noteView} setNoteView={setNoteView} resize={resize}>
          <Text workspace={props.workspace} selectionArea={props.selectionArea} noteView={noteView} note={props.note} setNote={props.setNote}/>
        </BaseNote>
      </Match>
      <Match when={dtype == "image"}>
        <BaseNote {...props} noteView={noteView} setNoteView={setNoteView} resize={proportionResize}>
          <Image selectionArea={props.selectionArea} noteView={noteView} note={props.note}/>
        </BaseNote>
      </Match>
      <Match when={dtype == "video"}>
        <BaseNote {...props} noteView={noteView} setNoteView={setNoteView} resize={proportionResize}>
          <Video selectionArea={props.selectionArea} noteView={noteView} note={props.note}/>
        </BaseNote>
      </Match>
    </Switch>
  </>
}

export default Note;
