'use strict';
const db = uniCloud.database();
const cmd = db.command;
/**
 * 导出、导入集合数据
 */
exports.main = async (event, context) => {
	let {
		module,
		action,
		data,
		path
	} = event;
	if (path) {
		//开启url后，有些通知,不需要登录
		let paths = path.split("/");
		//模块
		module = paths[1];
		//action
		action = paths[2];
		if (!data) {
			data = {};
		}
		if (paths.length > 2) {
			//子模块
			data.module = paths[3];
		}
		//合并get和post参数到data里面，数据类型全部是string
		if (event.queryStringParameters) {
			data = Object.assign(data, event.queryStringParameters);
		}
		if (event.body) {
			data = Object.assign(data, querystring.parse(event.body));
		}
		console.log(module, action, data);
	}
	let model = require(`./${module}`);
	let result;
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
	} else if (result.statusCode > 0) {
		return result;
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
