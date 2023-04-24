import ObjectID from 'bson-objectid';
import { Comment } from './Comment';
import { MinimalUser } from './User';

export type Reports = {
    id: string;
    createdAt: number;
    commentId: string;
    userId: string | null;
    status: 'pending' | 'approved' | 'rejected';
}