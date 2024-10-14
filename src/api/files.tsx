import axios from "axios";

const createFile = async (file: object) => {
  const response = await axios.post("/files", file, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

const deleteFile = async (fileId: string) => {
  await axios.delete(`/files/${fileId}`);
};

export { createFile, deleteFile };
