import { NoteModel, NotesSearchOptions, Range, WorkspaceModel, WorkspacesPaginationOptions } from "./model"
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

interface Workspace {
  id: string;
  name: string;
  file_id: string;
}

const convertToNote = (note: NoteModel): Note => {
  return {
    id: note.id,
    position: [note.x, note.y],
    size: [note.width, note.height],
    body: note.body,
    file_id: note.fileId,
    dtype: note.dtype,
    workspace_id: note.workspaceId
  }
}

const convertToNoteModel = (note: Note): NoteModel => {
  return {
    id: note.id,
    x: note.position[0], y: note.position[1],
    width: note.size[0], height: note.size[1],
    body: note.body,
    dtype: note.dtype,
    fileId: note.file_id,
    workspaceId: note.workspace_id
  };
} 

const converToWorkspaceModel = (workspace: Workspace): WorkspaceModel => {
  return {
    id: workspace.id, 
    name: workspace.name,
    fileId: workspace.file_id
  }
}

const convertToWorkspace = (workspace: WorkspaceModel): Workspace => {
  return {
    id: workspace.id,
    name: workspace.name,
    file_id: workspace.fileId
  }
}

const fetchNotes = async (searchOptions: NotesSearchOptions) => {
  const range = searchOptions.range;
  let filter = range != undefined ? `?x=${range.start[0]}:${range.end[0]}&y=${range.start[1]}:${range.end[1]}`: "?";
  filter += searchOptions.workspaceId ? `&workspaceId=${searchOptions.workspaceId}` : "";
  
  let notes = (await axios.get<Array<Note>>("/notes" + filter)).data || []

  return notes.map(note => convertToNoteModel(note));
};
  
const createNote = async (note: NoteModel) => {
  const response = await axios.post("/notes", convertToNote(note));
  return response.data;
};
  
const deleteNote = async (noteId: string) => {
  await axios.delete(`/notes/${noteId}`);
}

const updateNote = async (note: NoteModel) => {
  await axios.put(`/notes/${note.id}`, convertToNote(note));
}

const createFile = async (file: object) => {
  const response = await axios.post("/files", file, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
}

const deleteFile = async (fileId: string) => {
  await axios.delete(`/files/${fileId}`);
}

const createWorkspace = async (workspace: WorkspaceModel) => {
  const response = await axios.post("/workspaces", convertToWorkspace(workspace));
  return response.data;
}

const fetchWorkspaces = async (paginationOptions: WorkspacesPaginationOptions) => { 
  let filter = `?`
  if (!(paginationOptions.offset < 0)) {
    filter += `offset=${paginationOptions.offset}&`
  }

  if (!(paginationOptions.limit < 0)) {
    filter += `limit=${paginationOptions.limit}`
  }
  let response = (await axios.get<Array<Workspace>>("/workspaces" + filter));
  let workspaces = response.data || []
  return [workspaces.map(workspace => converToWorkspaceModel(workspace)), parseInt(response.headers["x-total-count"])];
}

const updateWorkspace = async (workspace: WorkspaceModel) => {
  await axios.patch(`workspaces/${workspace.id}`, convertToWorkspace(workspace));
}
export {fetchNotes, createNote, deleteNote, updateNote, createFile, deleteFile, createWorkspace, fetchWorkspaces, updateWorkspace};
