'use strict';
const db = uniCloud.database();
const auth = uniCloud.auth();
exports.main = async (event, context) => {
	let type = event.type;
	if (!type) {
		//查询一条
		let data = await db.collection("documents").doc(event.id).field({
			title: 1,
			content: 1
		}).get();
		if (data.data.length == 0) {
			return {
				"code": 404,
				"message": "文档不存在",
			};
		}
		return {
			code: 200,
			message: "操作成功",
			data: data.data[0]
		};
	}
	let {
		customUserId
	} = await auth.getUserInfo();
	if (customUserId < 1) {
		return {
			"code": 401,
			"message": "用户信息不存在",
		};
	}
	if (type == "add") {
		let data = await db.collection("documents").add({
			...event.data,
			uid: +customUserId
		});
		return {
			code: 200,
			message: "添加成功",
			data: data
		};
	}
};
