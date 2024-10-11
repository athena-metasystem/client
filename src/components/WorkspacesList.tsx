import { Component, Signal, createSignal, createResource, For, Show, createEffect, untrack, Setter } from 'solid-js';
import { WorkspaceModel, WorkspacesPaginationOptions } from '../model'
import { fetchWorkspaces  } from '../server';
import WorkspaceWindow from './WorkspaceWindow';

function checkImage(url: string) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = function () {
      resolve(true);
    };
    img.onerror = function () {
      resolve(false);
    };
    img.src = url;
  });
}

const getRandomColor = () => {
  const colors = ["bg-red-500", "bg-green-500", "bg-orange-600", "bg-sky-600", "bg-purple-700"];
  return colors[Math.floor(Math.random() * colors.length)];
}

interface WorkspaceListProps {
  show: Setter<boolean>;
  action: string;
  transfer: CallableFunction
}

const WorkspaceList: Component<WorkspaceListProps> = (props: WorkspaceListProps) => { // turn off tab
  const [paginationOptions, setPaginationOptions]: Signal<WorkspacesPaginationOptions> = createSignal()
  const [workspacesResponse, { mutate }] = createResource(paginationOptions, fetchWorkspaces);
  const [currentPage, setCurrentPage] = createSignal(1);
  const [areThereImages, setAreThereImages] = createSignal({});
  const [maxPage, setMaxPage]: Signal<number> = createSignal();
  const pageSize = 7;
  const displayedPagesNumber = 6;
  const [pages, setPages] = createSignal([]);

  const [isworksoaceWindowShown, setIsworksoaceWindowShown] = createSignal(false);
  const [windowWorkspaceAction, setWindowWorkspaceAction] = createSignal("");
  const [workspace, setWorkspace]: Signal<WorkspaceModel> = createSignal(undefined);

  let onAction: (event) => void;
  
  if (props.action == "move") {
    onAction = (event) => {
      window.location.href = `http://localhost:3000/${event.currentTarget.dataset.value}`;
    };
  } else if (props.action == "transfer") {
    onAction = (event) => {
      props.transfer(event.currentTarget.dataset.value)
      props.show(false);
    }
  }

  const checkWorkspaceImage = (fileId: string) => {
    if (fileId) {
      const imageUrl = `http://localhost:80/api/files/${fileId}`;
      checkImage(imageUrl).then((isThereImage) => {
        setAreThereImages((prev) => ({ ...prev, [fileId]: isThereImage }));
      });
    }
  }

  createEffect(() => {
    setPaginationOptions({
      offset: (currentPage() - 1) * pageSize,
      limit: pageSize
    });
  });

  createEffect(() => {
    if (workspacesResponse()) {
      setMaxPage(Math.trunc((workspacesResponse()[1] as number - 1) / pageSize) + 1)
      const firstPage = (Math.floor((currentPage() - 1) / displayedPagesNumber)) * displayedPagesNumber;
      setPages(Array.from({ length: Math.min(displayedPagesNumber, untrack(maxPage) - firstPage) }, (_, i) => firstPage + i + 1));
    }
  })

  const handlePageButtonClick = (event: MouseEvent) => {
    const pageText = (event.target as HTMLButtonElement).textContent;
    if (pageText == "⭢") {
      const firstPage = (Math.floor((currentPage() - 1) / displayedPagesNumber) + 1) * displayedPagesNumber + 1;
      setCurrentPage(firstPage);
    } else if (pageText == "⭠") {
      const firstPage = (Math.floor((currentPage() - 1) / displayedPagesNumber) - 1) * displayedPagesNumber + 1;
      setCurrentPage(firstPage);
    } else {
      setCurrentPage(parseInt(pageText));
    }
  };

  return (
    <>
      <div class="relative flex bg-zinc-800 h-3/4 w-3/4 px-2 pb-2 items-start flex-col border border-gray-600 rounded-md">
        <button class="top-0 left-0 text-gray-200 text-lg p-1" onClick={() => props.show(false)}>×</button>
        <Show when={isworksoaceWindowShown()}>
          <div class='absolute flex items-center justify-center w-full h-full -ml-2 z-10' onClick={e => setIsworksoaceWindowShown(e.target != e.currentTarget)}>
            <WorkspaceWindow workspace={workspace()} action={windowWorkspaceAction()}
              show={setIsworksoaceWindowShown} updateWorkspaceList={() => (setCurrentPage(untrack(currentPage) + 1), setCurrentPage(untrack(currentPage) -1))}></WorkspaceWindow>
          </div>
        </Show>
        <div class="flex-grow grid grid-cols-4 grid-rows-2 gap-4 h-96 w-full rounded-md p-10">
          <For each={(workspacesResponse() || [])?.at(0) as [WorkspaceModel]}>{(workspace) => {
            createEffect(() => {
              checkWorkspaceImage(workspace.fileId);
            });
            return (
              <button onClick={onAction} data-value={workspace.id} class="relative flex border items-center justify-center overflow-clip border-[#3a3a3b] rounded-md h-4/5">
                <div class="flex relative w-full h-full items-center justify-center">
                  <Show
                    when={areThereImages()[workspace.fileId]}
                    fallback={<div class={`w-full h-full ${getRandomColor()}`}></div>}>
                      <img class="max-h-full max-w-full" src={`http://localhost:80/api/files/${workspace.fileId}`}></img>
                  </Show>
                  <div class='absolute top-0 left-full -ml-6 bg-transparent p-1 w-6' onClick={
                    e => {
                      e.stopPropagation();
                      setWorkspace(workspace);
                      setWindowWorkspaceAction("update");
                      setIsworksoaceWindowShown(true);
                    }
                  }>
                    <img class="w-full h-full mix-blend-color-dodge" src='images/edit.png'></img>
                  </div>
                </div>

                <div class="flex p-2 bg-zinc-700 h-6 items-center w-full justify-between absolute bottom-0 left-0">
                  <p class="text-sky-100 font-mono">{workspace.name}</p>
                </div>
              </button>
            )
          }}
          </For>
          <div class="add-workspace border border-[#414143] border-dashed rounded-md h-4/5 flex items-center justify-center">
            <button onClick={ () => (setWindowWorkspaceAction("create"), setIsworksoaceWindowShown(true)) } class="flex items-center justify-center w-full h-full">
              <svg
                width="100"
                height="100"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M 40 40 L 40 0 L 60 0 L 60 40"
                  fill="none"
                  stroke="#636365"
                  stroke-width="1"
                  stroke-dasharray="4, 2.5"
                />
                <path
                  d="M 60 40 L 100 40 L 100 60 L 60 60"
                  fill="none"
                  stroke="#636365"
                  stroke-width="1"
                  stroke-dasharray="4, 2.5"
                />
                <path
                  d="M 60 60 L 60 100 L 40 100 L 40 60"
                  fill="none"
                  stroke="#636365"
                  stroke-width="1"
                  stroke-dasharray="4, 2.5"
                />
                <path
                  d="M 40 60 L 0 60 L 0 40 L 40 40"
                  fill="none"
                  stroke="#636365"
                  stroke-width="1"
                  stroke-dasharray="4, 2.5"
                />
              </svg>
            </button>
          </div>
        </div>
        <div class="flex h-12 w-full items-center justify-center">
          <Show when={currentPage() > displayedPagesNumber}>
            <button onClick={handlePageButtonClick} class="workspace-page-btn bg-sky-300 py-1 text-sky-900 text-2xl rounded-md mx-1 w-8">
              ⭠
            </button>
            <button onClick={handlePageButtonClick} class="workspace-page-btn py-2 text-white bg-sky-800 rounded-lg mx-1 w-8">
              1
            </button>
            <div class='h-full align-text-bottom flex items-center mx-1'>
              <p class='text-white pt-4'>...</p>
            </div>
          </Show>
          <For each={pages()}>{(page) => 
            <button onClick={handlePageButtonClick} class={`${currentPage() == page ? 'border border-sky-500' : ''} workspace-page-btn py-2 text-white bg-sky-800 rounded-lg mx-1 w-8`}>{page}</button>
          }
          </For>
          <Show when={maxPage() > (Math.trunc((currentPage() - 1) / displayedPagesNumber) + 1) * displayedPagesNumber}>
            <button onClick={handlePageButtonClick} class="workspace-page-btn bg-sky-300 py-1 text-sky-900 text-2xl rounded-md mx-1 w-8">
              ⭢
            </button>
          </Show>
        </div>
      </div>
    </>
  );
};

export default WorkspaceList;
