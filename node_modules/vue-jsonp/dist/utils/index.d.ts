/**
 * Generate random string.
 *
 * @return { string }
 */
declare function randomStr(): string;
/**
 * Format params into querying string.
 *
 * @return {string[]}
 */
declare function formatParams(queryKey: string, value: any): string[];
/**
 * Flat querys.
 *
 * @param {string[] | (string[])[]} array
 * @returns
 */
declare function flatten(array: string[] | (string[])[]): string[];
export { formatParams, flatten, randomStr };
