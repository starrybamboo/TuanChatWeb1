/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddPostRequest } from '../models/AddPostRequest';
import type { ApiResult } from '../models/ApiResult';
import type { ApiResultCursorPageBaseResponsePost } from '../models/ApiResultCursorPageBaseResponsePost';
import type { ApiResultFullPostResponse } from '../models/ApiResultFullPostResponse';
import type { ApiResultPost } from '../models/ApiResultPost';
import type { Post } from '../models/Post';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CommunityControllerService {
    /**
     * getPost
     * @param postId
     * @returns ApiResultPost
     * @throws ApiError
     */
    public static getPost(
        postId: number,
    ): CancelablePromise<ApiResultPost> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/capi/community/post',
            query: {
                'postId': postId,
            },
        });
    }
    /**
     * modifyPost
     * @param requestBody
     * @returns ApiResult
     * @throws ApiError
     */
    public static modifyPost(
        requestBody?: Post,
    ): CancelablePromise<ApiResult> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/capi/community/post',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * publishPost
     * @param requestBody
     * @returns ApiResult
     * @throws ApiError
     */
    public static publishPost(
        requestBody?: AddPostRequest,
    ): CancelablePromise<ApiResult> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/capi/community/post',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * deletePost
     * @param postId
     * @returns ApiResult
     * @throws ApiError
     */
    public static deletePost(
        postId: number,
    ): CancelablePromise<ApiResult> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/capi/community/post',
            query: {
                'postId': postId,
            },
        });
    }
    /**
     * getPostPage
     * @param pageSize
     * @param cursor
     * @returns ApiResultCursorPageBaseResponsePost
     * @throws ApiError
     */
    public static getPostPage(
        pageSize?: number,
        cursor?: string,
    ): CancelablePromise<ApiResultCursorPageBaseResponsePost> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/capi/community/post/page',
            query: {
                'pageSize': pageSize,
                'cursor': cursor,
            },
        });
    }
    /**
     * getImage
     * @param imageId
     * @returns ApiResult
     * @throws ApiError
     */
    public static getImage(
        imageId: number,
    ): CancelablePromise<ApiResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/capi/community/post/image',
            query: {
                'imageId': imageId,
            },
        });
    }
    /**
     * getPostFull
     * @param postId
     * @returns ApiResultFullPostResponse
     * @throws ApiError
     */
    public static getPostFull(
        postId: number,
    ): CancelablePromise<ApiResultFullPostResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/capi/community/post/full',
            query: {
                'postId': postId,
            },
        });
    }
}
