/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResult } from '../models/ApiResult';
import type { ApiResultListRoleAvatar } from '../models/ApiResultListRoleAvatar';
import type { ApiResultRoleAbilityTable } from '../models/ApiResultRoleAbilityTable';
import type { ApiResultRoleDTO } from '../models/ApiResultRoleDTO';
import type { ParseExcelRequest } from '../models/ParseExcelRequest';
import type { RoleAbilityTable } from '../models/RoleAbilityTable';
import type { RoleDTO } from '../models/RoleDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RoleControllerService {
    /**
     * getRole
     * @param roleId
     * @returns ApiResultRoleDTO
     * @throws ApiError
     */
    public static getRole(
        roleId: number,
    ): CancelablePromise<ApiResultRoleDTO> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/capi/role',
            query: {
                'roleId': roleId,
            },
        });
    }
    /**
     * updateRole
     * @param requestBody
     * @returns ApiResultRoleDTO
     * @throws ApiError
     */
    public static updateRole(
        requestBody?: RoleDTO,
    ): CancelablePromise<ApiResultRoleDTO> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/capi/role',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * createRole
     * @returns ApiResultRoleDTO
     * @throws ApiError
     */
    public static createRole(): CancelablePromise<ApiResultRoleDTO> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/capi/role',
        });
    }
    /**
     * deleteRole_1
     * @param roleId
     * @returns ApiResult
     * @throws ApiError
     */
    public static deleteRole1(
        roleId: number,
    ): CancelablePromise<ApiResult> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/capi/role',
            query: {
                'roleId': roleId,
            },
        });
    }
    /**
     * getRoleAbility
     * @param roleId
     * @returns ApiResultRoleAbilityTable
     * @throws ApiError
     */
    public static getRoleAbility(
        roleId: number,
    ): CancelablePromise<ApiResultRoleAbilityTable> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/capi/role/ability',
            query: {
                'roleId': roleId,
            },
        });
    }
    /**
     * setRoleAbility
     * @param requestBody
     * @returns ApiResult
     * @throws ApiError
     */
    public static setRoleAbility(
        requestBody?: RoleAbilityTable,
    ): CancelablePromise<ApiResult> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/capi/role/ability',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * parseExcel
     * @param requestBody
     * @returns ApiResultRoleAbilityTable
     * @throws ApiError
     */
    public static parseExcel(
        requestBody?: ParseExcelRequest,
    ): CancelablePromise<ApiResultRoleAbilityTable> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/capi/role/ability/excel',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * getRoleAvatars
     * @param roleId
     * @returns ApiResultListRoleAvatar
     * @throws ApiError
     */
    public static getRoleAvatars(
        roleId: number,
    ): CancelablePromise<ApiResultListRoleAvatar> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/capi/role/avatar',
            query: {
                'roleId': roleId,
            },
        });
    }
}
