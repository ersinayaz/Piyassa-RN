import { User } from '../models/User';
import { Relationship } from '../models/Relationship';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { observable, action, makeAutoObservable, runInAction } from 'mobx';

export class UserStore {
  @observable me?: User;
  @observable followings: Relationship[] = [];
  @observable likedComments: string[] = [];

  constructor() {
    makeAutoObservable(this, {
      me: observable,
      followings: observable,
      likedComments: observable,
      setUser: action,
      initUser: action,
      initlikedComments: action,
      logout: action,
      follow: action,
      setRelationships: action,
      unFollow: action,
      likeComment: action,
      unlikeComment: action,
    });

    this.initUser();
    this.initlikedComments();
  }

  @action async initUser() {
    const user = await AsyncStorage.getItem('user');
    runInAction(() => {
      this.me = user ? JSON.parse(user) : undefined;
    })
  }

  @action async initlikedComments() {
    const likedComments = await AsyncStorage.getItem('likedComments');
    runInAction(() => {
      this.likedComments = likedComments ? JSON.parse(likedComments) : [];
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

  @action async likeComment(commentId: string) {
    this.likedComments.push(commentId);
    AsyncStorage.setItem('likedComments', JSON.stringify(this.likedComments));
  }

  @action async unlikeComment(commentId: string) {
    this.likedComments = this.likedComments.filter((id) => id !== commentId);
    AsyncStorage.setItem('likedComments', JSON.stringify(this.likedComments));
  }

  isLikedComment(commentId: string): boolean {
    return this.likedComments.includes(commentId);
  }
}

export default new UserStore();