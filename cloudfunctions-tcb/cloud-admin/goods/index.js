'use strict';
const db = uniCloud.database();
const cmd = db.command;
const goodsCollection = db.collection("goods");
const goodsDeleteCollection = db.collection("goods_deletes");
const {
	genIdentityId,
	shopGoodsInc
} = require('base-common');
const list = async (data, context) => {
	let page = +data.page;
	let limit = +data.limit;
	//商品类型,"online"在售,"miaosha"秒杀,"yushou"预售,"baokuan"爆款,"shouqin"即将售罄
	let state = data.state;
	let conditions = {
		shopid: data.shopid
	};
	let order = ["id", "desc"];
	//需要动态改变表
	let goodsCollection2 = goodsCollection;
	let fields = {
		"id": 1,
		"title": 1,
		"subTitle": 1,
		"stock": 1,
		"visite": 1,
		"src": 1,
		"shopid": 1,
		"operator": 1,
		"imgs": 1, //轮播图
		"score": 1,
		"price": 1,
		"isSold": 1,
		"default_checked_sku_id": 1, //多规格默认选中
		"isSold": 1,
		"skuname": 1,
		"skus": 1,
		"originPrice": 1,
		"monthlySale": 1,
		"categories": 1,
		"miaosha": 1,
		"manjian": 1,
		"modified": 1,
		"yuding": 1,
	};
	let time = new Date().getTime();
	switch (state) {
		case "online":
			//1所有
			conditions["isSold"] = 1;
			break;
		case "offline":
			//1所有
			conditions["isSold"] = 0;
			break;
		case "delete":
			//已删除，读取已删除表
			fields["deleteTime"] = 1;
			fields["deleteOperator"] = 1;
			goodsCollection2 = goodsDeleteCollection;
			break;
		case "miaosha":
			//2秒杀,必须是有效的
			conditions["miaosha"] = cmd.exists(true);
			conditions["miaosha.endTime"] = cmd.gt(time);
			order = ["miaosha.beginTime", "asc"];
			break;
		case "miaoshaAdmin":
			//2秒杀,必须是有效的
			conditions = cmd.or({
				shopid: data.shopid,
				miaosha: cmd.exists(true)
			}, {
				shopid: data.shopid,
				miaoshaBackUp: cmd.exists(true)
			});
			//conditions["miaosha"] = cmd.exists(true);
			order = ["miaosha.beginTime", "desc"];
			//秒杀备份，用于暂停
			fields["miaoshaBackUp"] = 1;
			break;
		case "exmiaosha":
			//排除秒杀商品
			conditions["miaosha"] = cmd.exists(false);
			conditions["miaoshaBackUp"] = cmd.exists(false);
			break;
		case "yuding":
			//预售
			conditions["yuding"] = cmd.exists(true);
			break;
		case "baokuan":
			//爆款,按销量排序
			order = ["monthlySale", "desc"];
			break;
		case "shouqin":
			//即将售罄，库存小于10
			conditions["stock"] = cmd.lt(10);
			order = ["stock", "asc"];
			break;
		default:
			break;
	}
	let res = await goodsCollection2.where(conditions).orderBy(...order).skip((page - 1) * limit).limit(limit).field(
		fields).get();
	if (res.data.length == 0) {
		//表示没有数据，默认提示语，可以省略
		//data.message = "暂无数据";
		return false;
	}
	return res.data;
}
/**
 * 新增/修改
 */
