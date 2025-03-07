/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
    /**
     * 添加点赞
     * @param postId
     * @returns void
     * @throws ApiError
     */
    public static postPostLike(
        postId?: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/postLike',
            query: {
                'postId': postId,
            },
        });
    }
    /**
     * 取消点赞
     * @param postId
     * @returns any
     * @throws ApiError
     */
    public static deletePostLike(
        postId?: string,
    ): CancelablePromise<{
        success: boolean;
        errCode: null;
        errMsg: null;
        data: null;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/postLike',
            query: {
                'postId': postId,
            },
        });
    }
    /**
     * 检查对单一帖子是否点赞
     * @param postId
     * @returns any
     * @throws ApiError
     */
    public static getPostLikeCheck(
        postId?: string,
    ): CancelablePromise<{
        success: boolean;
        errCode: null;
        errMsg: null;
        data: boolean;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/postLike/check',
            query: {
                'postId': postId,
            },
        });
    }
    /**
     * 批量检查是否点赞
     * @param postIds
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static getPostLikeCheckList(
        postIds?: number,
        requestBody?: Array<any>,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/postLike/check/list',
            query: {
                'postIds': postIds,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 添加关注
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static postSubscribe(
        requestBody?: any,
    ): CancelablePromise<{
        success: boolean;
        errCode: null;
        errMsg: null;
        data: null;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/subscribe',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 取消关注
     * @param userId
     * @param targetUserId
     * @returns any
     * @throws ApiError
     */
    public static deleteSubscribe(
        userId?: string,
        targetUserId?: string,
    ): CancelablePromise<{
        success: boolean;
        errCode: null;
        errMsg: null;
        data: null;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/subscribe',
            query: {
                'userId': userId,
                'targetUserId': targetUserId,
            },
        });
    }
    /**
     * 判断是否关注
     * @param userId
     * @param targetUserId
     * @returns any
     * @throws ApiError
     */
    public static getSubscribeCheck(
        userId?: string,
        targetUserId?: string,
    ): CancelablePromise<{
        success: boolean;
        errCode: null;
        errMsg: null;
        data: {
            uid: number;
            isSubscribed: boolean;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/subscribe/check',
            query: {
                'userId': userId,
                'targetUserId': targetUserId,
            },
        });
    }
    /**
     * 批量判断是否关注
     * @param userId
     * @param targetUserIds
     * @returns any
     * @throws ApiError
     */
    public static getSubscribeCheckList(
        userId?: string,
        targetUserIds?: Array<string>,
    ): CancelablePromise<{
        success: boolean;
        errCode: null;
        errMsg: null;
        data: {
            checkedList: Array<{
                uid: number;
                isSubscribed: boolean;
            }>;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/subscribe/check/list',
            query: {
                'userId': userId,
                'targetUserIds': targetUserIds,
            },
        });
    }
    /**
     * 获取关注列表
     * @param pageSize
     * @param cursor
     * @returns any
     * @throws ApiError
     */
    public static getSubscribePage(
        pageSize?: string,
        cursor?: string,
    ): CancelablePromise<{
        success: boolean;
        errCode: null;
        errMsg: null;
        data: {
            cursor: string;
            isLast: boolean;
            list: Array<{
                userId: number;
                targetUserId: number;
                createTime: string;
            }>;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/subscribe/page',
            query: {
                'pageSize': pageSize,
                'cursor': cursor,
            },
        });
    }
    /**
     * 添加关注
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static postPostStar(
        requestBody?: any,
    ): CancelablePromise<{
        success: boolean;
        errCode: null;
        errMsg: null;
        data: null;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/postStar',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 取消关注
     * @param starId
     * @returns any
     * @throws ApiError
     */
    public static deletePostStar(
        starId?: string,
    ): CancelablePromise<{
        success: boolean;
        errCode: null;
        errMsg: null;
        data: null;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/postStar',
            query: {
                'starId': starId,
            },
        });
    }
    /**
     * 按收藏id获取帖子(不含图)
     * @param starId
     * @returns any
     * @throws ApiError
     */
    public static getPostStar(
        starId?: string,
    ): CancelablePromise<{
        success: boolean;
        errCode: null;
        errMsg: null;
        data: {
            postId: number;
            userId: number;
            title: string;
            content: string;
            coverUrl: string;
            likeNumber: number;
            commentNumber: number;
            starNumber: number;
            createTime: string;
            updateTime: string;
            status: null;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/postStar',
            query: {
                'starId': starId,
            },
        });
    }
    /**
     * 修改收藏信息
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static putPostStar(
        requestBody?: any,
    ): CancelablePromise<{
        success: boolean;
        errCode: null;
        errMsg: null;
        data: null;
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/postStar',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 新建收藏夹
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static postPostFavorites(
        requestBody?: any,
    ): CancelablePromise<{
        success: boolean;
        errCode: null;
        errMsg: null;
        data: null;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/postFavorites',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 根据收藏夹id获取收藏列表
     * @param favoritesId
     * @returns any
     * @throws ApiError
     */
    public static getPostFavorites(
        favoritesId?: string,
    ): CancelablePromise<{
        success: boolean;
        errCode: null;
        errMsg: null;
        data: {
            userId: number;
            name: string;
            postStars: Array<{
                starId?: number;
                userId?: number;
                favoritesId?: number;
                postId?: number;
                createTime?: string;
                updateTime?: string;
            }>;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/postFavorites',
            query: {
                'favoritesId': favoritesId,
            },
        });
    }
    /**
     * 修改收藏夹
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static putPostFavorites(
        requestBody?: any,
    ): CancelablePromise<{
        success: boolean;
        errCode: null;
        errMsg: null;
        data: null;
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/postFavorites',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 删除收藏夹
     * @param favoritesId
     * @returns any
     * @throws ApiError
     */
    public static deletePostFavorites(
        favoritesId?: string,
    ): CancelablePromise<{
        success: boolean;
        errCode: null;
        errMsg: null;
        data: null;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/postFavorites',
            query: {
                'favoritesId': favoritesId,
            },
        });
    }
    /**
     * 按照用户id获取收藏夹列表
     * @param userId
     * @returns any
     * @throws ApiError
     */
    public static getPostFavoritesList(
        userId?: string,
    ): CancelablePromise<{
        success: boolean;
        errCode: null;
        errMsg: null;
        data: {
            favoritesList: Array<{
                favoritesId: number;
                name: string;
            }>;
        };
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/postFavorites/list',
            query: {
                'userId': userId,
            },
        });
    }
    /**
     * 发布评论
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static postPostComment(
        requestBody?: any,
    ): CancelablePromise<{
        success: boolean;
        errCode: null;
        errMsg: null;
        data: null;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/postComment',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 修改评论
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static putPostComment(
        requestBody?: any,
    ): CancelablePromise<{
        success: boolean;
        errCode: null;
        errMsg: null;
        data: null;
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/postComment',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * 删除评论
     * @param commentId
     * @returns any
     * @throws ApiError
     */
    public static deletePostComment(
        commentId?: string,
    ): CancelablePromise<{
        success: boolean;
        errCode: null;
        errMsg: null;
        data: null;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/postComment',
            query: {
                'commentId': commentId,
            },
        });
    }
}
