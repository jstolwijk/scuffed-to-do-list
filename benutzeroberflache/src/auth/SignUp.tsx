import { useState } from "react";
import EnterPasscode from "./EnterPasscode";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [showPasscode, setShowpasscode] = useState(false);

  const signUp = async () => {
    const response = await fetch("http://localhost:3000/sign-up", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      setShowpasscode(true);
    }
  };

  return (
    <div>
      <div className="pt-16 flex flex-col justify-center text-center">
        <h1 className="text-2xl font-semibold">Sign up</h1>
        <form
          className="flex-1 flex justify-center pt-2"
          onSubmit={(e) => {
            e.preventDefault();
            signUp();
          }}
        >
          <input
            className="shadow-lg rounded p-2"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></input>
          {!showPasscode && (
            <button className="shadow-lg ml-4 block bg-blue-500 py-1 px-4 rounded-full text-white" type="submit">
              Get started
            </button>
          )}
        </form>
        <div className="flex-1 flex justify-center mt-2">
          {showPasscode && (
            <div className="pt-2">
              <h2>We sent a one time passcode to your email.</h2>
              <h2>Please enter the code below</h2>
              <EnterPasscode email={email} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUp;
