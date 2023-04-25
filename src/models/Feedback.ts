import ObjectID from 'bson-objectid';
import { MinimalUser } from './User';

export type Feedback = {
    id: string;
    createdAt: number;
    body: string;
    user: MinimalUser | null;
    status: 'pending' | 'approved' | 'rejected';
}