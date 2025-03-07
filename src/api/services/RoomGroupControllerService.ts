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
import type { ApiResultListRoomGroupResource } from '../models/ApiResultListRoomGroupResource';
import type { ApiResultListUserRole } from '../models/ApiResultListUserRole';
import type { ApiResultRoomResp } from '../models/ApiResultRoomResp';
import type { ApiResultVoid } from '../models/ApiResultVoid';
import type { ChangeBackgroundReq } from '../models/ChangeBackgroundReq';
import type { GroupAddRequest } from '../models/GroupAddRequest';
import type { MemberAddRequest } from '../models/MemberAddRequest';
import type { MemberDelRequest } from '../models/MemberDelRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RoomGroupControllerService {
    /**
     * addAdmin
     * @param requestBody
     * @returns ApiResultBoolean
     * @throws ApiError
     */
    public static addAdmin(
        requestBody?: AdminAddReq,
    ): CancelablePromise<ApiResultBoolean> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/capi/room/group/player',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * revokeAdmin
     * @param requestBody
     * @returns ApiResultBoolean
     * @throws ApiError
     */
    public static revokeAdmin(
        requestBody?: AdminRevokeReq,
    ): CancelablePromise<ApiResultBoolean> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/capi/room/group/player',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * addRole
     * @param requestBody
     * @returns ApiResultVoid
     * @throws ApiError
     */
    public static addRole(
        requestBody?: AddRoleRequest,
    ): CancelablePromise<ApiResultVoid> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/capi/room/group/role',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * deleteRole
     * @param requestBody
     * @returns ApiResultVoid
     * @throws ApiError
     */
    public static deleteRole(
        requestBody?: AddRoleRequest,
    ): CancelablePromise<ApiResultVoid> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/capi/room/group/role',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * addMember
     * @param requestBody
     * @returns ApiResultVoid
     * @throws ApiError
     */
    public static addMember(
        requestBody?: MemberAddRequest,
    ): CancelablePromise<ApiResultVoid> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/capi/room/group/member',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * deleteMember
     * @param requestBody
     * @returns ApiResultVoid
     * @throws ApiError
     */
    public static deleteMember(
        requestBody?: MemberDelRequest,
    ): CancelablePromise<ApiResultVoid> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/capi/room/group/member',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * changeGroupBackground
     * @param requestBody
     * @returns ApiResult
     * @throws ApiError
     */
    public static changeGroupBackground(
        requestBody?: ChangeBackgroundReq,
    ): CancelablePromise<ApiResult> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/capi/room/group/background',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * createGroup
     * @param requestBody
     * @returns ApiResultIdRespVO
     * @throws ApiError
     */
    public static createGroup(
        requestBody?: GroupAddRequest,
    ): CancelablePromise<ApiResultIdRespVO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/capi/room/group/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * groupRole
     * @param roomId
     * @returns ApiResultListUserRole
     * @throws ApiError
     */
    public static groupRole(
        roomId: number,
    ): CancelablePromise<ApiResultListUserRole> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/capi/room/group/role/list',
            query: {
                'roomId': roomId,
            },
        });
    }
    /**
     * getGroupResource
     * @param roomId
     * @returns ApiResultListRoomGroupResource
     * @throws ApiError
     */
    public static getGroupResource(
        roomId: number,
    ): CancelablePromise<ApiResultListRoomGroupResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/capi/room/group/resource/list',
            query: {
                'roomId': roomId,
            },
        });
    }
    /**
     * getMemberList
     * @param pageSize
     * @param cursor
     * @param roomId
     * @returns ApiResultListChatMemberResp
     * @throws ApiError
     */
    public static getMemberList(
        pageSize?: number,
        cursor?: string,
        roomId?: number,
    ): CancelablePromise<ApiResultListChatMemberResp> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/capi/room/group/member/list',
            query: {
                'pageSize': pageSize,
                'cursor': cursor,
                'roomId': roomId,
            },
        });
    }
    /**
     * getUserGroups
     * @returns ApiResultListRoomGroup
     * @throws ApiError
     */
    public static getUserGroups(): CancelablePromise<ApiResultListRoomGroup> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/capi/room/group/list',
        });
    }
    /**
     * groupDetail
     * @param roomId
     * @returns ApiResultRoomResp
     * @throws ApiError
     */
    public static groupDetail(
        roomId: number,
    ): CancelablePromise<ApiResultRoomResp> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/capi/room/group/info',
            query: {
                'roomId': roomId,
            },
        });
    }
    /**
     * changeGroupBackground
     * @param backgroundUrl
     * @param roomId
     * @returns ApiResult
     * @throws ApiError
     */
    public static changeGroupBackground1(
        backgroundUrl?: string,
        roomId?: number,
    ): CancelablePromise<ApiResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/capi/room/group/background/list',
            query: {
                'backgroundUrl': backgroundUrl,
                'roomId': roomId,
            },
        });
    }
}
