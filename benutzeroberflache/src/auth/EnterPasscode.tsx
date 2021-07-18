import { useCallback, useEffect, useState } from "react";
import useDigitInput from "react-digit-input";
import { useHistory } from "react-router-dom";
import { SpaceRoutes } from "../space/Router";

enum PasscodeStatus {
  INIT,
  INVALID,
  VALID,
}

const EnterPasscode: React.FC<{ email: string }> = ({ email }) => {
  const [passcode, setPascode] = useState("");
  const [passcodeStatus, setPasscodeStatus] = useState(PasscodeStatus.INIT);
  const [firstCheck, setFirstCheck] = useState(true);
  const digits = useDigitInput({
    acceptedCharacters: /^[0-9]$/,
    length: 6,
    value: passcode,
    onChange: setPascode,
  });
  const history = useHistory();

  const checkPasscode = useCallback(async () => {
    setFirstCheck(false);
    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_BASE_URL + "/validate-passcode", {
        method: "POST",
        body: JSON.stringify({ passcode, email }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        setPasscodeStatus(PasscodeStatus.VALID);
        history.push(SpaceRoutes.SPACE);
      } else {
        setPasscodeStatus(PasscodeStatus.INVALID);
      }
    } catch (e) {
      console.log("invalid passcode");
      setPasscodeStatus(PasscodeStatus.INVALID);
    }
  }, [email, history, passcode]);

  useEffect(() => {
    setPasscodeStatus(PasscodeStatus.INIT);

    if (firstCheck && passcode.replaceAll(" ", "").length === 6) {
      checkPasscode();
    }
  }, [passcode, checkPasscode, firstCheck]);

  const classNames = "rounded shadow-lg p-2 m-1 bg-white w-8 text-center font-semibold text-lg";
  return (
    <form
      className="pt-2"
      onSubmit={(e) => {
        e.preventDefault();
        checkPasscode();
      }}
    >
      <div className="p-2 input-group mb-4">
        <input className={classNames} inputMode="decimal" autoFocus {...digits[0]} />
        <input className={classNames} inputMode="decimal" {...digits[1]} />
        <input className={classNames} inputMode="decimal" {...digits[2]} />
        <span className="px-1" />
        <input className={classNames} inputMode="decimal" {...digits[3]} />
        <input className={classNames} inputMode="decimal" {...digits[4]} />
        <input className={classNames} inputMode="decimal" {...digits[5]} />
      </div>
      {passcodeStatus === PasscodeStatus.INVALID && <p className="font-semibold text-red-500">Invalid passcode</p>}
      <button className="shadow-lg ml-4 bg-blue-500 py-1 px-4 rounded-full text-white" type="submit">
        Get started
      </button>
    </form>
  );
};

export default EnterPasscode;
