import {
  createSignal,
  createResource,
  For,
  Show,
  onMount,
  createMemo,
  untrack,
} from "solid-js";
import { fetchNotes, updateNote, deleteNote, createNote } from "../api/notes";
import { createFile, deleteFile } from "../api/files";
import { calculateRange, checkIfRangeForUpdate } from "../util/range";
import { getVideoDimensions } from "../util/files";
import Note from "../components/Note";
import Cookies from "js-cookie";
import SelectionBox from "../components/SelectionArea";
import WorkspaceList from "../components/WorkspacesList";
import { useParams } from "@solidjs/router";

const Workspace = () => {
  const params = useParams();
  const id = params.id;

  const workspace = {
    x: Math.round(-window.outerWidth * 0.5),
    y: Math.round(-window.outerHeight * 0.5),
    relativeX: 0,
    relativeY: 0,
    width: window.outerWidth,
    height: window.outerHeight,
    mouseX: 0,
    mouseY: 0,
    scale: 1.0,
    isDragging: false,
    isResizing: false,
    isTyping: false,
  };

  const [fetchedNotes, setFetchedNotes] = createSignal([]);
  const [searchOptions, setSearchOptions] = createSignal();
  const [selectionArea, setSelectionArea] = createSignal(null);
  const [isWorkspacesShown, setIsWorkspacesShown] = createSignal(false);
  const [selectedNotes, setSelectedNotes] = createSignal(
    new Set()
  );

  let workspacesListAction = "move";

  const [notes, { mutate }] = createResource(
    searchOptions,
    async (searchOptions, { value }) => {
      let newNotes = await fetchNotes(searchOptions);
      value = value || [];

      const filteredNewNotes = newNotes.filter(
        (newNote) =>
          !value.some((existingNote) => existingNote.id === newNote.id)
      );

      try {
        return [...value, ...filteredNewNotes].sort(
          (a, b) => parseInt(a.id) - parseInt(b.id)
        );
      } finally {
        setFetchedNotes(newNotes);
      }
    }
  );

  createMemo(() => {
    let newNotes = [...(untrack(notes) || [])];

    const ids = newNotes
      .map((note) => note.id)
      .filter(
        (id) => !fetchedNotes().some((fetchedNote) => fetchedNote.id === id)
      );

    for (let id of ids) {
      newNotes = newNotes.filter((item) => item.id !== id);
    }
    mutate(newNotes.sort((a, b) => +a.id - +b.id));
  });

  const cookies = JSON.parse(Cookies.get(id) || "{}");
  workspace.x = cookies["x"] || workspace.x;
  workspace.y = cookies["y"] || workspace.y;
  workspace.scale = cookies["scale"] || workspace.scale;

  setSearchOptions({
    range: calculateRange(workspace),
    workspaceId: id,
  });

  document.addEventListener("mousedown", (event) => {
    if (isWorkspacesShown()) {
      return;
    }

    if (event.button != 0) return;

    let isMoved = false;
    setSelectionArea(undefined);

    let startX = (event.x - workspace.relativeX) / workspace.scale;
    let startY = (event.y - workspace.relativeY) / workspace.scale;

    const handleMouseMove = (event) => {
      isMoved = true;

      let x = (event.x - workspace.relativeX) / workspace.scale;
      let y = (event.y - workspace.relativeY) / workspace.scale;

      setSelectionArea(undefined);
      setSelectionArea({
        start: [Math.min(startX, x), Math.min(startY, y)],
        end: [Math.max(startX, x), Math.max(startY, y)],
      });
    };

    if (!(workspace.isDragging || workspace.isResizing)) {
      document.addEventListener("mousemove", handleMouseMove);
    }

    document.addEventListener("mouseup", function handleMouseUp() {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      setSelectionArea(isMoved ? null : undefined);
    });
  });

  document.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
    },
    { passive: false }
  );

  onMount(() => {
    const workspaceDOM = document.getElementById("workspace");
    const rect = workspaceDOM.getBoundingClientRect();
    document.documentElement.style.setProperty(
      "--workspace-left",
      -rect.x / workspace.scale + "px"
    );
    document.documentElement.style.setProperty(
      "--workspace-top",
      -rect.y / workspace.scale + "px"
    );
    document.documentElement.style.setProperty(
      "--workspace-width",
      workspace.width / workspace.scale + "px"
    );
    document.documentElement.style.setProperty(
      "--workspace-height",
      workspace.height / workspace.scale + "px"
    );

    workspaceDOM.addEventListener("mousemove", (event) => {
      workspace.mouseX = event.x;
      workspace.mouseY = event.y;
      if (!workspace.isResizing && !workspace.isDragging) {
        document.body.style.cursor = "default";
      }
    });

    workspaceDOM.addEventListener(
      "wheel",
      (event) => {
        const workspaceDOM = document.getElementById("workspace");
        event.preventDefault();
        document.body.style.cursor = "default";

        if (event.ctrlKey) {
          let delta = Math.round(event.deltaY) * -0.01;

          if (workspace.scale + delta >= 0.1 || delta > 0) {
            let rect = workspaceDOM.getBoundingClientRect();
            workspace.relativeX +=
              ((event.x - rect.x) * -delta) / workspace.scale;
            workspace.relativeY +=
              ((event.y - rect.y) * -delta) / workspace.scale;
            workspace.x +=
              event.x * (1 / workspace.scale - 1 / (workspace.scale + delta));
            workspace.y +=
              event.y * (1 / workspace.scale - 1 / (workspace.scale + delta));

            workspace.scale = workspace.scale + delta;

            workspaceDOM.style.transform = `scale(${workspace.scale})`;
            workspaceDOM.style.left = workspace.relativeX + "px";
            workspaceDOM.style.top = workspace.relativeY + "px";

            rect = workspaceDOM.getBoundingClientRect();
            document.documentElement.style.setProperty(
              "--workspace-left",
              -rect.x / workspace.scale + "px"
            );
            document.documentElement.style.setProperty(
              "--workspace-top",
              -rect.y / workspace.scale + "px"
            );
            document.documentElement.style.setProperty(
              "--workspace-width",
              workspace.width / workspace.scale + "px"
            );
            document.documentElement.style.setProperty(
              "--workspace-height",
              workspace.height / workspace.scale + "px"
            );

            if (workspace.scale < 1) {
              setSearchOptions({
                range: calculateRange(workspace),
                workspaceId: id,
              });
            }
          }
        } else {
          workspace.relativeX -= event.deltaX;
          workspace.relativeY -= event.deltaY;
          workspace.x += event.deltaX / workspace.scale;
          workspace.y += event.deltaY / workspace.scale;
          workspaceDOM.style.left = workspace.relativeX + "px";
          workspaceDOM.style.top = workspace.relativeY + "px";
          const rect = workspaceDOM.getBoundingClientRect();
          document.documentElement.style.setProperty(
            "--workspace-left",
            -rect.x / workspace.scale + "px"
          );
          document.documentElement.style.setProperty(
            "--workspace-top",
            -rect.y / workspace.scale + "px"
          );

          if (checkIfRangeForUpdate(workspace, searchOptions().range)) {
            setSearchOptions({
              range: calculateRange(workspace),
              workspaceId: id,
            });
          }
        }
        Cookies.set(
          id,
          JSON.stringify({
            x: workspace.x,
            y: workspace.y,
            scale: workspace.scale,
          })
        );
      },
      { passive: false }
    );
  });

  const handleAddNote = async (mouseX, mouseY) => {
    let note = {
      id: undefined,
      x: mouseX - 100,
      y: mouseY - 50,
      width: 200,
      height: 100,
      body: "",
      fileId: "",
      dtype: "text",
      workspaceId: id,
    };
    createNote(note).then((response) => {
      note.id = response.noteId;
      mutate([...notes(), note]);
    });
  };

  document.addEventListener("keypress", (event) => {
    if (
      ["c", "\u0441"].includes(event.key.toLowerCase()) &&
      !workspace.isTyping &&
      !isWorkspacesShown()
    ) {
      handleAddNote(
        Math.round(workspace.mouseX / workspace.scale + workspace.x),
        Math.round(workspace.mouseY / workspace.scale + workspace.y)
      );
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Backspace") {
      let newNotes = [...notes()];

      for (let id of selectedNotes()) {
        const note = newNotes.find((item) => item.id === id);
        if (note.fileId) {
          deleteFile(note.fileId);
        }
        newNotes = newNotes.filter((item) => item.id !== id);
        deleteNote(id);
      }
      mutate(newNotes);
      setSelectedNotes(new Set());
    } else if (event.key == "m" && !workspace.isTyping) {
      workspacesListAction = "move";
      setIsWorkspacesShown((prev) => !prev);
    } else if (event.key == "t" && !workspace.isTyping) {
      workspacesListAction = "transfer";
      setIsWorkspacesShown((prev) => !prev);
    }
  });

  document.addEventListener("dragover", (event) => {
    event.preventDefault();
  });

  document.addEventListener("drop", async (event) => {
    event.preventDefault();

    if (isWorkspacesShown()) {
      return;
    }

    const files = event.dataTransfer.files;
    let dtype;
    let width;
    let height;
    if (files[0].type.startsWith("image")) {
      dtype = "image";
      const bmp = await createImageBitmap(files[0]);
      ({ width, height } = bmp);
    } else if (files[0].type.startsWith("video")) {
      dtype = "video";
      ({ width, height } = await getVideoDimensions(files[0]));
    } else if (files[0].type.startsWith("audio")) {
      dtype = "audio";
    } else if (files[0].type.startsWith("application")) {
      dtype = "file";
    }

    let formData = new FormData();
    formData.append("file", files[0]);
    const data = await createFile(formData);
    let note = {
      id: undefined,
      x: Math.round(
        workspace.mouseX / workspace.scale + workspace.x - width * 0.5
      ),
      y: Math.round(
        workspace.mouseY / workspace.scale + workspace.y - height * 0.5
      ),
      width: Math.round(width),
      height: Math.round(height),
      body: "",
      fileId: data["fileId"],
      dtype: dtype,
      workspaceId: id,
    };
    let response = await createNote(note);
    note.id = response.noteId;
    mutate([...notes(), note]);
  });

  document.addEventListener("paste", async () => {
    if (isWorkspacesShown()) {
      return;
    }

    const data = await navigator.clipboard.read();
    data.forEach((item) => {
      item.types.forEach(async (mimeType) => {
        if (mimeType.startsWith("image")) {
          const blob = await item.getType(mimeType);
          const bmp = await createImageBitmap(blob);
          const { width, height } = bmp;

          let formData = new FormData();
          formData.append("file", blob, "image.png");

          const data = await createFile(formData);
          let note = {
            id: undefined,
            x: Math.round(
              workspace.mouseX / workspace.scale + workspace.x - width * 0.5
            ),
            y: Math.round(
              workspace.mouseY / workspace.scale + workspace.y - height * 0.5
            ),
            width: Math.round(width),
            height: Math.round(height),
            body: "",
            fileId: data["fileId"],
            dtype: "image",
            workspaceId: id,
          };
          let response = await createNote(note);
          note.id = response.noteId;
          mutate([...notes(), note]);
        }
      });
    });
  });

  return (
    <>
      <Show when={isWorkspacesShown()}>
        <div class="absolute flex w-screen h-screen items-center justify-center z-10 backdrop-blur-sm">
          <WorkspaceList
            show={setIsWorkspacesShown}
            action={workspacesListAction}
            transfer={async (workspaceId) => {
              let newNotes = [...notes()];
              for (let id of selectedNotes()) {
                const note = newNotes.find((item) => item.id === id);
                note.workspaceId = workspaceId;
                note.x = 0;
                note.y = 0;
                newNotes = newNotes.filter((item) => item.id !== id);
                await updateNote(note);
              }
              mutate(newNotes);
              setSelectedNotes(new Set());
            }}
          ></WorkspaceList>
        </div>
      </Show>

      <div
        id="workspace"
        class={`absolute w-[${workspace.width}px] h-[${workspace.height}px] origin-top-left`}
        style={{
          transform: `scale(${workspace.scale})`,
        }}
      >
        <Show when={selectionArea() != null}>
          <SelectionBox selectionRange={selectionArea()} />
        </Show>

        <For each={notes()}>
          {(note, noteIndex) => (
            <Note
              note={note}
              setNote={async (note) => {
                const newNotes = [...notes()];
                newNotes[noteIndex()] = note;
                await updateNote(note);
                mutate(newNotes);
              }}
              selectNote={() => setSelectedNotes((prev) => prev.add(note.id))}
              cancelSelection={() =>
                setSelectedNotes((prev) => (prev.delete(note.id), prev))
              }
              workspace={workspace}
              selectionArea={selectionArea}
            />
          )}
        </For>
      </div>
    </>
  );
};

export default Workspace;
