'use strict';
const db = uniCloud.database();
const cmd = db.command;
const shopCollection = db.collection("shops");
const info = async (data, context) => {
	let res = await shopCollection.where({
		id: data.shopid
	}).limit(1).get();
	if (res.data.length == 0) {
		//表示没有数据，默认提示语，可以省略
		//data.message = "暂无数据";
		return false;
	}
	return res.data[0];
}
module.exports = {
	info: info,
}
