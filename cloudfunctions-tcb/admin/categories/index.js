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
const list = async (data, context) => {
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
	if (!data.data) {
		data.message = "数据不能为空";
		return false;
	}
	//查询店铺旧数据
	let res = await categoryCollection.where({
		shopid: data.shopid
	}).field({
		id: 1
	}).get();
	let oldData = [];
	let newCount = 0;
	let existsData = [];
	if (res.data.length > 0) {
		res.data.map(ele => {
			oldData.push(ele._id)
		})
	}
	//计算新增个数
	data.data.map(ele => {
		if (!ele.id) {
			newCount++;
		}
		if (ele.children) {
			ele.children.map(ele2 => {
				if (!ele2.id) {
					newCount++;
				}
			})
		}
	});
	let firstId = 0;
	if (newCount > 0) {
		let lastId = await genIdentityId("goods_categories", newCount);
		firstId = lastId - newCount;
	}
	const getNewNumber = function() {
		return firstId++;
	}
	//新增或者修改
	for (let ele of data.data) {
		ele.name = checkCategoryName(ele.name);
		if (!ele.id) {
			//新增
			ele.id = getNewNumber();
			if (ele.children) {
				ele.children.forEach(ele2 => {
					ele2.name = checkCategoryName(ele2.name);
					ele2.id = getNewNumber();
				})
			}
			Object.assign(ele, {
				shopid: data.shopid,
				pid: 0,
				goodsCount: 0,
				posid: 0
			})
			await categoryCollection.add(ele);
		} else {
			let id = ele._id;
			existsData.push(id);
			//修改,包含修改子类
			ele.shopid = data.shopid;
			if (ele.children) {
				ele.children.forEach(ele2 => {
					ele2.name = checkCategoryName(ele2.name);
					if (!ele2.id) {
						ele2.id = getNewNumber();
					}
				})
			}
			delete ele._id;
			await categoryCollection.doc(id).update(ele);
		}
	}
	//获取旧数据与存在数据的差集
	let delData = oldData.filter(function(v) {
		return existsData.indexOf(v) === -1;
	});
	//删除旧数据
	if (delData && delData.length > 0) {
		console.log("delete data", delData);
		await categoryCollection.where({
			_id: cmd.in(delData)
		}).remove();
	}
	return true;
};
/**
 * 检查分类默认名称
 */
const checkCategoryName = (name) => {
	if (name.trim() == "") {
		name = "新分类"
	}
	return name;
}
module.exports = {
	list: list,
	save: save
}
