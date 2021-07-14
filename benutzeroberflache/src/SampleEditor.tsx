import React, { ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { convertToRaw, EditorState } from "draft-js";
import Editor from "@draft-js-plugins/editor";
import createInlineToolbarPlugin from "@draft-js-plugins/inline-toolbar";
import "@draft-js-plugins/inline-toolbar/lib/plugin.css";
import socket from "./Socket";

const SimpleInlineToolbarEditor: React.FC<{ editorState: EditorState; onChange: (editorState: EditorState) => void }> =
  ({ editorState, onChange }) => {
    const [plugins, InlineToolbar] = useMemo(() => {
      const inlineToolbarPlugin = createInlineToolbarPlugin();
      return [[inlineToolbarPlugin], inlineToolbarPlugin.InlineToolbar];
    }, []);

    const editor = useRef<Editor | null>(null);

    const onEditorChange = (newState: EditorState): void => {
      const currentContentState = editorState.getCurrentContent();
      const newContentState = newState.getCurrentContent();

      if (currentContentState !== newContentState) {
        console.log("Something changed");
        onChange(newState);
        socket.emit("editDocument", { content: convertToRaw(editorState.getCurrentContent()) });
      } else {
        console.log("Nothing changed");
      }
    };

    const focus = (): void => {
      editor.current?.focus();
    };

    return (
      <div className="bg-white" onClick={focus}>
        <Editor
          editorKey="SimpleInlineToolbarEditor"
          editorState={editorState}
          onChange={onEditorChange}
          plugins={plugins}
          ref={(element) => {
            editor.current = element;
          }}
        />
        <InlineToolbar />
      </div>
    );
  };

export default SimpleInlineToolbarEditor;
