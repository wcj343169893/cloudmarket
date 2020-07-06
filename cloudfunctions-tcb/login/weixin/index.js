'use strict';
const config = require("../config.json");/**
 * https://ext.dcloud.net.cn/plugin?id=1834
 */
const uniAccount = require('uni-account');
/**
 * 微信app/小程序自动验证
 * @param {Object} data
 * @param {Object} context
 */
const checkInfo = async function(data, context) {
	let platform = context.PLATFORM;
	let provider = data.channel;
	let uniAccountIns = uniAccount.initWeixin(config[platform]["oauth"][provider]);
	const {
		openid
	} = await uniAccountIns.code2Session(data.code);
	if (!openid) {
		return false;
	}
	return {
		platform,
		provider,
		openid
	};
}
module.exports = {
	checkInfo: checkInfo,
	ifNotExists: "new"
}
