import {
  Component,
  Signal,
  createSignal,
  Show,
  Setter
} from "solid-js";
import { WorkspaceModel } from "../model";
import { createFile, createWorkspace, deleteFile, updateWorkspace } from "../server";

interface WorkspaceWindowProps {
  action: string;
  workspace: WorkspaceModel;
  show:  Setter<boolean>;
  updateWorkspaceList: () => void;
}

const WorkspaceWindow: Component<WorkspaceWindowProps> = (props: WorkspaceWindowProps) => {
  const [imageSrc, setImageSrc] = createSignal(null);
  const [isDragging, setIsDragging] = createSignal(false);
  const [name, setName]: Signal<string> = createSignal("");
  const [isTyping, setIsTyping] = createSignal(false);

  if (props.action == "update") {
    setName(props.workspace.name);
    if (props.workspace?.fileId) {
      setImageSrc(`http://localhost:80/api/files/${props.workspace?.fileId}`);
    }
  }

  const handleImageDrag = () => {
    event.preventDefault();
    setIsDragging(true);
  }

  const handleImageDragLeave = () => {
    setIsDragging(false);
  }

  const handleImageDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    console.log(file);
    if (file && file.type.startsWith("image")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const blob = new Blob([e.target.result]);
        const url = URL.createObjectURL(blob);
        setImageSrc(url);
      };
      reader.readAsArrayBuffer(file);
    }
  }

  const handleKeyboard = (event: KeyboardEvent) => {
    if (isTyping()) {
      event.stopImmediatePropagation();
    }
  }

  const handleClickButton = async () => {
    let fileId = undefined;

    if (imageSrc()?.startsWith("blob")) {
      const response = await fetch(imageSrc());
      const blob = await response.blob();
  
      const formData = new FormData();
      formData.append('file', blob);
  
      fileId = (await createFile(formData))["fileId"];
    }

    if (props.action == "create") {
      await createWorkspace({
        id: undefined,
        name: name(),
        fileId: fileId
      });

      props.show(false);
      props.updateWorkspaceList();
    } else if (props.action == "update") {
      console.log("aljdf");
      if (props.workspace?.fileId && fileId != undefined) {
        await deleteFile(props.workspace?.fileId);
      }

      await updateWorkspace({
        id: props.workspace.id,
        name: name(),
        fileId: fileId
      });
      props.show(false);
      props.updateWorkspaceList();
    }
  }

  return (
    <div onKeyDown={handleKeyboard} class="relative flex w-2/3 h-3/5 p-8 gap-8 bg-zinc-700">
      <div onDragOver={handleImageDrag} onDrop={handleImageDrop} onDragLeave={handleImageDragLeave}
         class="workspace-window-img-upload relative w-1/2 aspect-square border border-zinc-500 rounded-md border-dashed">
        <div class="relative w-full h-full flex justify-center items-center overflow-clip">
          <Show when={imageSrc()} fallback={
            <>
              <img src="images/drag-drop.png" class="absolute"/>
              <img src="images/drag-drop-hover.png"
                class={`workspace-window-img absolute ${isDragging() ? "opacity-100": "opacity-0"}`}/>
            </>}>
            <img src={imageSrc()} class="aspect-auto"></img>
          </Show>
        </div>
      </div>
      <div class="flex w-full justify-between flex-col">
        <div class="w-full h-1/6 mt-14">
          <input value={name()} onInput={e => setName(e.target.value)}
            onFocusIn={() => setIsTyping(true)} onFocusOut={() => setIsTyping(false)} class="border border-zinc-600 outline-none rounded-md bg-transparent caret-zinc-400 w-full h-full text-white px-3"></input>
        </div>
        <div class="flex justify-center items-center w-full h-1/6">
          <button onClick={handleClickButton} class="bg-sky-500 w-40 h-10 rounded-md text-white">
            {props.action == "create" ? "Create" : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceWindow;
