import React, { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { useLocalStorage } from '../utils/hooks';

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
  bearer: string,
  setBearer: Dispatch<SetStateAction<string>>,
  autobuyActive: boolean,
  toggleAutobuyActive: () => void,
  autobuyDifference: string,
  setAutobuyDifference: Dispatch<SetStateAction<string>>,
}

export const SettingsContext = React.createContext<SettingsContextInterface>({
  lessThan: "",
  setLessThan: () => { },
  minutes: "",
  setMinutes: () => { },
  filterOpen: false,
  toggleFilterOpen: () => { },
  bearer: "",
  setBearer: () => { },
  autobuyActive: false,
  toggleAutobuyActive: () => { },
  autobuyDifference: "",
  setAutobuyDifference: () => { },
});

export const SettingsContextProvider: React.FunctionComponent = ({ children }) => {
  const [lessThan, setLessThan] = useLocalStorage('minutesFilter', "40.01");
  const [minutes, setMinutes] = useState("1");
  const [filterOpen, toggleFilterOpen] = useToggle(false);
  const [bearer, setBearer] = useLocalStorage('bearer', '')
  const [autobuyActive, toggleAutobuyActive] = useToggle(false);
  const [autobuyDifference, setAutobuyDifference] = useLocalStorage('autobuyDifference', "0.5");

  return <SettingsContext.Provider value={
    {
      lessThan,
      setLessThan,
      minutes,
      setMinutes,
      filterOpen,
      toggleFilterOpen,
      bearer,
      setBearer,
      autobuyActive,
      toggleAutobuyActive,
      autobuyDifference,
      setAutobuyDifference
    }} >
    {children}
  </SettingsContext.Provider >
}