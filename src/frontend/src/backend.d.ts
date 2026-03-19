import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Book {
    id: string;
    title: string;
    createdAt: Time;
    description: string;
    author: string;
    imageId?: string;
    price: string;
    condition: BookCondition;
}
export interface UserProfile {
    name: string;
}
export enum BookCondition {
    new_ = "new",
    fair = "fair",
    good = "good"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBook(id: string, title: string, author: string, description: string, condition: BookCondition, price: string, imageId: string | null): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimFirstAdmin(): Promise<boolean>;
    deleteBook(id: string): Promise<void>;
    getBook(id: string): Promise<Book>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listBooks(): Promise<Array<Book>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedBooks(): Promise<void>;
    updateBook(id: string, title: string, author: string, description: string, condition: BookCondition, price: string, imageId: string | null): Promise<void>;
}
