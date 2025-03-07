/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResultCursorPageBaseResponseFriendApplyResp } from '../models/ApiResultCursorPageBaseResponseFriendApplyResp';
import type { ApiResultCursorPageBaseResponseFriendResp } from '../models/ApiResultCursorPageBaseResponseFriendResp';
import type { ApiResultFriendCheckResp } from '../models/ApiResultFriendCheckResp';
import type { ApiResultFriendUnreadResp } from '../models/ApiResultFriendUnreadResp';
import type { ApiResultVoid } from '../models/ApiResultVoid';
import type { FriendApplyReq } from '../models/FriendApplyReq';
import type { FriendApproveReq } from '../models/FriendApproveReq';
import type { FriendDeleteReq } from '../models/FriendDeleteReq';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FriendControllerService {
    /**
     * applyApprove
     * @param requestBody
     * @returns ApiResultVoid
     * @throws ApiError
     */
    public static applyApprove(
        requestBody?: FriendApproveReq,
    ): CancelablePromise<ApiResultVoid> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/capi/user/friend/apply',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * apply
     * @param requestBody
     * @returns ApiResultVoid
     * @throws ApiError
     */
    public static apply(
        requestBody?: FriendApplyReq,
    ): CancelablePromise<ApiResultVoid> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/capi/user/friend/apply',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * friendList
     * @param pageSize
     * @param cursor
     * @returns ApiResultCursorPageBaseResponseFriendResp
     * @throws ApiError
     */
    public static friendList(
        pageSize?: number,
        cursor?: string,
    ): CancelablePromise<ApiResultCursorPageBaseResponseFriendResp> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/capi/user/friend/page',
            query: {
                'pageSize': pageSize,
                'cursor': cursor,
            },
        });
    }
    /**
     * check
     * @param uidList
     * @returns ApiResultFriendCheckResp
     * @throws ApiError
     */
    public static check(
        uidList: Array<number>,
    ): CancelablePromise<ApiResultFriendCheckResp> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/capi/user/friend/check',
            query: {
                'uidList': uidList,
            },
        });
    }
    /**
     * unread
     * @returns ApiResultFriendUnreadResp
     * @throws ApiError
     */
    public static unread(): CancelablePromise<ApiResultFriendUnreadResp> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/capi/user/friend/apply/unread',
        });
    }
    /**
     * page
     * @param pageSize
     * @param cursor
     * @returns ApiResultCursorPageBaseResponseFriendApplyResp
     * @throws ApiError
     */
    public static page(
        pageSize?: number,
        cursor?: string,
    ): CancelablePromise<ApiResultCursorPageBaseResponseFriendApplyResp> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/capi/user/friend/apply/page',
            query: {
                'pageSize': pageSize,
                'cursor': cursor,
            },
        });
    }
    /**
     * delete
     * @param requestBody
     * @returns ApiResultVoid
     * @throws ApiError
     */
    public static delete(
        requestBody?: FriendDeleteReq,
    ): CancelablePromise<ApiResultVoid> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/capi/user/friend',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
