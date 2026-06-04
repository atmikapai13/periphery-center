import { createContext, useContext, useState, ReactNode } from 'react';

interface AppState {
  user: null | object;
  theme: 'light' | 'dark';
}

interface AppContextType {
  state: AppState;
  updateUser: (user: object | null) => void;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, setState] = useState<AppState>({
    user: null,
    theme: 'light',
  });

  const updateUser = (user: object | null) => {
    setState((prev) => ({ ...prev, user }));
  };

  const toggleTheme = () => {
    setState((prev) => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light',
    }));
  };

  return (
    <AppContext.Provider value={{ state, updateUser, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
