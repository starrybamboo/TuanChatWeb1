/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResultCursorPageBaseResponseChatRoomResp } from '../models/ApiResultCursorPageBaseResponseChatRoomResp';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ContactControllerService {
    /**
     * getRoomPage
     * @param pageSize
     * @param cursor
     * @returns ApiResultCursorPageBaseResponseChatRoomResp
     * @throws ApiError
     */
    public static getRoomPage(
        pageSize?: number,
        cursor?: string,
    ): CancelablePromise<ApiResultCursorPageBaseResponseChatRoomResp> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/capi/chat/contact/page',
            query: {
                'pageSize': pageSize,
                'cursor': cursor,
            },
        });
    }
}
