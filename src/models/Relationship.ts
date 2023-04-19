import ObjectID from 'bson-objectid';
import { MinimalUser } from './User';

export type Relationship = {
    id: string;
    createdAt: number;
    follower: MinimalUser;
    followed: MinimalUser;
}