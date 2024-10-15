import axios from "axios";

const converToWorkspaceModel = (workspace) => {
  return {
    id: workspace.id,
    name: workspace.name,
    fileId: workspace.file_id,
  };
};

const convertToWorkspace = (workspace) => {
  return {
    id: workspace.id,
    name: workspace.name,
    file_id: workspace.fileId,
  };
};

const createWorkspace = async (workspace) => {
  const response = await axios.post(
    "/workspaces",
    convertToWorkspace(workspace)
  );
  return response.data;
};

const fetchWorkspaces = async (paginationOptions) => {
  let filter = `?`;
  if (!(paginationOptions.offset < 0)) {
    filter += `offset=${paginationOptions.offset}&`;
  }

  if (!(paginationOptions.limit < 0)) {
    filter += `limit=${paginationOptions.limit}`;
  }
  let response = await axios.get("/workspaces" + filter);
  let workspaces = response.data || [];
  return [
    workspaces.map((workspace) => converToWorkspaceModel(workspace)),
    parseInt(response.headers["x-total-count"]),
  ];
};

const updateWorkspace = async (workspace) => {
  await axios.patch(
    `workspaces/${workspace.id}`,
    convertToWorkspace(workspace)
  );
};

export { createWorkspace, fetchWorkspaces, updateWorkspace };
