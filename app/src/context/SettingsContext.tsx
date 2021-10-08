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
  setBearer: Dispatch<SetStateAction<string>>
}

export const SettingsContext = React.createContext<SettingsContextInterface>({
  lessThan: "",
  setLessThan: () => { },
  minutes: "",
  setMinutes: () => { },
  filterOpen: false,
  toggleFilterOpen: () => { },
  bearer: "",
  setBearer: () => { }
});

export const SettingsContextProvider: React.FunctionComponent = ({ children }) => {
  const [lessThan, setLessThan] = useState<string>("40.01");
  const [minutes, setMinutes] = useState("1");
  const [filterOpen, toggleFilterOpen] = useToggle(false);
  const [bearer, setBearer] = useLocalStorage('bearer', '')


  return <SettingsContext.Provider value={
    {
      lessThan,
      setLessThan,
      minutes,
      setMinutes,
      filterOpen,
      toggleFilterOpen,
      bearer,
      setBearer
    }} >
    {children}
  </SettingsContext.Provider >
}