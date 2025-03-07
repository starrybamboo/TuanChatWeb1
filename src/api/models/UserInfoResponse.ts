/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserRole } from './UserRole';
export type UserInfoResponse = {
    userId?: number;
    username?: string;
    userMark?: number;
    userLevel?: number;
    avatar?: string;
    ipInfo?: string;
    activeStatus?: string;
    lastLoginTime?: string;
    createTime?: string;
    updateTime?: string;
    roles?: Array<UserRole>;
};

