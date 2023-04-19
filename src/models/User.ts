export type MinimalUser = {
    id: string;
    name: string;
    email: string;
}

export type User = MinimalUser & {
    imageUri?: string;
    providers: string[];
    lastProvider: string;
    notificationToken?: string;
    createdAt: number;
    updatedAt?: string;
    appleId?: string;
    facebookId?: string;
    googleId?: string;
    isBlocked: boolean;
    appVersion: string;
    country: string;
    language: string;
    registerIp: string;
    lastLoginIp?: string;
    deviceData: DeviceData;
    followersCount: number;
    followingsCount: number;
    commentsCount: number;
}

export type DeviceData = {
    id: string;
    carrier: string;
    timeZone: string;
    os: string;
    deviceName: string;
    brand: string;
    model: string;
    hasNotch: boolean;
    isEmulator: boolean;
    isTablet: boolean;
}