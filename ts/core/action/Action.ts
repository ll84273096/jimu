/* eslint-disable no-unused-vars */
import ActionDeliveryData from './ActionDeliverData';

export type IRunner = (data: ActionDeliveryData) => Promise<any>;

export interface IActionOptions {
    timeout?: number;
    isIgnoreError?: boolean;
}

const DEFAULT_OPTIONS: IActionOptions = {
    timeout: 10 * 3600,
    isIgnoreError: false
};

class Action {

    protected options: IActionOptions;
    private _runner: IRunner;

    constructor(runner: IRunner, options: IActionOptions = DEFAULT_OPTIONS) {
        this._runner = runner;
        this.options = options;
    }

    async start(data: ActionDeliveryData): Promise<any> {
        const { isIgnoreError, timeout } = this.options;
        const arrPromise: Promise<any>[] = [];
        let result: any;
        let timeoutIndex: any;

        arrPromise.push(this._runner(data));
        if (timeout > 0) {
            arrPromise.push(new Promise((resolve, reject) => {
                timeoutIndex = setTimeout(() => {
                    if (isIgnoreError) {
                        resolve();
                    } else {
                        reject(new Error());
                    }
                }, timeout);
            }));
        }
        try {
            result = await Promise.race(arrPromise);
        } catch (error) {
            if (isIgnoreError) {
                // 如果isIgnoreError为true则打印错误
                console.error(error);
            } else {
                // 如果isIgnoreError为false则抛出错误
                throw error;
            }
        } finally {
            // 不管成功或者失败都要移除timeout
            clearTimeout(timeoutIndex);
        }
        return result;
    }
}

export default Action;