/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddPostRequest } from '../models/AddPostRequest';
import type { ApiResult } from '../models/ApiResult';
import type { ApiResultCursorPageBaseResponsePost } from '../models/ApiResultCursorPageBaseResponsePost';
import type { ApiResultFullPostResponse } from '../models/ApiResultFullPostResponse';
import type { ApiResultPost } from '../models/ApiResultPost';
import type { CursorPageBaseReq } from '../models/CursorPageBaseReq';
import type { Post } from '../models/Post';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class CommunityControllerService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @param postId
     * @returns ApiResultPost OK
     * @throws ApiError
     */
    public getPost(
        postId: number,
    ): CancelablePromise<ApiResultPost> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/capi/community/post',
            query: {
                'postId': postId,
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
     * @param requestBody
     * @returns ApiResult OK
     * @throws ApiError
     */
    public modifyPost(
        requestBody: Post,
    ): CancelablePromise<ApiResult> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/capi/community/post',
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
     * @returns ApiResult OK
     * @throws ApiError
     */
    public publishPost(
        requestBody: AddPostRequest,
    ): CancelablePromise<ApiResult> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/capi/community/post',
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
     * @param postId
     * @returns ApiResult OK
     * @throws ApiError
     */
    public deletePost(
        postId: number,
    ): CancelablePromise<ApiResult> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/capi/community/post',
            query: {
                'postId': postId,
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
     * @returns ApiResultCursorPageBaseResponsePost OK
     * @throws ApiError
     */
    public getPostPage(
        request: CursorPageBaseReq,
    ): CancelablePromise<ApiResultCursorPageBaseResponsePost> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/capi/community/post/page',
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
     * @param imageId
     * @returns ApiResult OK
     * @throws ApiError
     */
    public getImage(
        imageId: number,
    ): CancelablePromise<ApiResult> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/capi/community/post/image',
            query: {
                'imageId': imageId,
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
     * @param postId
     * @returns ApiResultFullPostResponse OK
     * @throws ApiError
     */
    public getPostFull(
        postId: number,
    ): CancelablePromise<ApiResultFullPostResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/capi/community/post/full',
            query: {
                'postId': postId,
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
