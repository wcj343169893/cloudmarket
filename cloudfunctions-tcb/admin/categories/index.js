'use strict';
const db = uniCloud.database();
const cmd = db.command;
const categoryCollection = db.collection("goods_categories");
const {
	genIdentityId
} = require('base-common');
/**
 * 查询店铺所有分类
 */
const list = async (data,context) => {
	//查询列表
	let res = await categoryCollection.where({
		shopid: data.shopid
	}).orderBy("posid", "asc").get();
	if (res.data.length == 0) {
		//data.message = "暂无数据";
		console.log(data)
		return false;
	}
	return res.data;
}

const save = async (data) => {

};
module.exports = {
	list: list,
	save: save
}
