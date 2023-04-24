import { User } from '../models/User';
import { Relationship } from '../models/Relationship';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { observable, action, makeAutoObservable, runInAction } from 'mobx';

export class UserStore {
  @observable me?: User;
  @observable followings: Relationship[] = [];

  constructor() {
    makeAutoObservable(this, {
      me: observable,
      followings: observable,
      setUser: action,
      initUser: action,
      logout: action,
      follow: action,

      setRelationships: action,
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

  @action setRelationships(relationships: Relationship[]) {
    runInAction(() => {
      this.followings = relationships;
    });
  }

  @action async logout() {
    await AsyncStorage.removeItem('user');
    runInAction(() => {
      this.me = undefined;
    });
  }

  isFollowing(userId: string): Relationship | undefined {
    const isFollowingData = this.followings.find((relationship) => relationship.followedId === userId);
    return !!isFollowingData;
  }

  @action async follow(entity: Relationship) {
    this.followings.push(entity);
  }

  @action async unFollow(userId: string) {
    this.followings = this.followings.filter((relationship) => relationship.followedId !== userId);
  }
}

export default new UserStore();