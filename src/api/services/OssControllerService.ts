/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResultOssResp } from '../models/ApiResultOssResp';
import type { UploadUrlReq } from '../models/UploadUrlReq';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class OssControllerService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @param req
     * @returns ApiResultOssResp OK
     * @throws ApiError
     */
    public getUploadUrl(
        req: UploadUrlReq,
    ): CancelablePromise<ApiResultOssResp> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/capi/oss/upload/url',
            query: {
                'req': req,
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
