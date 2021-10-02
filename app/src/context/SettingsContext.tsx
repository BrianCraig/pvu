import React, { Dispatch, SetStateAction, useCallback, useState } from 'react';

const useToggle = (initialState = false): [boolean, () => void] => {
  const [state, setState] = useState(initialState);
  const toggle = useCallback(() => setState((state) => !state), []);
  return [state, toggle];
};

interface SettingsContextInterface {
  lessThan: string,
  setLessThan: Dispatch<SetStateAction<string>>,
  minutes: string,
  setMinutes: Dispatch<SetStateAction<string>>,
  filterOpen: boolean,
  toggleFilterOpen: () => void,
  autobuyMax: string,
  setAutobuyMax: Dispatch<SetStateAction<string>>,
  autobuyMin: string,
  setAutobuyMin: Dispatch<SetStateAction<string>>,
  useAutobuy: boolean,
  toggleAutobuy: () => void
}

export const SettingsContext = React.createContext<SettingsContextInterface>({
  lessThan: "",
  setLessThan: () => { },
  minutes: "",
  setMinutes: () => { },
  filterOpen: false,
  toggleFilterOpen: () => { },
  autobuyMax: "",
  setAutobuyMax: () => { },
  autobuyMin: "",
  setAutobuyMin: () => { },
  useAutobuy: false,
  toggleAutobuy: () => { }
});

export const SettingsContextProvider: React.FunctionComponent = ({ children }) => {
  const [lessThan, setLessThan] = useState<string>("40.01");
  const [minutes, setMinutes] = useState("1");
  const [filterOpen, toggleFilterOpen] = useToggle(false);
  const [autobuyMax, setAutobuyMax] = useState("");
  const [autobuyMin, setAutobuyMin] = useState("");
  const [useAutobuy, toggleAutobuy] = useToggle(false);

  return <SettingsContext.Provider value={
    {
      lessThan,
      setLessThan,
      minutes,
      setMinutes,
      filterOpen,
      toggleFilterOpen,
      autobuyMax,
      setAutobuyMax,
      autobuyMin,
      setAutobuyMin,
      useAutobuy,
      toggleAutobuy
    }} >
    {children}
  </SettingsContext.Provider >
}