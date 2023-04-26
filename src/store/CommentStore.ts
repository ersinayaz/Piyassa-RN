import { Comment } from '../models';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { observable, action, makeAutoObservable, runInAction } from 'mobx';

export class CommentStore {
    @observable d?: Comment[] = [];
    @observable e?: Comment[] = [];
    @observable p?: Comment[] = [];
    @observable o?: Comment[] = [];
    @observable o2?: Comment[] = [];
    @observable g?: Comment[] = [];
    @observable s?: Comment[] = [];
    @observable btc?: Comment[] = [];
    @observable eth?: Comment[] = [];

    @observable userComments?: Comment[] = [];

    constructor() {
        makeAutoObservable(this, {
            d: observable,
            e: observable,
            p: observable,
            o: observable,
            o2: observable,
            g: observable,
            s: observable,
            btc: observable,
            eth: observable,
            userComments: observable,
            getUserComments: action,
            getComments: action,
            dumpComments: action,
            addComment: action,
            deleteComment: action,
            dumpUserComments: action,
            addUserComment: action,
            deleteUserComment: action,
        });

        this.getUserComments();
        this.getComments('d');
        this.getComments('e');
        this.getComments('p');
        this.getComments('o');
        this.getComments('o2');
        this.getComments('g');
        this.getComments('s');
        this.getComments('btc');
        this.getComments('eth');
    }

    @action
    async getComments(parityId: string) {
        const comments = await AsyncStorage.getItem(`comments_${parityId}`);
        if (comments) {
            runInAction(() => {
                this[parityId] = JSON.parse(comments);
            });
        }
        return JSON.parse(comments);
    }

    @action
    async dumpComments(parityId: string, comments: Comment[]) {
        try {
            const prevComments = await this.getComments(parityId);
            if (prevComments) {
                comments = [...comments];
            }
            AsyncStorage.setItem(`comments_${parityId}`, JSON.stringify(comments));
            runInAction(() => {
                this[parityId] = comments;
            });
        } catch (error) {

        }
    }

    @action
    async addComment(comment: Comment) {
        const prevComments = await this.getComments(comment.parity.id);
        if (prevComments) {
            prevComments.unshift(comment);
        }
        AsyncStorage.setItem(`comments_${comment.parity.id}`, JSON.stringify(prevComments));
        runInAction(() => {
            this[comment.parity.id] = prevComments;
        });
        this.addUserComment(comment);
    }

    @action
    async updateComment(parityId: string, comment: Comment) {
        const prevComments = await this.getComments(parityId);
        if (prevComments) {
            const index = prevComments.findIndex((comment) => comment.id === comment.id);
            if (index > -1) {
                prevComments[index] = comment;
            }
        }
        AsyncStorage.setItem(`comments_${parityId}`, JSON.stringify(prevComments));
        runInAction(() => {
            this[parityId] = prevComments;
        });
    }

    @action
    async deleteComment(parityId: string, commentId: string) {
        const prevComments = await this.getComments(parityId);
        if (prevComments) {
            const index = prevComments.findIndex((comment) => comment.id === commentId);
            if (index > -1) {
                prevComments.splice(index, 1);
            }
        }
        AsyncStorage.setItem(`comments_${parityId}`, JSON.stringify(prevComments));
        runInAction(() => {
            this[parityId] = prevComments;
        });
        this.deleteUserComment(commentId);
    }

    @action
    async getUserComments() {
        const comments = await AsyncStorage.getItem('userComments');
        if (comments) {
            runInAction(() => {
                this.userComments = JSON.parse(comments);
            });
        }
        return JSON.parse(comments);
    }

    @action
    async dumpUserComments(comments: Comment[]) {
        const prevComments = await this.getUserComments();
        if (prevComments) {
            comments = [...comments];
        }
        await AsyncStorage.setItem('userComments', JSON.stringify(comments));
        runInAction(() => {
            this.userComments = comments;
        });
    }

    @action
    async addUserComment(comment: Comment) {
        const prevComments = await this.getUserComments();
        if (prevComments) {
            prevComments.unshift(comment);
        }
        AsyncStorage.setItem('userComments', JSON.stringify(prevComments));
        runInAction(() => {
            this.userComments = prevComments;
        });
    }

    @action
    async deleteUserComment(commentId: string) {
        const prevComments = await this.getUserComments();
        if (prevComments) {
            const index = prevComments.findIndex((comment) => comment.id === commentId);
            if (index > -1) {
                prevComments.splice(index, 1);
            }
        }
        AsyncStorage.setItem('userComments', JSON.stringify(prevComments));
        runInAction(() => {
            this.userComments = prevComments;
        });
    }
}

export default new CommentStore();