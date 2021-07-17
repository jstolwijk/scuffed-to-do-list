// It is important to import the Editor which accepts plugins.
import Editor from "@draft-js-plugins/editor";
import createInlineToolbarPlugin from "@draft-js-plugins/inline-toolbar";
import "@draft-js-plugins/inline-toolbar/lib/plugin.css";
import { EditorState } from "draft-js";
import "draft-js/dist/Draft.css";
import React from "react";

// Creates an Instance. At this step, a configuration object can be passed in
// as an argument.
const inlineToolbarPlugin = createInlineToolbarPlugin();

// The Editor accepts an array of plugins. In this case, only the inlineToolbarPlugin
// is passed in, although it is possible to pass in multiple plugins.
const MyEditor: React.FC<{
  editorState: EditorState;
  onChange: (editorState: EditorState) => void;
}> = ({ editorState, onChange }) => (
  <div className="py-8">
    <Editor
      editorState={editorState}
      onChange={(e) => {
        onChange(e);
        console.log("Change: ", e);
      }}
      plugins={[inlineToolbarPlugin]}
    />
  </div>
);

export default MyEditor;
