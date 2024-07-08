'use strict';
const {
	getConfig
} = require("configs");
exports.main = async (event, context) => {
	let config = getConfig("express");
	const {
		action,
		data,
		Type
	} = event;
	console.log(config);
	let model = require(`./company/${config.api}`);
	if (!model) {
		return {
			code: 404,
			message: "模块不存在",
		}
	}
	let result = false;
	try {
		result = await model[action](data, context);
	} catch (e) {
		console.log("error", event, e);
		return {
			code: 500,
			message: "系统错误",
			...e
		}
	}
	if (!result) {
		return {
			code: 404,
			message: "暂无数据",
			...data
		};
	} else if (result.code > 0) {
		return {
			code: 404,
			message: result.msg || "暂无数据",
		}
	}
	return {
		code: 200,
		data: result,
		message: "操作成功"
	};
};
