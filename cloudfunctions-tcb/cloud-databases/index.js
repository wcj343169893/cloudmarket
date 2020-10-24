'use strict';
const db = uniCloud.database();
const cmd = db.command;
/**
 * 导出、导入集合数据
 */
exports.main = async (event, context) => {
	const {
		module,
		action,
		data
	} = event;
	let model = require(`./${module}`);
	return await model[action](data, context);
};
