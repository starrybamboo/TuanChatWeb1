/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type DiceDTO = {
    type?: DiceDTO.type;
    abilityName?: string;
    point?: number;
    successLevelEnum?: DiceDTO.successLevelEnum;
    rollPoint?: number;
};
export namespace DiceDTO {
    export enum type {
        RC = 'RC',
        RD = 'RD',
    }
    export enum successLevelEnum {
        CRITICAL_SUCCESS = 'CRITICAL_SUCCESS',
        EXTREME_SUCCESS = 'EXTREME_SUCCESS',
        HARD_SUCCESS = 'HARD_SUCCESS',
        REGULAR_SUCCESS = 'REGULAR_SUCCESS',
        FAILURE = 'FAILURE',
        FUMBLE = 'FUMBLE',
    }
}

