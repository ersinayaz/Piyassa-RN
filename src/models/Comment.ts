import { MinimalUser } from './User';
import { MinimalParity } from './Parity';

export type Comment = {
    id: string;
    createdAt: number;
    updatedAt?: string;
    isDeleted: boolean;
    likeCount: number;
    body: string;
    user: MinimalUser;
    parity: MinimalParity;
}