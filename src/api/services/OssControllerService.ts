/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResultOssResp } from '../models/ApiResultOssResp';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class OssControllerService {
    /**
     * getUploadUrl
     * @param fileName
     * @param scene
     * @returns ApiResultOssResp
     * @throws ApiError
     */
    public static getUploadUrl(
        fileName: string,
        scene: number,
    ): CancelablePromise<ApiResultOssResp> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/capi/oss/upload/url',
            query: {
                'fileName': fileName,
                'scene': scene,
            },
        });
    }
}
