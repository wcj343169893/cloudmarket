'use strict';
const db = uniCloud.database();
const auth = uniCloud.auth();
exports.main = async (event, context) => {
	let id = +event.id;
	let {customUserId} = await auth.getUserInfo();
	if (customUserId < 1) {
		return {
			"code": 401,
			"message": "用户信息不存在",
		};
	}
	let uid = +customUserId;
	//2验证用户是否有管理店铺的权限
	let res = await db.collection("shops").where({
		id: id
	}).limit(1).get();
	if (res.data.length == 0) {
		return {
			"code": 404,
			"message": "店铺不存在",
		};
	}
	let shopinfo = res.data[0];

	return {
		"code": 200,
		"message": "操作成功",
		"data": shopinfo
	};
};
