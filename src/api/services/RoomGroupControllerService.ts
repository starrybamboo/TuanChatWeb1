/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddRoleRequest } from '../models/AddRoleRequest';
import type { AdminAddReq } from '../models/AdminAddReq';
import type { AdminRevokeReq } from '../models/AdminRevokeReq';
import type { ApiResult } from '../models/ApiResult';
import type { ApiResultBoolean } from '../models/ApiResultBoolean';
import type { ApiResultIdRespVO } from '../models/ApiResultIdRespVO';
import type { ApiResultListChatMemberResp } from '../models/ApiResultListChatMemberResp';
import type { ApiResultListRoomGroup } from '../models/ApiResultListRoomGroup';
import type { ApiResultListUserRole } from '../models/ApiResultListUserRole';
import type { ApiResultRoomResp } from '../models/ApiResultRoomResp';
import type { ApiResultVoid } from '../models/ApiResultVoid';
import type { ChangeBackgroundReq } from '../models/ChangeBackgroundReq';
import type { GroupAddRequest } from '../models/GroupAddRequest';
import type { MemberAddRequest } from '../models/MemberAddRequest';
import type { MemberDelRequest } from '../models/MemberDelRequest';
import type { MemberRequest } from '../models/MemberRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class RoomGroupControllerService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @param requestBody
     * @returns ApiResultBoolean OK
     * @throws ApiError
     */
    public addAdmin(
        requestBody: AdminAddReq,
    ): CancelablePromise<ApiResultBoolean> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/capi/room/group/player',
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
     * @returns ApiResultBoolean OK
     * @throws ApiError
     */
    public revokeAdmin(
        requestBody: AdminRevokeReq,
    ): CancelablePromise<ApiResultBoolean> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/capi/room/group/player',
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
    public addRole(
        requestBody: AddRoleRequest,
    ): CancelablePromise<ApiResultVoid> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/capi/room/group/role',
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
    public deleteRole(
        requestBody: AddRoleRequest,
    ): CancelablePromise<ApiResultVoid> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/capi/room/group/role',
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
    public addMember(
        requestBody: MemberAddRequest,
    ): CancelablePromise<ApiResultVoid> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/capi/room/group/member',
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
    public deleteMember(
        requestBody: MemberDelRequest,
    ): CancelablePromise<ApiResultVoid> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/capi/room/group/member',
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
     * @returns ApiResultIdRespVO OK
     * @throws ApiError
     */
    public createGroup(
        requestBody: GroupAddRequest,
    ): CancelablePromise<ApiResultIdRespVO> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/capi/room/group/',
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
     * @param roomId
     * @returns ApiResultListUserRole OK
     * @throws ApiError
     */
    public groupRole(
        roomId: number,
    ): CancelablePromise<ApiResultListUserRole> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/capi/room/group/role/list',
            query: {
                'roomId': roomId,
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
     * @returns ApiResultListChatMemberResp OK
     * @throws ApiError
     */
    public getMemberList(
        request: MemberRequest,
    ): CancelablePromise<ApiResultListChatMemberResp> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/capi/room/group/member/list',
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
     * @returns ApiResultListRoomGroup OK
     * @throws ApiError
     */
    public getUserGroups(): CancelablePromise<ApiResultListRoomGroup> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/capi/room/group/list',
            errors: {
                400: `Bad Request`,
                405: `Method Not Allowed`,
                429: `Too Many Requests`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * @param roomId
     * @returns ApiResultRoomResp OK
     * @throws ApiError
     */
    public groupDetail(
        roomId: number,
    ): CancelablePromise<ApiResultRoomResp> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/capi/room/group/info',
            query: {
                'roomId': roomId,
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
     * @returns ApiResult OK
     * @throws ApiError
     */
    public changeGroupBackground(
        request: ChangeBackgroundReq,
    ): CancelablePromise<ApiResult> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/capi/room/group/background/list',
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
}
