'use strict';
const db = uniCloud.database();
const cmd = db.command;
const goodsCollection = db.collection("cloud_goods");
const categoryCollection = db.collection("cloud_goods_categories");
const goodsDeleteCollection = db.collection("cloud_goods_deletes");
const {
	genIdentityId
} = require('base-common');
const list = async (data, context) => {
	const {
		page,
		limit,
		key,
		shopid,
		state
	} = data;
	//商品类型,"online"在售,"miaosha"秒杀,"yushou"预售,"baokuan"爆款,"shouqin"即将售罄
	let conditions = {
		shopid
	};
	let order = ["id", "desc"];
	//需要动态改变表
	let goodsCollection2 = goodsCollection;
	let fields = {
		id: 1,
		title: 1,
		subTitle: 1,
		stock: 1,
		visite: 1,
		upc: 1,
		src: 1,
		shopid: 1,
		operator: 1,
		imgs: 1, //轮播图
		score: 1,
		price: 1,
		isSold: 1,
		default_checked_sku_id: 1, //多规格默认选中
		isSold: 1,
		isCategoryShow: 1,
		isRecommend: 1,
		offlineNotice: 1,
		offlineTime: 1,
		skuname: 1,
		skus: 1,
		originPrice: 1,
		monthlySale: 1,
		categories: 1,
		miaosha: 1,
		manjian: 1,
		modified: 1,
		saleType: 1,
		onlySelfTake: 1,
		yuding: 1,
		tuangou: 1,
		banner: 1,
		manufacture: 1,
		guarantee_period: 1,
		storage_condition: 1,
		net_weight: 1,
		service_purpose: 1,
		deliveryTags: 1,
		description: 1
	};
	let time = new Date().getTime();
	getStateCondition(state, shopid, conditions, order, fields);
	if (state == "delete") {
		goodsCollection2 = goodsDeleteCollection;
	}
	if (key && key.trim().length > 0) {
		conditions["title"] = new RegExp(key.trim());
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
	//只要有一个分类不显示，则都不显示
	data.isCategoryShow = 1;
	if (data.categories) {
		data.categories.map(cate => {
			if (!cate.isShow) {
				data.isCategoryShow = 0;
			}
		})
	}
	if (_id) {
		//修改,验证所有权
		let isExists = await checkExists(_id, data.shopid);
		if (!isExists) {
			data.message = "原商品不存在";
			return false;
		}
		data["modified"] = time;
		let sts = ["miaosha", "yuding", "tuangou"];
		if (data.saleType == "normal") {
			for (let st of sts) {
				data[st] = cmd.remove();
			}
		}
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
	return res.id;
}
/**
 * 复制一条数据
 */
const copy = async (data, context) => {
	let goods = await getOneGoods({
		_id: data._id,
		shopid: +data.shopid
	});
	if (!goods) {
		return false;
	}
	delete goods._id;
	delete goods.id;
	let res = await save(goods, context);
	goods._id = res;
	return goods;
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
	console.log("清理已删除商品", res)
	return res;
}

/**
 * 推荐/取消推荐商品
 */
const recommend = async (data) => {
	const {
		isRecommend,
		_id,
		shopid
	} = data;
	//修改,验证所有权
	let goods = await getOneGoods({
		_id,
		shopid
	}, {
		categories: 1,
		isRecommend: 1
	});
	if (!goods) {
		data.message = "原商品不存在";
		return false;
	}
	//如果推荐状态一致，则不操作，正常不会出现这种情况
	if (goods.isRecommend == isRecommend) {
		data.message = "原商品未修改";
		return false;
	}
	let res = await goodsCollection.doc(_id).update({
		isRecommend: isRecommend
	});
	let amount = isRecommend ? 1 : -1
	//更新商品的推荐商品数量
	let cids = [];
	goods.categories.map(cate => {
		cids.push(cate.id);
	})
	//更新分类的推荐商品数量
	await categoryCollection.where({
		id: cmd.in(cids),
		shopid
	}).update({
		recommendGoods: cmd.inc(amount)
	});
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
		offlineNotice: "管理员手动下架",
		offlineTime: new Date().getTime()
	});
	return res;
}
/**
 * 下架所有商品
 */
const soldOutAll = async (data) => {
	const {
		state,
		shopid
	} = data;
	let conditions = {
			shopid,
			isSold: 1
		},
		order = [],
		fields = {};
	getStateCondition(state, shopid, conditions, order, fields);
	//修改
	let res = await goodsCollection.where(conditions).update({
		isSold: 0,
		operator: data.operator, //操作者
		offlineNotice: "管理员手动下架",
		offlineTime: new Date().getTime()
	});
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
	return res;
}
/**
 * 上架所有商品
 */
const soldInAll = async (data) => {
	const {
		state,
		shopid
	} = data;
	let conditions = {
			shopid,
			isSold: 0
		},
		order = [],
		fields = {};
	getStateCondition(state, shopid, conditions, order, fields);
	//修改
	let res = await goodsCollection.where(conditions).update({
		isSold: 1,
		operator: data.operator, //操作者
		onlineTime: new Date().getTime()
	});
	console.log("soldIn", res);
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

const getStateCondition = (state, shopid, conditions, order, fields) => {
	let time = new Date().getTime();
	switch (state) {
		case "online":
			//1所有在售
			conditions["isSold"] = 1;
			conditions["isCategoryShow"] = 1;
			break;
		case "offline":
			//1所有下架
			/* conditions["isSold"] = 0; */
			conditions = cmd.or({
				shopid,
				isSold: 0
			}, {
				shopid,
				isCategoryShow: 0
			});
			order = ["offlineTime", "desc"];
			break;
		case "delete":
			//已删除，读取已删除表
			fields["deleteTime"] = 1;
			fields["deleteOperator"] = 1;
			//goodsCollection2 = goodsDeleteCollection;
			break;
		case "tuangou":
			//团购
			conditions["tuangou"] = cmd.exists(true);
			conditions["tuangou.pickup"] = cmd.gt(time);
			order = ["tuangou.pickup", "asc"];
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
				shopid,
				miaosha: cmd.exists(true)
			}, {
				shopid,
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
			order = ["yuding.endTime", "desc"];
			break;
		case "baokuan":
			//爆款,按销量排序
			order = ["monthlySale", "desc"];
			conditions["monthlySale"] = cmd.gt(100)
			break;
		case "shouqin":
			//即将售罄，库存小于10
			conditions["isSold"] = 1;
			conditions["stock"] = cmd.lt(10);
			order = ["stock", "asc"];
			break;
		case "recommend":
			//即将售罄，库存小于10
			conditions["isSold"] = 1;
			conditions["isCategoryShow"] = 1;
			conditions["isRecommend"] = true;
			break;
		default:
			break;
	}
}

module.exports = {
	list: list,
	save: save,
	delete: deletes,
	copy,
	revert: reverts,
	clean: cleans,
	soldOut: soldOut,
	soldOutAll,
	soldIn: soldIn,
	soldInAll,
	info: info,
	pauseMiaosha: pauseMiaosha,
	restartMiaosha: restartMiaosha,
	addMiaosha: addMiaosha,
	cancelMiaosha: cancelMiaosha,
	recommend
}
