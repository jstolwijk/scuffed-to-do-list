import MDEditor from "@uiw/react-md-editor";
import { useState } from "react";
import { useParams } from "react-router";
import { useLocalStorage } from "react-use";

const Notes = () => {
  let { itemId } = useParams<{ itemId: string }>();

  const [value, setValue] = useLocalStorage<string | undefined>(itemId + "-notes", "");
  const [editorVisible, setEditorVisible] = useState(false);
  return (
    <div>
      {editorVisible && (
        <div>
          {/*Fix height + remove previwew on mobile*/}
          <MDEditor value={value} onChange={setValue} />{" "}
          <button className="p-2 rounded bg-blue-300" onClick={() => setEditorVisible(false)}>
            Done
          </button>
        </div>
      )}
      {!editorVisible && (
        <div>
          <MDEditor.Markdown source={value} />
          <button className="p-2 rounded bg-blue-300" onClick={() => setEditorVisible(true)}>
            Edit
          </button>
        </div>
      )}
    </div>
  );
};

export default Notes;
