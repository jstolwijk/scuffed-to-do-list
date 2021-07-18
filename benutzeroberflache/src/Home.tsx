import { useState } from "react";
import SignIn from "./auth/SignIn";
import SignUp from "./auth/SignUp";

const Home = () => {
  const [signUp, setSignUp] = useState(true);
  return (
    <div>
      {signUp && <SignUp />}
      {!signUp && <SignIn />}
      <div className="text-center">
        {signUp ? (
          <button onClick={() => setSignUp(false)}>Already have an account? Sign in instead</button>
        ) : (
          <button onClick={() => setSignUp(true)}>Are you new here? Create an account instead</button>
        )}
      </div>
    </div>
  );
};

export default Home;
