import { WorkspaceModel, WorkspacesPaginationOptions } from "../model"
import axios from "axios";

interface Workspace {
  id: string;
  name: string;
  file_id: string;
}

const converToWorkspaceModel = (workspace: Workspace): WorkspaceModel => {
  return {
    id: workspace.id,
    name: workspace.name,
    fileId: workspace.file_id,
  };
};

const convertToWorkspace = (workspace: WorkspaceModel): Workspace => {
  return {
    id: workspace.id,
    name: workspace.name,
    file_id: workspace.fileId,
  };
};

const createWorkspace = async (workspace: WorkspaceModel) => {
  const response = await axios.post(
    "/workspaces",
    convertToWorkspace(workspace)
  );
  return response.data;
};

const fetchWorkspaces = async (
  paginationOptions: WorkspacesPaginationOptions
) => {
  let filter = `?`;
  if (!(paginationOptions.offset < 0)) {
    filter += `offset=${paginationOptions.offset}&`;
  }

  if (!(paginationOptions.limit < 0)) {
    filter += `limit=${paginationOptions.limit}`;
  }
  let response = await axios.get<Array<Workspace>>("/workspaces" + filter);
  let workspaces = response.data || [];
  return [
    workspaces.map((workspace) => converToWorkspaceModel(workspace)),
    parseInt(response.headers["x-total-count"]),
  ];
};

const updateWorkspace = async (workspace: WorkspaceModel) => {
  await axios.patch(
    `workspaces/${workspace.id}`,
    convertToWorkspace(workspace)
  );
};

export { createWorkspace, fetchWorkspaces, updateWorkspace };
