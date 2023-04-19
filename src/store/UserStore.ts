import { User } from '../models/User';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { observable, action, makeAutoObservable, runInAction } from 'mobx';

export class UserStore {
  @observable me?: User;

  constructor() {
    makeAutoObservable(this, {
      me: observable,
      setUser: action,
      initUser: action
    });

    this.initUser();
  }

  @action async initUser() {
    const user = await AsyncStorage.getItem('user');
    runInAction(() => {
      this.me = user ? JSON.parse(user) : undefined;
    })
  }

  @action setUser(user: User) {
    AsyncStorage.setItem('user', JSON.stringify(user)).then(() => {
      runInAction(() => {
        this.me = user;
      });
    });
  }
}

export default new UserStore();