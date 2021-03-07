'use strict';
const db = uniCloud.database();
const cmd = db.command;
const categoryCollection = db.collection("cloud_goods_categories");
const goodsCollection = db.collection("cloud_goods");
const {
	genIdentityId
} = require('base-common');
/**
 * 查询店铺所有分类
 */
const list = async (data, context) => {
	//查询列表
	let categories = await categoryCollection.where({
		shopid: data.shopid
	}).orderBy("posid", "asc").get();
	if (categories.data.length == 0) {
		//data.message = "暂无数据";
		console.log(data)
		return false;
	}
	//parent_id处理成上下级关系
	let childrenMap = {};
	let parentList = [];
	//过滤不显示的子集
	categories.data.forEach(cate => {
		cate.children = [];
		if (!cate.parent_id) {
			parentList.push(cate);
		} else {
			if (!childrenMap[cate.parent_id]) {
				childrenMap[cate.parent_id] = [];
			}
			childrenMap[cate.parent_id].push(cate);
		}
	})
	//前端只需要2级分类
	parentList.forEach(pcat => {
		if (childrenMap[pcat._id]) {
			pcat.children = childrenMap[pcat._id];
		}
	});
	return parentList;
}

const save = async (data) => {
	if (!data.data) {
		data.message = "数据不能为空";
		return false;
	}
	let newCount = 0;
	let existsData = [];
	//查询店铺旧数据
	let res = await categoryCollection.where({
		shopid: data.shopid
	}).field({
		id: 1,
		isShow: 1
	}).get();
	//老数据的_id
	let oldData = res.data.map(ele => ele._id);
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
	let posid = 0;
	let shopid = data.shopid;
	const saveCategories = async (data, parent_id, pid) => {
		for (let ele of data) {
			ele.name = checkCategoryName(ele.name);
			let children = [];
			if (ele.children) {
				children = [...ele.children];
			}
			delete ele.children;
			ele.posid = posid;
			let _id;
			if (!ele._id) {
				if (!ele.id) {
					ele.id = getNewNumber();
				}
				//新增
				Object.assign(ele, {
					shopid,
					pid,
					parent_id,
					goodsCount: 0,
					recommendGoods: 0,
					created: Date.now(),
					modified: Date.now(),
				})
				let res = await categoryCollection.add(ele);
				_id = res.id;
			} else {
				_id = ele._id;
				ele.modified = Date.now();
				//已经存在的分类
				existsData.push(_id);
				delete ele._id;
				await categoryCollection.doc(_id).update(ele);
			}
			posid++;
			if (children.length > 0) {
				await saveCategories(children, _id, ele.id);
			}
		}
	}
	//新增或者修改
	await saveCategories(data.data, "", 0);
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
/**
 * 转换分类，以前的子集children，改为平铺parent_id
 */
const exchange = async (data) => {
	console.log("开始转换分类")
	//查询列表
	let categories = await categoryCollection.where({
		shopid: data.shopid
	}).orderBy("posid", "asc").get();
	if (categories.data.length == 0) {
		//data.message = "暂无数据";
		console.log(data)
		return false;
	}
	return await save({
		data: categories.data,
		shopid: data.shopid
	});
}

module.exports = {
	list,
	save,
	exchange
}
