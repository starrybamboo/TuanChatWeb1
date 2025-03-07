/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResultCursorPageBaseResponseFriendApplyResp } from '../models/ApiResultCursorPageBaseResponseFriendApplyResp';
import type { ApiResultCursorPageBaseResponseFriendResp } from '../models/ApiResultCursorPageBaseResponseFriendResp';
import type { ApiResultFriendCheckResp } from '../models/ApiResultFriendCheckResp';
import type { ApiResultFriendUnreadResp } from '../models/ApiResultFriendUnreadResp';
import type { ApiResultVoid } from '../models/ApiResultVoid';
import type { CursorPageBaseReq } from '../models/CursorPageBaseReq';
import type { FriendApplyReq } from '../models/FriendApplyReq';
import type { FriendApproveReq } from '../models/FriendApproveReq';
import type { FriendCheckReq } from '../models/FriendCheckReq';
import type { FriendDeleteReq } from '../models/FriendDeleteReq';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class FriendControllerService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @param requestBody
     * @returns ApiResultVoid OK
     * @throws ApiError
     */
    public applyApprove(
        requestBody: FriendApproveReq,
    ): CancelablePromise<ApiResultVoid> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/capi/user/friend/apply',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                405: `Method Not Allowed`,
                429: `Too Many Requests`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @param requestBody
     * @returns ApiResultVoid OK
     * @throws ApiError
     */
    public apply(
        requestBody: FriendApplyReq,
    ): CancelablePromise<ApiResultVoid> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/capi/user/friend/apply',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                405: `Method Not Allowed`,
                429: `Too Many Requests`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @param request
     * @returns ApiResultCursorPageBaseResponseFriendResp OK
     * @throws ApiError
     */
    public friendList(
        request: CursorPageBaseReq,
    ): CancelablePromise<ApiResultCursorPageBaseResponseFriendResp> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/capi/user/friend/page',
            query: {
                'request': request,
            },
            errors: {
                400: `Bad Request`,
                405: `Method Not Allowed`,
                429: `Too Many Requests`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @param request
     * @returns ApiResultFriendCheckResp OK
     * @throws ApiError
     */
    public check(
        request: FriendCheckReq,
    ): CancelablePromise<ApiResultFriendCheckResp> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/capi/user/friend/check',
            query: {
                'request': request,
            },
            errors: {
                400: `Bad Request`,
                405: `Method Not Allowed`,
                429: `Too Many Requests`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @returns ApiResultFriendUnreadResp OK
     * @throws ApiError
     */
    public unread(): CancelablePromise<ApiResultFriendUnreadResp> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/capi/user/friend/apply/unread',
            errors: {
                400: `Bad Request`,
                405: `Method Not Allowed`,
                429: `Too Many Requests`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @param request
     * @returns ApiResultCursorPageBaseResponseFriendApplyResp OK
     * @throws ApiError
     */
    public page(
        request: CursorPageBaseReq,
    ): CancelablePromise<ApiResultCursorPageBaseResponseFriendApplyResp> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/capi/user/friend/apply/page',
            query: {
                'request': request,
            },
            errors: {
                400: `Bad Request`,
                405: `Method Not Allowed`,
                429: `Too Many Requests`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @param requestBody
     * @returns ApiResultVoid OK
     * @throws ApiError
     */
    public delete(
        requestBody: FriendDeleteReq,
    ): CancelablePromise<ApiResultVoid> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/capi/user/friend',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                405: `Method Not Allowed`,
                429: `Too Many Requests`,
                500: `Internal Server Error`,
            },
        });
    }
}
