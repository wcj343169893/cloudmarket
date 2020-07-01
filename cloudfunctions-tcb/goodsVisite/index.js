'use strict';
const db = uniCloud.database();
const auth = uniCloud.auth();
/**
 * 商品浏览记录,按浏览时间倒序
 */
exports.main = async (event, context) => {
	let {customUserId} = await auth.getUserInfo();
	let uid = +customUserId;
	//商品浏览记录，每人每件商品只存在一条
	const visiteCollection = db.collection('goods_visites');
	let visite = await visiteCollection.where({
		uid: uid
	}).field({
		_id: 0,
		title:1,
		price:1,
		visite:1,
		goods_id: 1,
		src: 1,
		shopid: 1
	}).orderBy("time", "desc").limit(10).get();

	if (visite.data.length == 0) {
		return {
			"code": 404,
			"message": "无记录",
		};
	}
	return {
		"code": 200,
		"message": "操作成功",
		"data": visite.data
	};
};
