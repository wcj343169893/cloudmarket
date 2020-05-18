/**
 * 获取集合名称,更好管理多地区分站
 * @param {Object} event
 */
const getCollectionNames = function(event) {
	// 公用模块用法请参考 https://uniapp.dcloud.io/uniCloud/quickstart?id=common
	//基础
	var bases = ["users", "orders", "carts", "user_often_buy_shops", "user_recommend_shops"];
	//多地区
	var regions = ["ads", "shops", "shop_categories", "shop_comments", "goods", "goods_activities", "goods_categories"];
	var collections = {};
	//必须在正常范围内的地区
	if (event.stationId) {
		for (let coll of regions) {
			collections[coll] = "region_" + event.stationId + "_" + coll;
		}
	} else {
		bases = bases.concat(regions);
	}
	for (let coll of bases) {
		collections[coll] = coll;
	}
	return collections;
};
/**
 * 获取店铺信息
 * @param {Object} id
 */
const getShopInfoById = function(id) {

}

/**
 * 更新秒杀库存
 * @param {Object} ele 商品对象，必须存在_id,sku_id
 * @param {Object} xishu 相乘系数，1或者-1
 */
const updateGoodsMiaoshaStock = function(ele, xishu) {
	const db = uniCloud.database();
	const cmd = db.command;
	return db.collection('goods').where({
		_id: ele._id,
		"miaosha.stock": cmd.gte(ele.amount * xishu)
	}).update({
		miaosha: {
			stock: cmd.inc(-1 * ele.amount * xishu),
			sales: cmd.inc(ele.amount * xishu)
		}
	});
}
/**
 * 更新商品库存
 * @param {Object} ele 商品对象，必须存在_id,sku_id,amount,hasSku
 * @param {Object} xishu 相乘系数，1或者-1
 */
const updateGoodsStock = function(ele, xishu) {
	const db = uniCloud.database();
	const cmd = db.command;
	if (ele.hasSku) {
		let condition = {
			_id: ele._id,
			"skus.id": ele.sku_id
		};
		condition['skus.' + ele.sku_index + '.stock'] = cmd.gte(ele.amount * xishu);
		let data = {
			monthlySale: cmd.inc(ele.amount * xishu),
			stock: cmd.inc(-1 * ele.amount * xishu)
		};
		data['skus.' + ele.sku_index + '.stock'] = cmd.inc(-1 * ele.amount * xishu);
		data['skus.' + ele.sku_index + '.sales'] = cmd.inc(1 * ele.amount * xishu);
		return db.collection('goods').where(condition).update(data);
	} else {
		return db.collection('goods').where({
			_id: ele._id,
			stock: cmd.gte(ele.amount * xishu)
		}).update({
			monthlySale: cmd.inc(ele.amount * xishu),
			stock: cmd.inc(-1 * ele.amount * xishu)
		});
	}
}
/**
 * 更新用户订单数总计
 * @param {Object} uid
 * @param {Object} type 类型,-2:deleted已删除，-1:canceled已取消，0:unpaid未付款，1:payup已付款，2:delivered已发货，3:received已收货，4:estimated已评价，refunded退款
 * @param {Object} number 如果是负数，则减少
 * @param {Object} type2 类型转移到下一个类型，与type相反的数值
 */
const updateUserOrderCount = function(uid, type, number, type2) {
	const db = uniCloud.database();
	const cmd = db.command;
	let data = {
		order: {}
	};
	data.order[type] = cmd.inc(+number);
	if (type2) {
		data.order[type2] = cmd.inc(+number * -1);
	}
	console.log(uid,JSON.stringify(data));
	return db.collection("users").where({
		id: +uid
	}).update(data);
}

/**
 * 生成唯一id
 * @param {Object} key
 */
const genIdentityId = async function(key){
	const db = uniCloud.database();
	const cmd = db.command;
	//生成用户id----开始-----
	const identity = db.collection("identity");
	//获取用户id
	let res = await identity.where({
		"key":key
	}).update({
		value:cmd.inc(1)
	});
	//立马查询出来，可能值是对的
	let res2 = await identity.where({
		"key":key
	}).field({
		value:1
	}).get();
	return res2.data[0].value;
	//生成用户id----结束-----
}

module.exports = {
	getCollectionNames,
	updateGoodsMiaoshaStock,
	updateUserOrderCount,
	updateGoodsStock,
	genIdentityId
}
