import React from 'react';
import firebaseFirestore, { Firestore } from './FirestoreDatabase';
import firebaseRealtime, { Realtime } from './RealtimeDatabase';

const firestoreContext = React.createContext<Firestore | null>(null);
const realtimeContext = React.createContext<Realtime | null>(null);

export const FirebaseProvider = ({ children }: { children: React.ReactNode }) => {
    return <firestoreContext.Provider value={firebaseFirestore}>
        <realtimeContext.Provider value={firebaseRealtime}>
            {children}
        </realtimeContext.Provider>
    </firestoreContext.Provider>;
}

export const useFirestore = () => {
    return React.useContext(firestoreContext);
}

export const useRealtime = () => {
    return React.useContext(realtimeContext);
}