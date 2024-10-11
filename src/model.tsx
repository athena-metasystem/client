interface NotesSearchOptions {
  range: Range
  workspaceId: string
}

interface WorkspacesPaginationOptions {
  offset: number;
  limit: number;
}

interface Range {
  start: [number, number];
  end: [number, number];
}

interface NoteModel {
  id: string;
  x: number;
  y: number;
  width: number; 
  height: number;
  body: string;
  fileId: string;
  dtype: string;
  workspaceId: string;
}

interface WorkspaceModel {
  id: string;
  name: string;
  fileId: string;
}

interface NoteView {
  x: number;
  y: number;
  width: number; 
  height: number;
  zIndex: number;
  clickX: number;
  clickY: number;
  border: BorderCollision;
  isSelected: true;
}

interface BorderCollision {
  north: true,
  south: true,
  west: true, 
  east: true
}

interface WorkspaceView {
  x: number;
  y: number;
  relativeX: number;
  relativeY: number;
  width: number;
  height: number;
  mouseX: number;
  mouseY: number;
  scale: number;
  isDragging: true;  
  isResizing: true;  
  isTyping: true;
}

const noteModelToView = (note: NoteModel, workspace: WorkspaceView) => {
  return {
    x: note.x - workspace.x - workspace.relativeX / workspace.scale,
    y: note.y - workspace.y - workspace.relativeY / workspace.scale,
    width: note.width,
    height: note.height
  }
}

export {
   NotesSearchOptions, WorkspacesPaginationOptions, Range, WorkspaceModel,
   NoteModel, NoteView, WorkspaceView, BorderCollision, noteModelToView 
}
