const db = uniCloud.database();
const cmd = db.command;
const userCollection = db.collection("uni-id-users");
const shopCollection = db.collection("cloud_shops");
const goodsCollection = db.collection('cloud_goods');
const userBalanceLogCollection = db.collection("cloud_user_balance_logs");
const identityCollection = db.collection("cloud_identity");
const cacheCollection = db.collection("cloud_identity");

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
	return goodsCollection.where({
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
		return goodsCollection.where(condition).update(data);
	} else {
		return goodsCollection.where({
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
const updateUserOrderCount = async function(uid, type, number, type2, shopid) {
	let data = {
		order: {}
	};
	data.order[type] = cmd.inc(+number);
	if (type2) {
		data.order[type2] = cmd.inc(+number * -1);
	}
	console.log(uid, shopid, JSON.stringify(data));
	let res = await userCollection.doc(uid).update(data);
	console.log(res);
	//更新店铺订单数总计
	if (shopid > 0) {
		await updateShopStatistics(shopid, data);
	}
	return res;
}
/**
 * 增加用户积分
 * @param {Int} uid
 * @param {Int} number
 */
const updateUserScore = async function(uid, number) {
	console.log("updateUserScore", uid, number);
	return await userCollection.doc(uid).update({
		score: cmd.inc(number * 1)
	});
}
/**
 * 增加/删除店铺商品数量统计
 * @param {Int} shopid 店铺id
 * @param {String} type 类型,baokuan，miaosha，online，shouqin，yuding
 * @param {Number} number 如果是负数，则减少
 * @param {String} type2 类型转移到下一个类型，与type相反的数值
 */
const shopGoodsInc = async (shopid, type, number, type2) => {
	let data = {
		goods: {}
	};
	data.goods[type] = cmd.inc(+number);
	if (type2) {
		data.goods[type2] = cmd.inc(+number * -1);
	}
	return await updateShopStatistics(shopid, data);
}

/**
 * 更新店铺统计数据
 * @param {Int} shopid
 * @param {Object} data
 */
const updateShopStatistics = async (shopid, data) => {
	let res2 = await shopCollection.where({
		id: +shopid
	}).update(data);
	console.log("updateShopStatistics", res2);
	return res2;
}
/**
 * 生成唯一id
 * @param {Object} key
 * @param {Int} inc 递增数字,默认1
 */
const genIdentityId = async function(key, inc) {
	//生成用户id----开始-----
	inc = inc ? +inc : 1;
	let res = await identityCollection.where({
		"key": key
	}).update({
		value: cmd.inc(inc)
	});
	//立马查询出来，可能值是对的
	let res2 = await identityCollection.where({
		"key": key
	}).field({
		value: 1
	}).limit(1).get();
	return res2.data[0].value;
	//生成用户id----结束-----
}
/**
 * 保存用户余额变动日志
 * @param {Object} data
 */
const addUserBalanceLog = async function(data) {
	//记录余额变动历史user_balance_logs
	return await userBalanceLogCollection.add({
		created: new Date().toISOString(),
		...data
	});
}
/**
 * 根据用户id查询用户信息
 * @param {int} id
 * @param {Object} field 
 */
const getUserInfoById = async function(uid, field) {
	field = field || {
		nickname: 1
	}
	let data = await userCollection.doc(uid).field(field).limit(1).get();
	if (data.data.length > 0) {
		return data.data[0];
	}
	return {};
}
/**
 * 生成序列号，时间+随机8位
 */
const genOrderNo = function() {
	return getDateFormat('yyyyMMddhhmmss') + (Math.random() + "").substr(2, 8);
}

/**
 * 时间格式化,dateFormat('yyyy-MM-dd hh:mm:ss')}
 * @param {Object} fmt
 * @param {Object} time
 */
const getDateFormat = function(fmt, time) {
	let getDate;
	if (time) {
		getDate = new Date(time);
	} else {
		getDate = new Date();
	}
	let o = {
		'M+': getDate.getMonth() + 1,
		'd+': getDate.getDate(),
		'h+': getDate.getHours(),
		'm+': getDate.getMinutes(),
		's+': getDate.getSeconds(),
		'q+': Math.floor((getDate.getMonth() + 3) / 3),
		'S': getDate.getMilliseconds()
	};
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (getDate.getFullYear() + '').substr(4 - RegExp.$1.length))
	}
	for (let k in o) {
		if (new RegExp('(' + k + ')').test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
		}
	}
	return fmt;
}
const dateFormat = function(time, fmt) {
	return getDateFormat(fmt, time);
}
/**
 * 处理送达时间的名称，到底是显示今天还是日期
 * @param {Object} info
 */
const checkDeliveryHour = function(info) {
	if (!info || !info.deliveryHour) {
		return;
	}
	let deliDay = dateFormat(info.deliveryHour.id, 'MM月dd日');
	let today = dateFormat(false, 'MM月dd日');
	if (deliDay == today) {
		info.deliveryHour.name = '今天';
	} else {
		info.deliveryHour.name = deliDay;
	}
}

/**
 * 获取日期字符串，例如：20200521
 */
const getDateString = function() {
	return getDateFormat("yyyyMMdd");
}

const filterFields = (event, strinFields, intFields) => {
	/* let strinFields = ["portrait", "nickname", "birthday"];
	let intFields = ["sex"]; */
	for (let f in event) {
		if (strinFields.indexOf(f) != -1) {
			//可保存的字段
			entity[f] = event[f];
		} else if (intFields.indexOf(f) != -1) {
			entity[f] = parseInt(event[f]);
		}
	}
	return entity;
}
/**
 * 缓存
 * @param {Object} key
 * @param {Object} data
 * @param {Object} expires 有效期，以秒为单位，默认1小时
 */
const cache = async (key, data, expires) => {
	//默认增加前缀
	key = "cache_" + key;
	let time = new Date().getTime();
	//读取
	const result = await cacheCollection.where({
		key: key
	}).field({
		data: 1,
		expires: 1
	}).limit(1).get();
	if (!data) {
		if (result.data.length > 0 && result.data[0].expires > time) {
			return result.data[0].data;
		}
		//没有可用的数据,或者数据过期
		return false;
	}
	//写入
	expires = !expires ? 3600000 + time : expires * 1000 + time;
	if (result.data.length > 0) {
		//修改
		return await cacheCollection.where({
			key: key
		}).update({
			data,
			expires
		});
	}
	//新增
	return await cacheCollection.add({
		key,
		data,
		expires
	});
}

module.exports = {
	updateGoodsMiaoshaStock,
	updateUserOrderCount,
	updateUserScore,
	updateGoodsStock,
	updateShopStatistics,
	shopGoodsInc,
	genIdentityId,
	addUserBalanceLog,
	getUserInfoById,
	genOrderNo,
	getDateFormat,
	getDateString,
	cache,
	checkDeliveryHour
}
