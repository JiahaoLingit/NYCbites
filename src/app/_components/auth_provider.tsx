'use client'

import { createContext, useReducer, ActionDispatch, useContext } from 'react';

const AuthContext         = createContext<boolean>(false);
const AuthDispatchContext = createContext<ActionDispatch<[action: CounterAction]> | null>(null);

type CounterAction = { type: 'sign_out' } | { type: 'sign_in' };

function AuthReducer(state: boolean, action: CounterAction): boolean {
    switch (action.type) {
        case 'sign_in':  return true;
        case 'sign_out': return false;
        default:         return state;
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, dispatch] = useReducer(AuthReducer, false);
    return (
        <AuthContext.Provider value={isAuthenticated}>
            <AuthDispatchContext.Provider value={dispatch}>
                {children}
            </AuthDispatchContext.Provider>
        </AuthContext.Provider>
    );
}

export function useAuth()         { return useContext(AuthContext); }
export function useAuthDispatch() { return useContext(AuthDispatchContext); }
