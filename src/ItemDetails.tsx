import { useLocalStorage } from "react-use";

const ItemDetails = () => {
  const item = useLocalStorage("items", []);
  return <div></div>;
};

export default ItemDetails;
