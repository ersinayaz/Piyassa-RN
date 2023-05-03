import React from 'react';
import { useLocalObservable } from 'mobx-react';

import userStore, { UserStore } from './UserStore';
import deviceStore, { DeviceStore } from './DeviceStore';
import commentStore, { CommentStore } from './CommentStore';

import feedStore, { FeedStore} from './FeedStore';


type RootStore = {
  userStore: UserStore;
  deviceStore: DeviceStore;
  commentStore: CommentStore;

  feedStore: FeedStore;
}

const rootStore: RootStore = {
  userStore,
  deviceStore,
  commentStore,

  feedStore,
};




const storeContext = React.createContext<RootStore | null>(null);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const store = useLocalObservable(() => rootStore);
  return <storeContext.Provider value={store}>{children}</storeContext.Provider>;
}

export const useStore = () => {
  const store = React.useContext(storeContext);
  if (!store) {
    // this is especially useful in TypeScript so you don't need to be checking for null all the time
    throw new Error('useStore must be used within a StoreProvider.');
  }
  return store;
}