const db = uniCloud.database();
const cmd = db.command;
const userCollection = db.collection("uni-id-users");
const shopCollection = db.collection("cloud_shops");
const goodsCollection = db.collection('cloud_goods');
const userBalanceLogCollection = db.collection("cloud_user_balance_logs");
const identityCollection = db.collection("cloud_identity");
const cacheCollection = db.collection("cloud_identity");
const shopStatisticsCollection = db.collection("cloud_shop_statistics");

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
const updateUserOrderCount = async function(uid, type, number, type2, shopid, totalMoney) {
	//用户订单统计，商家订单统计采用实时查询
	let data = {
		order: {
			total: cmd.inc(+number)
		}
	};
	if (type == "unpaid") {
		//订单总计
		data.order["total"] = cmd.inc(+number);
	}
	data.order[type] = cmd.inc(+number);
	if (type2) {
		data.order[type2] = cmd.inc(+number * -1);
	}
	console.log(uid, shopid, JSON.stringify(data));
	let res = await userCollection.doc(uid).update(data);
	console.log(res);
	//更新店铺订单数总计
	if (shopid > 0) {
		res = await updateShopStatistics(shopid, data);
		console.log(res);
		//更新营业额，下单用户，已支付数量
		if (type == "payup") {
			res = await updateShopDayStatistics(shopid, {
				turnover: cmd.inc(totalMoney),
				"order.paid": cmd.inc(1),
				"order.users": cmd.addToSet(uid)
			});
			console.log(res);
		}
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
 * 增加用户收入
 * @param {Object} uid
 * @param {Object} number
 */
const updateUserIncome = async function(uid, number, description) {
	console.log("updateUserIncome", uid, number);
	let res = await userCollection.doc(uid).update({
		balance: cmd.inc(number * 1)
	});
	console.log(res);
	//查询余额
	res = await userCollection.doc(uid).field({
		balance: 1
	}).get();
	console.log(res);
	//充值记录
	let log = await addUserBalanceLog({
		uid: uid,
		type: 1, //0支出，1收入
		balance: res.data[0].balance,
		money: number * 1,
		description: description,
	});
	console.log(description, log);
	return res.data[0].balance;
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
 * 更新店铺每日统计，包含营业额，有效订单，下单用户等
 * @param {Number} shopid 店铺id 
 * @param {Object} data 需要更新的内容
 * @param {Boolean} isGetData 是否返回数据 
 */
const updateShopDayStatistics = async (shopid, data, isGetData, uid) => {
	let dayTime = getDateString();
	data.updated = new Date().toISOString();
	let res = await shopStatisticsCollection.where({
		shopid,
		day: dayTime
	}).update(data);
	console.log("updateShopDayStatistics", res);
	if (res.updated == 0) {
		//没有数据，需要初始化
		res = await shopStatisticsCollection.add({
			shopid,
			day: dayTime,
			dayIndex: 0,
			order: {
				paid: 0,
				users: []
			},
			turnover: 0,
			visitor: [uid]
		});
		await shopCollection.where({
			id: shopid
		}).update({
			dayStatisticsLog: dayTime
		})
	}
	//返回统计数据
	if (isGetData) {
		res = await shopStatisticsCollection.where({
			shopid,
			day: dayTime
		}).limit(1).get();
		return res.data[0];
	}
	return res;
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
		key
	}).update({
		value: cmd.inc(inc)
	});
	if (res.updated == 0) {
		let value = 10000;
		await identityCollection.add({
			key,
			value
		});
		return value;
	}
	//立马查询出来，可能值是对的
	let res2 = await identityCollection.where({
		key
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
 * 默认时差,东八区
 */
const utc = 8;
/**
 * 获取时间戳，这个不存在时间差问题
 */
const getTime = (time) => {
	return Date.now();
}
/**
 * 当前时间
 */
const getDate = (time) => {
	let dt;
	if (time) {
		dt = new Date(time);
	} else {
		dt = new Date();
	}
	/**
	 *The getTimezoneOffset() method returns the time zone difference, in minutes, from current locale (host system settings) to UTC.
	 *@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset
	 */
	let offset = dt.getTimezoneOffset();
	if (Math.abs(offset / 60) != utc) {
		//兼容时区问题，增加8小时
		dt.setHours(dt.getHours() + utc);
	}
	return dt;
}
/**
 * 生成今日和昨日的时间戳，目前有8小时时差
 */
const getDayTime = () => {
	let date = getDate();
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);
	let todayTime = date.getTime();
	date.setDate(date.getDate() - 1);
	let yestertodayTime = date.getTime();
	return {
		todayTime,
		yestertodayTime
	};
}
/**
 * 时间格式化,dateFormat('yyyy-MM-dd hh:mm:ss')}
 * @param {Object} fmt
 * @param {Object} time
 */
const getDateFormat = function(fmt, time) {
	let dt = getDate(time);
	let o = {
		'M+': dt.getMonth() + 1,
		'd+': dt.getDate(),
		'h+': dt.getHours(),
		'm+': dt.getMinutes(),
		's+': dt.getSeconds(),
		'q+': Math.floor((dt.getMonth() + 3) / 3),
		'S': dt.getMilliseconds()
	};
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (dt.getFullYear() + '').substr(4 - RegExp.$1.length))
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
 * @param {String} key
 * @param {Object} data
 * @param {int} expires 有效期，以秒为单位，默认1小时
 */
const dbcache = async function(key, data, expires) {
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
	updateShopDayStatistics,
	shopGoodsInc,
	genIdentityId,
	updateUserIncome,
	addUserBalanceLog,
	getUserInfoById,
	genOrderNo,
	getDateFormat,
	getDateString,
	getDate,
	dbcache,
	checkDeliveryHour,
	getTime,
	getDayTime
}
