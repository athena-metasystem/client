import { NoteModel, NotesSearchOptions } from "../model";
import axios from "axios";

interface Note {
  id: string;
  position: [number, number];
  size: [number, number];
  body: string;
  file_id: string;
  dtype: string;
  workspace_id: string;
}

const convertToNote = (note: NoteModel): Note => {
  return {
    id: note.id,
    position: [note.x, note.y],
    size: [note.width, note.height],
    body: note.body,
    file_id: note.fileId,
    dtype: note.dtype,
    workspace_id: note.workspaceId,
  };
};

const convertToNoteModel = (note: Note): NoteModel => {
  return {
    id: note.id,
    x: note.position[0],
    y: note.position[1],
    width: note.size[0],
    height: note.size[1],
    body: note.body,
    dtype: note.dtype,
    fileId: note.file_id,
    workspaceId: note.workspace_id,
  };
};

const createNote = async (note: NoteModel) => {
  const response = await axios.post("/notes", convertToNote(note));
  return response.data;
};

const fetchNotes = async (searchOptions: NotesSearchOptions) => {
  const range = searchOptions.range;
  let filter =
    range != undefined
      ? `?x=${range.start[0]}:${range.end[0]}&y=${range.start[1]}:${range.end[1]}`
      : "?";
  filter += searchOptions.workspaceId
    ? `&workspaceId=${searchOptions.workspaceId}`
    : "";

  let notes = (await axios.get<Array<Note>>("/notes" + filter)).data || [];

  return notes.map((note) => convertToNoteModel(note));
};

const updateNote = async (note: NoteModel) => {
  await axios.put(`/notes/${note.id}`, convertToNote(note));
};

const deleteNote = async (noteId: string) => {
  await axios.delete(`/notes/${noteId}`);
};

export { createNote, fetchNotes, updateNote, deleteNote };