const save = async (data, context) => {
	//判断是新增还是修改
	let time = new Date().getTime();
	let _id = null;
	if (data._id && data._id != '') {
		_id = data._id;
		delete data._id;
	}
	if (_id) {
		//修改,验证所有权
		let isExists = await checkExists(_id, data.shopid);
		if (!isExists) {
			data.message = "原商品不存在";
			return false;
		}
		data["modified"] = time;
		let res = await goodsCollection.doc(_id).update(data);
		if (res.goodsList == 0) {
			//更新失败
			data.message = "更新商品失败";
			return false;
		}
		//更新成功
		return res;
	}
	//新增
	data["id"] = await genIdentityId("goods");
	//默认上线时间
	data["onlineTime"] = time;
	//创建时间
	data["created"] = time;
	//好评默认100%
	data["score"] = 1;
	//月售，真实月售需要结合定时器，每日凌晨更新goods_day_sales到goods里面
	data["monthlySale"] = 0;
	//默认浏览0
	data["visite"] = 0;
	//是否销售
	data["isSold"] = 1;
	let res = await goodsCollection.add(data);
	//更新店铺商品统计
	if (res.id) {
		await shopGoodsInc(data.shopid, "online", 1);
	}
	return res.id;
}
/**
 * 删除，delete是关键词
 */
const deletes = async (data) => {
	//修改,验证所有权
	let oldGoods = await goodsCollection.where({
		_id: data._id,
		shopid: data.shopid
	}).limit(1).get();
	if (oldGoods.data.length == 0) {
		data.message = "原商品不存在";
		return false;
	}
	console.log("deletes", data._id);
	//移动商品到已删除表
	let goods = oldGoods.data[0];
	goods.deleteOperator = data.operator; //操作者
	goods.deleteTime = new Date().getTime(); //操作时间
	let res2 = await goodsDeleteCollection.add(goods);
	console.log("添加删除记录", res2);
	//移除数据有风险，操作需谨慎
	let res = await goodsCollection.where({
		_id: data._id,
		shopid: data.shopid
	}).remove();
	if (res.deleted == 1) {
		//增加店铺商品统计
		let type = "online";
		if (!goods.isSold) {
			//已下架商品
			type = "offline";
		}
		await shopGoodsInc(data.shopid, "delete", 1, type);
	}
	return res;
}
/**
 * 恢复数据到售卖场
 */
const reverts = async (data) => {
	//修改,验证所有权
	let oldGoods = await goodsDeleteCollection.where({
		_id: data._id,
		shopid: data.shopid
	}).limit(1).get();
	if (oldGoods.data.length == 0) {
		data.message = "原商品不存在";
		return false;
	}
	console.log("deletes", data._id);
	//移动商品到已删除表
	let goods = oldGoods.data[0];
	goods.revertOperator = data.operator; //操作者
	goods.onlineTime = goods.revertTime = new Date().getTime(); //操作时间
	//移除删除时间
	delete goods.deleteTime;
	let res2 = await goodsCollection.add(goods);
	console.log("恢复商品记录", res2);
	//移除数据有风险，操作需谨慎
	let res = await goodsDeleteCollection.where({
		_id: data._id,
		shopid: data.shopid
	}).remove();
	if (res.deleted == 1) {
		//增加店铺商品统计
		let type = "online";
		if (!goods.isSold) {
			//已下架商品
			type = "offline";
		}
		await shopGoodsInc(data.shopid, type, 1, "delete");
	}
	return res;
}
/**
 * 清理已删除商品
 */
const cleans = async (data) => {
	//修改,验证所有权
	let oldGoods = await goodsDeleteCollection.where({
		_id: data._id,
		shopid: data.shopid
	}).limit(1).get();
	if (oldGoods.data.length == 0) {
		data.message = "原商品不存在";
		return false;
	}
	//移除数据有风险，操作需谨慎
	let res = await goodsDeleteCollection.where({
		_id: data._id,
		shopid: data.shopid
	}).remove();
	await shopGoodsInc(data.shopid, "delete", -1);
	console.log("清理已删除商品", res)
	return res;
}

/**
 * 下架商品
 */
const soldOut = async (data) => {
	//修改,验证所有权
	let isExists = await checkExists(data._id, data.shopid);
	if (!isExists) {
		data.message = "原商品不存在";
		return false;
	}
	let res = await goodsCollection.doc(data._id).update({
		isSold: 0,
		operator: data.operator, //操作者
		offlineTime: new Date().getTime()
	});
	if (res.updated == 1) {
		//店铺商品统计
		await shopGoodsInc(data.shopid, "offline", 1, "online");
	}
	return res;
}
/**
 * 上架商品
 */
