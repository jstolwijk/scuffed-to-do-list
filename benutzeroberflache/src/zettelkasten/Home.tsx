import MDEditor from "@uiw/react-md-editor";
import { Link, generatePath } from "react-router-dom";
import useSWR from "swr";
import { Routes } from "../App";

const Zettelkasten = () => {
  return (
    <div className="pb-8">
      {/* <h2 className="font-bold text-2xl">Your idea collection</h2> */}
      {/* <div className="mt-8 grid grid-flow-col grid-cols-2 grid-rows-2 gap-4">
        <MenuItem color={Color.GRAY}>Documents</MenuItem>
        <MenuItem color={Color.BLUE}>Tags</MenuItem>
        <MenuItem color={Color.YELLOW}>Starred</MenuItem>
        <MenuItem color={Color.GREEN}>Graph</MenuItem>
      </div> */}
      <div>
        <h2 className="my-12 font-bold text-2xl">Documents</h2>
        <DocumentList />
      </div>
    </div>
  );
};

interface Document {
  _id: string;
  title: string;
  content: string;
}
const fetcher = (url: string) => fetch(url).then((r) => r.json());

const DocumentList = () => {
  const { data } = useSWR("http://localhost:3000/documents", fetcher);
  return (
    <div>
      <ul className="grid grid-cols-3 grid-rows-1 grid-flow-row gap-8">
        {data?.documents?.map((document: Document) => (
          <Link
            to={{
              pathname: generatePath(Routes.EDIT_IDEA, {
                ideaId: document._id,
              }),
            }}
            className="p-4 rounded shadow-2xl bg-white divide-gray-200"
          >
            <h4 className="font-semibold text-xl mb-2">{document.title}</h4>
            <div className="pt-2 h-full w-full">
              <MDEditor.Markdown source={document.content} />
            </div>
          </Link>
        ))}
      </ul>
    </div>
  );
};

enum Color {
  YELLOW,
  BLUE,
  GREEN,
  GRAY,
}

const toBgColor = (color: Color): string => {
  switch (color) {
    case Color.YELLOW:
      return "bg-yellow-300";
    case Color.BLUE:
      return "bg-blue-300";
    case Color.GRAY:
      return "bg-gray-300";
    case Color.GREEN:
      return "bg-green-300";
    default:
      return "bg-white";
  }
};

const MenuItem: React.FC<{ color: Color }> = ({ children, color }) => {
  const classNames = { [toBgColor(color)]: true, "p-4": true, rounded: true };

  return <div className={className(classNames)}>{children}</div>;
};

interface Classes {
  [key: string]: boolean;
}

const className = (classes: Classes): string => {
  return Object.keys(classes).reduce((acc, curr) => {
    if (classes[curr]) {
      return acc + " " + curr;
    } else {
      return acc;
    }
  }, "");
};

export default Zettelkasten;
