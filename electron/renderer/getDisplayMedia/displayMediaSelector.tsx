import React from "react";
import { createRoot } from "react-dom/client";

type SourceType = Awaited<
  ReturnType<typeof window.electron.getSourcesDisplayMedia>
>[0];

export const displayMediaSelector = (): Promise<SourceType | undefined> =>
  new Promise(async (res, rej) => {
    const sources = await window.electron.getSourcesDisplayMedia();
    const modalContainer = document.createElement("div");
    document.body.appendChild(modalContainer);
    const main = createRoot(modalContainer);

    const accept = (node?: SourceType) => {
      res(node);
      main.unmount();
    };
    const cancel = () => {
      rej("Permission denied");
      main.unmount();
    };

    const Selector = () => {
      return (
        <div
          style={{
            position: "absolute",
            padding: "1em",
            top: "0",
            left: 0,
            bottom: 0,
            right: 0,
          }}
        >
          <div>
            <button
              onClick={() => {
                accept();
              }}
            >
              All screen
            </button>
            {sources.map((source) => (
              <button key={source.id} onClick={() => accept(source)}>
                {source.name}
              </button>
            ))}
          </div>

          <button onClick={cancel}>cancel</button>
        </div>
      );
    };
    main.render(<Selector />);
  });
