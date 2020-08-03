'use strict';
const db = uniCloud.database();
const auth = uniCloud.auth();
exports.main = async (event, context) => {
	let type = event.type;
	let query = db.collection("documents");
	let data;
	if (event.id) {
		data = await query.doc(event.id).field({
			title: 1,
			content: 1
		}).get();
	} else if (event.type) {
		data = await query.where({
			type: event.type
		}).field({
			title: 1,
			content: 1
		}).limit(10).get();
	}
	//查询一条
	if (data.data.length == 0) {
		return {
			"code": 404,
			"message": "文档不存在",
		};
	}
	let index = 0;
	//随机返回一条
	if (data.data.length > 1) {
		index = parseInt(Math.random() * data.data.length);
	}
	return {
		code: 200,
		message: "操作成功",
		data: data.data[index]
	};
};
