import { convertFromRaw, EditorState } from "draft-js";
import { useEffect, useState } from "react";
import SampleEditor from "../SampleEditor";
import socket from "../Socket";
import DocumentHierarchy from "./DocumentHierarchy";

const DocumentEditor = () => {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

  useEffect(() => {
    socket.on("documentChanged", (data) => {
      const content = JSON.parse(data).content;
      setEditorState(EditorState.createWithContent(convertFromRaw(content)));
    }); // TODO: rooms
  });

  return (
    <div className="grid grid-cols-12">
      <button onClick={() => socket.emit("createDocument", "dddddd")}>Emit</button>
      <div className="col-span-1">
        <DocumentHierarchy />
      </div>
      <div className="col-span-11">
        <SampleEditor editorState={editorState} onChange={setEditorState} />
      </div>
    </div>
  );
};

export default DocumentEditor;
