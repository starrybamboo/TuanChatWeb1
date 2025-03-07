/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResult } from '../models/ApiResult';
import type { ApiResultLong } from '../models/ApiResultLong';
import type { ApiResultRoleAvatar } from '../models/ApiResultRoleAvatar';
import type { RoleAvatarCreateRequest } from '../models/RoleAvatarCreateRequest';
import type { RoleAvatarRequest } from '../models/RoleAvatarRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AvatarControllerService {
    /**
     * getRoleAvatar
     * @param avatarId
     * @returns ApiResultRoleAvatar
     * @throws ApiError
     */
    public static getRoleAvatar(
        avatarId: number,
    ): CancelablePromise<ApiResultRoleAvatar> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/capi/avatar',
            query: {
                'avatarId': avatarId,
            },
        });
    }
    /**
     * updateRoleAvatar
     * @param requestBody
     * @returns ApiResultRoleAvatar
     * @throws ApiError
     */
    public static updateRoleAvatar(
        requestBody?: RoleAvatarRequest,
    ): CancelablePromise<ApiResultRoleAvatar> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/capi/avatar',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * setRoleAvatar
     * @param requestBody
     * @returns ApiResultLong
     * @throws ApiError
     */
    public static setRoleAvatar(
        requestBody?: RoleAvatarCreateRequest,
    ): CancelablePromise<ApiResultLong> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/capi/avatar',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * deleteRoleAvatar
     * @param avatarId
     * @returns ApiResult
     * @throws ApiError
     */
    public static deleteRoleAvatar(
        avatarId: number,
    ): CancelablePromise<ApiResult> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/capi/avatar',
            query: {
                'avatarId': avatarId,
            },
        });
    }
}
