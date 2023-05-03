import { Comment } from '../models';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { observable, action, makeAutoObservable, runInAction } from 'mobx';

type FeedByParity = {
    [parityId: string]: Comment[];
};

export class FeedStore {
    @observable feed: FeedByParity = {};
    @observable userComments?: Comment[] = [];

    constructor() {
        makeAutoObservable(this, {
            feed: observable,
            userComments: observable,
            getFeedByParityId: action,
            dumpFeedByParityId: action,
            addComment: action,
            deleteComment: action,
            updateComment: action,
            updateLikeCount: action,
            getUserComments: action,
            dumpUserComments: action,
            addUserComment: action,
            deleteUserComment: action,
        });

        this.getFeedByParityId('d');
        this.getFeedByParityId('e');
        this.getFeedByParityId('p');
        this.getFeedByParityId('o');
        this.getFeedByParityId('o2');
        this.getFeedByParityId('g');
        this.getFeedByParityId('s');
        this.getFeedByParityId('btc');
        this.getFeedByParityId('eth');
        this.getUserComments();
    }

    @action
    async getFeedByParityId(parityId: string) {
        const feed = await AsyncStorage.getItem(`feed_${parityId}`);
        if (feed) {
            runInAction(() => {
                this.feed[parityId] = JSON.parse(feed);
            });
        }
    }

    @action
    async dumpFeedByParityId(parityId: string, feed: Comment[]) {
        await AsyncStorage.setItem(`feed_${parityId}`, JSON.stringify(feed));
    }

    @action
    async addComment(parityId: string, comment: Comment) {
        if (!this.feed[parityId]) {
            this.feed[parityId] = [];
        }
        this.feed[parityId].push(comment);
        await this.dumpFeedByParityId(parityId, this.feed[parityId]);
    }

    @action
    async deleteComment(parityId: string, commentId: string) {
        this.feed[parityId] = this.feed[parityId].filter((comment) => comment.id !== commentId);
        await this.dumpFeedByParityId(parityId, this.feed[parityId]);
    }

    @action
    async updateComment(parityId: string, comment: Comment) {
        const index = this.feed[parityId].findIndex((c) => c.id === comment.id);
        this.feed[parityId][index] = comment;
        await this.dumpFeedByParityId(parityId, this.feed[parityId]);
    }

    @action
    async updateLikeCount(parityId: string, commentId: string, likeCount: number) {
        const index = this.feed[parityId].findIndex((c) => c.id === commentId);
        this.feed[parityId][index].likeCount = likeCount;
        await this.dumpFeedByParityId(parityId, this.feed[parityId]);
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
    async dumpUserComments(feed: Comment[]) {
        await AsyncStorage.setItem('userComments', JSON.stringify(feed));
    }

    @action
    async addUserComment(comment: Comment) {
        this.userComments?.push(comment);
        await this.dumpUserComments();
    }

    @action
    async deleteUserComment(commentId: string) {
        this.userComments = this.userComments?.filter((comment) => comment.id !== commentId);
        await this.dumpUserComments();
    }
}

export default new FeedStore();