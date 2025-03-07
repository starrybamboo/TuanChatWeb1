/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResultCursorPageBaseResponseChatMessageResponse } from '../models/ApiResultCursorPageBaseResponseChatMessageResponse';
import type { ApiResultMessage } from '../models/ApiResultMessage';
import type { ApiResultVoid } from '../models/ApiResultVoid';
import type { ChatMessageMarkRequest } from '../models/ChatMessageMarkRequest';
import type { ChatMessageRequest } from '../models/ChatMessageRequest';
import type { Message } from '../models/Message';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ChatControllerService {
    /**
     * updateMessage
     * @param requestBody
     * @returns ApiResultMessage
     * @throws ApiError
     */
    public static updateMessage(
        requestBody?: Message,
    ): CancelablePromise<ApiResultMessage> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/capi/chat/message',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * sendMessage
     * @param requestBody
     * @returns ApiResultVoid
     * @throws ApiError
     */
    public static sendMessage(
        requestBody?: ChatMessageRequest,
    ): CancelablePromise<ApiResultVoid> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/capi/chat/message',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * setMsgMark
     * @param requestBody
     * @returns ApiResultVoid
     * @throws ApiError
     */
    public static setMsgMark(
        requestBody?: ChatMessageMarkRequest,
    ): CancelablePromise<ApiResultVoid> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/capi/chat/message/mark',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * getMsgPage
     * @param roomId
     * @param pageSize
     * @param cursor
     * @returns ApiResultCursorPageBaseResponseChatMessageResponse
     * @throws ApiError
     */
    public static getMsgPage(
        roomId: number,
        pageSize?: number,
        cursor?: string,
    ): CancelablePromise<ApiResultCursorPageBaseResponseChatMessageResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/capi/chat/message/page',
            query: {
                'pageSize': pageSize,
                'cursor': cursor,
                'roomId': roomId,
            },
        });
    }
}
