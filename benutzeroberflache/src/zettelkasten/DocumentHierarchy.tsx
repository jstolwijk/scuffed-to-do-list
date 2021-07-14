import { generatePath, Link, NavLink, useHistory } from "react-router-dom";
import { useLocation } from "react-use";
import useSWR from "swr";
import { Routes } from "../App";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Document {
  _id: string;
  title: string;
  content: string;
}

const DocumentHierarchy = () => {
  // const { data } = useSWR("http://localhost:3000/documents", fetcher);
  const history = useHistory();

  const newDocument = async () => {
    const response = await fetch("http://localhost:3000/documents", {
      method: "POST",
      body: JSON.stringify({ title: "Untitled", content: "" }),
      headers: { "Content-Type": "application/json" },
    });

    const body = await response.json();
    console.log("Created new document, " + body.documentId);
    history.push(generatePath(Routes.EDIT_IDEA, { ideaId: body.documentId }));
  };

  return (
    <div>
      {/* {data?.documents?.map((document: Document) => (
        <NavLink className="block" to={generatePath(Routes.EDIT_IDEA, { ideaId: document._id })}>
          {document.title}
        </NavLink>
      ))} */}
      <button onClick={newDocument}>New document</button>
    </div>
  );
};

export default DocumentHierarchy;