const soldIn = async (data) => {
	//修改,验证所有权
	let isExists = await checkExists(data._id, data.shopid);
	if (!isExists) {
		data.message = "原商品不存在";
		return false;
	}
	let res = await goodsCollection.doc(data._id).update({
		isSold: 1,
		operator: data.operator, //操作者
		onlineTime: new Date().getTime()
	});
	console.log("soldIn", res);
	if (res.updated == 1) {
		//店铺商品统计
		await shopGoodsInc(data.shopid, "online", 1, "offline");
	}
	return res;
}
/**
 * 查询一条商品信息，本店铺
 */
const info = async (data) => {
	console.log("goods info", data);
	return await getOneGoods({
		_id: data._id,
		shopid: +data.shopid
	});
}
/**
 * 暂停秒杀miaoshaBackUp
 */
const pauseMiaosha = async (data) => {
	const goods = await getOneGoods({
		_id: data._id,
		shopid: +data.shopid
	}, {
		miaosha: 1
	});
	if (!goods) {
		data.message = "原商品不存在";
		return false;
	}
	return await goodsCollection.doc(data._id).update({
		miaosha: cmd.remove(),
		miaoshaBackUp: goods.miaosha
	});
}
/**
 * 删除商品秒杀
 */
const cancelMiaosha = async (data) => {
	const goods = await getOneGoods({
		_id: data._id,
		shopid: +data.shopid
	}, {
		miaosha: 1
	});
	if (!goods) {
		data.message = "原商品不存在";
		return false;
	}
	return await goodsCollection.doc(data._id).update({
		miaosha: cmd.remove()
	});
}
/**
 * 重新开始秒杀
 */
const restartMiaosha = async (data) => {
	const goods = await getOneGoods({
		_id: data._id,
		shopid: +data.shopid
	}, {
		miaoshaBackUp: 1
	});
	if (!goods) {
		data.message = "原商品不存在";
		return false;
	}
	return await goodsCollection.doc(data._id).update({
		miaoshaBackUp: cmd.remove(),
		miaosha: goods.miaoshaBackUp
	});
}
/**
 * 新增/修改秒杀
 */
const addMiaosha = async (data) => {
	const goods = await getOneGoods({
		_id: data._id,
		shopid: +data.shopid
	}, {
		id: 1
	});
	if (!goods) {
		data.message = "原商品不存在";
		return false;
	}
	let saveData = {};
	saveData[data.field] = data.miaosha;
	//商品变化了,移除旧商品的秒杀信息
	if (data.oldId && data.oldId != data._id) {
		let removeData = {};
		removeData[data.field] = cmd.remove();
		goodsCollection.doc(data._id).update(removeData);
	}
	return await goodsCollection.doc(data._id).update(saveData);
}
/**
 * 检查商品是否存在
 */
const checkExists = async (_id, shopid) => {
	let oldGoods = await goodsCollection.where({
		_id: _id,
		shopid: shopid
	}).count();
	return oldGoods.total > 0;
}
/**
 * 根据条件，查询一条商品
 */
const getOneGoods = async (conditions, fields) => {
	const goodsQuery = goodsCollection.where(conditions)
	if (fields) {
		goodsQuery.field(fields);
	}
	const goods = await goodsQuery.limit(1).get();
	if (goods.data.length == 0) {
		return false;
	}
	return goods.data[0];
}

module.exports = {
	list: list,
	save: save,
	delete: deletes,
	revert: reverts,
	clean: cleans,
	soldOut: soldOut,
	soldIn: soldIn,
	info: info,
	pauseMiaosha: pauseMiaosha,
	restartMiaosha: restartMiaosha,
	addMiaosha: addMiaosha,
	cancelMiaosha: cancelMiaosha
}
