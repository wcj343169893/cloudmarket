/**
 * Vue Jsonp.
 * # Carry Your World #
 *
 * @author: LancerComet
 * @license: MIT
 */
import { PluginObject } from 'vue/types/plugin';
declare module 'vue/types/vue' {
    interface Vue {
        $jsonp: typeof jsonp;
    }
}
/**
 * Vue JSONP.
 */
declare const VueJsonp: PluginObject<never>;
/**
 * JSONP function.
 *
 * @param { string } url Target URL address.
 * @param { IJsonpParam } param Querying params object.
 * @param { number } timeout Timeout setting (ms).
 *
 * @example
 * jsonp('/url', {
 *   callbackQuery: ''
 *   callbackName: '',
 *   name: 'LancerComet',
 *   age: 26
 * }, 1000)
 */
declare function jsonp<T = any>(url: string, param?: IJsonpParam, timeout?: number): Promise<T>;
export { VueJsonp, jsonp };
/**
 * JSONP parameter declaration.
 */
interface IJsonpParam {
    /**
     * Callback query name.
     * This param is used to define the query name of the callback function.
     *
     * @example
     * // The request url will be "/some-url?myCallback=jsonp_func&myCustomUrlParam=veryNice"
     * jsonp('/some-url', {
     *   callbackQuery: 'myCallback',
     *   callbackName: 'jsonp_func',
     *   myCustomUrlParam: 'veryNice'
     * })
     *
     * @default callback
     */
    callbackQuery?: string;
    /**
     * Callback function name.
     * This param is used to define the jsonp function name.
     *
     * @example
     * // The request url will be "/some-url?myCallback=jsonp_func&myCustomUrlParam=veryNice"
     * jsonp('/some-url', {
     *   callbackQuery: 'myCallback',
     *   callbackName: 'jsonp_func',
     *   myCustomUrlParam: 'veryNice'
     * })
     *
     * @default jsonp_ + randomStr()
     */
    callbackName?: string;
    /**
     * Custom data.
     */
    [key: string]: any;
}
