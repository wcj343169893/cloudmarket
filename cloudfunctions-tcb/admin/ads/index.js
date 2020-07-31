'use strict';
const db = uniCloud.database();
const cmd = db.command;
const adCollection = db.collection("ads");

/**
 * 查询店铺所有的广告，最多支持5条，一次性查询完
 */
const list = async (data) => {
	const result = await adCollection.where({
		shopid: data.shopid
	}).get();
	if (result.data.length == 0) {
		data.message = "暂无数据";
		return false;
	}
	return result.data;
}
/**
 * 增加/修改广告
 */
const add = async (data) => {
	if (data.redirectType == "goods") {
		data.link = `/pages/product/product?id=${data.goods.id}`;
	} else if (data.redirectType == "docs") {
		data.link = `/pages/docs/docs?id=${data.docs.id}`;
	} else if (data.redirectType == "none") {
		data.link = "";
	}
	let _id = data._id;
	//update操作，不能有_id参数
	delete data._id;
	if (_id) {
		//修改
		const result = await adCollection.where({
			shopid: data.shopid,
			_id: _id
		}).limit(1).get();
		if (result.data.length == 0) {
			data.message = "原数据不存在";
			return false;
		}
		return await adCollection.where({
			shopid: data.shopid,
			_id: _id
		}).update(data);
	}
	return await adCollection.add(data);
}
/**
 * 删除广告
 */
const deletes = async (data) => {
	if (data.ids) {
		return await adCollection.where({
			shopid: data.shopid,
			_id: cmd.in(data.ids)
		}).remove();
	}
	data.message = "ID不存在";
	return false;
}

module.exports = {
	list: list,
	add: add,
	delete: deletes
}
