/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GeneralMessage = {
    /**
     * 会话id
     */
    roomId: number;
    /**
     * 消息类型 1文本消息 2撤回消息 3.图片消息 4.文件 5.语音 6视频
     */
    msgType: number;
    /**
     * 消息内容 根据类型不同请求不同
     */
    body: any;
};

