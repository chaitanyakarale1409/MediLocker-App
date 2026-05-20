import React, { createContext, useState, useContext } from 'react';

// Define the shape of our context
type UserContextType = {
    userName: string;
    setUserName: (name: string) => void;
};

// Create the context with default values
export const UserContext = createContext<UserContextType>({
    userName: 'Advait',
    setUserName: () => { },
});

// Create a Provider component to wrap the app
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [userName, setUserName] = useState('Advait');

    return (
        <UserContext.Provider value={{ userName, setUserName }}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook for easy access
export const useUser = () => useContext(UserContext);