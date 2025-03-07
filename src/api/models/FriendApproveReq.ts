/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FriendApproveReq = {
    applyId: number;
    applyStatus: FriendApproveReq.applyStatus;
};
export namespace FriendApproveReq {
    export enum applyStatus {
        WAIT_APPROVAL = 'WAIT_APPROVAL',
        AGREE = 'AGREE',
        IGNORE = 'IGNORE',
    }
}

