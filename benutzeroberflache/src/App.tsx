import { ArrowDownIcon, ChevronDownIcon } from "@heroicons/react/solid";
import { createContext, useState } from "react";
import Confetti from "react-confetti";
import { BrowserRouter as Router, NavLink } from "react-router-dom";
import { useLocalStorage, useWindowSize } from "react-use";
import { AppRouter, Routes } from "./AppRouter";
import { SpaceRoutes } from "./space/Router";

export const PartyContext = createContext(() => {});

function App() {
  const [party, setParty] = useState(false);
  const { width, height } = useWindowSize();

  return (
    <PartyContext.Provider value={() => setParty(true)}>
      <Router>
        <div className="bg-gray-100 h-screen overflow-y-scroll">
          {party && (
            <Confetti
              style={{ pointerEvents: "none" }}
              numberOfPieces={party ? 500 : 0}
              recycle={false}
              onConfettiComplete={(confetti: any) => {
                setParty(false);
                confetti?.reset();
              }}
              width={width}
              height={height}
            />
          )}
          <NavBar />
          <AppRouter />
        </div>
      </Router>
    </PartyContext.Provider>
  );
}

const NavBar = () => {
  return (
    <nav className="w-full bg-black text-gray-300 mb-4">
      <div className="mx-auto container flex items-center">
        <NavLink to={Routes.HOME} className="pr-4 align-middle hover:text-white">
          Home
        </NavLink>
        <NavLink to={SpaceRoutes.SPACE} className="pr-4 align-middle hover:text-white">
          Spaces
        </NavLink>
        <NavLink to={Routes.TO_DOS} className="align-middle hover:text-white">
          To dos
        </NavLink>
        <div className="flex-grow"></div>
        <div className="flex items-center p-2 cursor-pointer hover:text-white">
          <div className="rounded-full h-8 w-8 flex items-center justify-center bg-red-500">J</div>
          <p className="pl-2 items-center">Jesse</p>
          <ChevronDownIcon className="pl-2 h-6 w-6 items-center" />
        </div>
      </div>
    </nav>
  );
};

export default App;
