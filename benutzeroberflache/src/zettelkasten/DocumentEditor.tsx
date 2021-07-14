import MDEditor from "@uiw/react-md-editor";
import Editor from "../Editor";
import { useMemo } from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDebounce, useThrottle } from "react-use";
import useSWR from "swr";
import socket from "../Socket";
import DocumentHierarchy from "./DocumentHierarchy";
import { EditorState, convertToRaw, convertFromRaw } from "draft-js";
import SampleEditor from "../SampleEditor";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const DocumentEditor = () => {
  //   const { data } = useSWR(() => `http://localhost:3000/documents/${ideaId}`, fetcher);

  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

  // const throttledState = useThrottle(editorState, 1000);

  // useEffect(() => {
  //   socket.emit(
  //     "editDocument",
  //     JSON.stringify({ documentId: ideaId, content: convertToRaw(editorState.getCurrentContent()) })
  //   );
  // }, [throttledState]);

  const s = useMemo(() => {
    socket.connect();
    return socket;
  }, []);

  //   useEffect(() => {
  //     if (data && firstTime) {
  //       setFirstTime(false);
  //       setValue(data.content);
  //     }
  //   }, [data]);

  //   useDebounce(
  //     () => {
  //       fetch("http://localhost:3000/documents/" + ideaId, {
  //         method: "PUT",
  //         body: JSON.stringify({ title: data.title, content: value, _rev: data._rev }),
  //         headers: { "Content-Type": "application/json" },
  //       });
  //     },
  //     5000,
  //     [value]
  //   );
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
        {/* <MDEditor
          value={value}
          onChange={(v) => {
            setValue(v);
            socket.emit("editDocument", JSON.stringify({ documentId: ideaId, content: v }));
          }}
        /> */}
      </div>
    </div>
  );
};

export default DocumentEditor;
