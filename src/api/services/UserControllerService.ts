/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResultString } from '../models/ApiResultString';
import type { ApiResultUserInfoResponse } from '../models/ApiResultUserInfoResponse';
import type { UserLoginRequest } from '../models/UserLoginRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserControllerService {
    /**
     * login
     * @param requestBody
     * @returns ApiResultString
     * @throws ApiError
     */
    public static login(
        requestBody?: UserLoginRequest,
    ): CancelablePromise<ApiResultString> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/capi/user/public/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * getUserInfo
     * @param userId
     * @returns ApiResultUserInfoResponse
     * @throws ApiError
     */
    public static getUserInfo(
        userId: number,
    ): CancelablePromise<ApiResultUserInfoResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/capi/user/info',
            query: {
                'userId': userId,
            },
        });
    }
}
