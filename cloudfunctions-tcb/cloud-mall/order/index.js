'use strict';
const db = uniCloud.database();
const cmd = db.command;
const {
	updateGoodsMiaoshaStock,
	updateGoodsStock,
	updateUserOrderCount,
	updateUserScore,
	genIdentityId,
	genOrderNo
} = require('base-common');
const orderCollection = db.collection("cloud_orders");
const cartCollection = db.collection('cloud_carts');
const goodsCollection = db.collection('cloud_goods');
const orderRefundsCollection = db.collection("cloud_order_refunds");
const addressCollection = db.collection('cloud_addresses');
const shopCollection = db.collection('cloud_shops');
/**
 * 用户中心统一插件，位于common目录
 * @url https://ext.dcloud.net.cn/plugin?id=2116
 */
const uniID = require('uni-id');
/**
 * 订单列表
 */
const list = async (data, context) => {
	const {
		page,
		limit,
		uid,
		state
	} = data;
	let conditions = {
		uid: uid,
		isDelete: 0
	};
	if (state > 0) {
		switch (state) {
			case 1:
				let time = new Date().getTime();
				//1待付款
				conditions["state"] = 0;
				conditions["lastPayTime"] = cmd.gt(time);
				break;
			case 2:
				//2已付款，待收货，包含已发货
				conditions["state"] = cmd.in([1, 2]);
				break;
			case 3:
				//3待评价，已收货
				conditions["state"] = 3;
				break;
			case 4:
				//售后
				conditions["state"] = 4;
				break;
			default:
				//conditions["state"] = cmd.gt(-2);
				break;
		}
	}
	data = await orderCollection.where(conditions).field({
		id: 1,
		totalMoney: 1,
		freight: 1,
		totalDiscount: 1,
		state: 1,
		created: 1,
		goods: 1,
		cartCount: 1,
		address: 1,
		cancelStyle: 1,
		remark: 1,
		shopid: 1,
		deliveryHour: 1,
		deliveryType: 1,
		shop: 1,
		yuding: 1,
		"payInfo.time": 1,
		"payInfo.name": 1,
		lastPayTime: 1,
		cancelApply: 1,
		refundApply: 1
	}).skip((page - 1) * limit).limit(limit).orderBy("id", "desc").get();
	data["page"] = page;
	data["limit"] = limit;
	return data;
}
/**
 * 未支付订单或者没有支付尾款的预售订单，才能取消订单，否则走退款流程
 * @param {Object} data
 */
const cancel = async (data) => {
	const {
		uid,
		id,
		style,
	} = data;
	let fields = {
		state: 1,
		totalMoney: 1,
		shopid: 1,
		goods: 1,
		yuding: 1,
		payInfo: 1,
		body: 1,
	};
	let conditions = {
		uid: uid,
		isDelete: 0,
		_id: id,
		state: cmd.in([0, -1])
	};
	let order = await getOrderByConditions(conditions, fields);
	if (!order) {
		data.message = "订单不存在";
		return false;
	}
	if (order.state < 0) {
		data.message = "订单已取消";
		return false;
	} else if (order.state > 0) {
		//@todo 用户已付款，发送通知和取消申请，正常情况不会出现在这里，用户需发起退款申请
		return false;
	}
	//如果未付款，可以直接取消，
	//已付款，或者已付定金，则发起取消请求
	//取消未付款订单
	let result = await orderCollection.doc(order._id).update({
		state: -1,
		cancelStyle: style
	});
	//取消申请
	await pushOrderCancelInfo(order._id, "您的取消申请已提交。");
	for (let ele of order.goods) {
		if (ele.miaosha) {
			let res = await updateGoodsMiaoshaStock(ele, -1);
			console.log("updateGoodsMiaoshaStock", res);
		}
		let resStock = await updateGoodsStock(ele, -1);
		console.log("updateGoodsStock", resStock);
	}
	//更新用户已取消和未支付数量
	let resUser = await updateUserOrderCount(uid, "canceled", 1, "unpaid", order.shopid);
	console.log("resUser", resUser);
	if (order.yuding && order.yuding.payInfo) {
		//是否扣除服务费
		let serviceMoney = 0;
		order.yuding.payInfo.id = order._id;
		if (order.yuding.finalPaymentBeginTime < time && serviceMoney > 0) {
			await pushOrderCancelInfo(order._id, "您的预售订单已取消，已过预售期，扣除" + (serviceMoney * 100) + "%服务费。");
			await addOrderRefund(order.uid, order.yuding.payInfo, order.yuding.payInfo.totalFee * (1 - serviceMoney), "取消" +
				order.body);
		} else {
			await pushOrderCancelInfo(order._id, "您的预售订单拦截成功，正在进行退款审核，请耐心等待。");
			//退款定时器,全额退款
			await addOrderRefund(order.uid, order.yuding.payInfo, order.yuding.payInfo.totalFee, "取消" + order.body);
		}
	} else {
		await pushOrderCancelInfo(order._id, "您的订单已取消。");
	}
	return result;
}
/**
 * 查詢用戶自己的訂單詳細
 * @param {Object} data
 */
const detail = async (data) => {
	const {
		uid,
		id
	} = data;
	let fields = {
		id: 1,
		totalMoney: 1,
		totalDiscount: 1,
		state: 1,
		created: 1,
		remark: 1,
		goods: 1,
		cartCount: 1,
		address: 1,
		lastPayTime: 1,
		cancelStyle: 1,
		shopid: 1,
		shop:1,
		deliveryHour: 1,
		deliveryType: 1,
		modified: 1,
		payInfo: 1,
		yuding: 1
	};
	let conditions = {
		uid: uid,
		isDelete: 0,
		_id: id
	};
	let order = await getOrderByConditions(conditions, fields);
	if (!order) {
		data.message = "订单不存在";
		return false;
	}
	return order;
}

/**
 * 删除订单
 */
const deletes = async (data) => {
	const {
		uid,
		id
	} = data;
	let conditions = {
		uid: uid,
		isDelete: 0,
		_id: id,
	};
	let field = {
		state: 1,
		totalMoney: 1,
		shopid: 1
	};

	let order = await getOrderByConditions(conditions, fields);
	if (!order) {
		data.message = "订单不存在";
		return false;
	}
	//删除订单，软删除
	data = await orderCollection.doc(order._id).update({
		isDelete: 1
	});
	//更新用户已取消和已删除
	let resUser = await updateUserOrderCount(uid, "deleted", 1, "canceled", order.shopid);
	console.log("resUser", resUser);
	return data;
}
/**
 * 确定收货
 */
const makesure = async (data, context) => {
	const {
		uid,
		id
	} = data;
	let conditions = {
		uid: uid,
		isDelete: 0,
		_id: id,
	};
	let field = {
		state: 1,
		totalMoney: 1,
		shopid: 1
	};

	let order = await getOrderByConditions(conditions, fields);
	if (!order) {
		data.message = "订单不存在";
		return false;
	}
	//确定收货,资金解冻
	data = await orderCollection.doc(order._id).update({
		state: 3,
		makesureTime: new Date().toISOString()
	});
	//更新用户已发货和已收货
	let resUser = await updateUserOrderCount(uid, "received", 1, "delivered", order.shopid);
	//增加用户积分
	await updateUserScore(uid, order.totalMoney);
	//@todo 资金解冻,付款给商家，定时器处理，避免重复执行付款
	return data;
}

/**
 * 根据条件查询订单信息
 * @param {Object} conditions
 * @param {Object} fields
 */
const getOrderByConditions = async (conditions, fields) => {
	let data = await orderCollection.where(conditions).limit(1).field(fields).get();
	if (data.data.length == 0) {
		return false;
	}
	return data.data[0];
}


/**
 * 添加取消订单进度
 * @param {Object} id 
 * @param {Object} message
 */
const pushOrderCancelInfo = async function(id, message) {
	return await orderCollection.doc(id).update({
		cancelApply: cmd.push({
			message: message,
			time: new Date().getTime()
		})
	});
}
/**
 * 创建退款
 * @param {Object} payInfo 
 */
const addOrderRefund = async function(uid, payInfo, refundFee, refundDesc) {
	//order_refunds
	return await orderRefundsCollection.add({
		...payInfo,
		uid: uid,
		refundStatus: "refunding",
		refundFee: refundFee,
		refundDesc: refundDesc,
		created: new Date().toISOString()
	});
}
/**
 * 预结算
 */
const settlement = async (event, context) => {
	let beginTime = new Date().getTime();
	//查询购物车选中数据
	let shopid = parseInt(event.id);
	let uid = event.uid;
	let addressid = event.addressid;
	//处理类型，preview，submit
	let type = event.type;
	//忽略库存不足商品
	let lastPayTimeMinute = 5;
	let carts = {
		data: []
	};
	//console.log(event);
	if (event.goods) {
		//店铺id
		if (event.shopid) {
			shopid = +event.shopid;
		}
		//单个商品结算,必须存在商品goods_id，型号sku_id，数量amount,price=0
		carts.data.push({
			_id: "none",
			goods_id: +event.goods.id,
			sku_id: event.goods.sku_id > 0 ? +event.goods.sku_id : 0,
			amount: +event.goods.amount,
			price: 0
		});
	} else if (event.goodslist) {
		//店铺id
		if (event.shopid) {
			shopid = +event.shopid;
		}
		//多条商品提交订单,订单详情-->再次购买
		event.goodslist.map(goods => {
			carts.data.push({
				_id: "none",
				goods_id: +goods.id,
				sku_id: goods.sku_id > 0 ? +goods.sku_id : 0,
				amount: +goods.amount,
				price: parseFloat(goods.price)
			});
		});
	} else {
		//购物车结算
		let condition = {
			shopid: shopid,
			settlement: true,
			uid: uid
		};
		//多个购物车id提交
		if (event.cartids) {
			condition = {
				shopid: shopid,
				_id: cmd.in(event.cartids),
				uid: uid
			}
		}
		carts = await cartCollection.where(condition).field({
			"goods_id": 1,
			"sku_id": 1,
			"price": 1,
			"amount": 1
		}).get();
		console.log("carts",carts);
	}
	if (carts.data.length == 0) {
		event.message = "结算商品不存在";
		return false;
	}
	let data = {
		"shopid": shopid,
		"uid": uid,
		"cartCount": 0, //总件数
		"totalMoney": 0,
		"stockNotEnough": [],
		"totalDiscount": 0,
		"deliveryType": event.deliveryType ? event.deliveryType : "deliveryHome", //1配送，2自提
		"freight": event.freight ? +event.freight : 0, //运费
		"juli": event.juli ? +event.juli : 0, //用户与商家之间的距离，由地图接口计算得来
		"address": {},
		"goods": []
	}
	//查询默认收货地址,结算的时候，前端传addressid
	let addressCondition = {
		uid: uid
	};
	if (addressid) {
		addressCondition["_id"] = addressid;
	}
	let address = await addressCollection.where(addressCondition).orderBy("default", "desc").limit(1).get();
	if (address.data.length > 0) {
		data["address"] = address.data[0];
	} else if (type == "submit" && event.deliveryType == "deliveryHome") {
		//配送订单，收货地址不存在
		event.message = "收货地址不存在";
		return false;
	}
	//查询店铺信息
	let shopData = await shopCollection.where({
		id: shopid
	}).field({
		id: 1,
		name: 1,
		src: 1,
		address: 1,
		uid: 1,
		latitude: 1,
		longitude: 1,
		delivery: 1,
		deliverySupportType: 1,//仅仅兼容之前测试版本，将来去掉
		deliveryTypes:1
	}).limit(1).get();
	if (shopData.data.length == 0) {
		event.message = "店铺不存在";
		return false;
	}
	data["shop"] = shopData.data[0];
	let ids = [];
	let cartMap = {};
	//减少秒杀库存成功
	let decrStockMiaoshaGoodsSuccess = [];
	//减少商品库存
	let decrStockGoodsSuccess = [];
	let cartIds = [];
	//处理商品购物车数据
	carts.data.map(ct => {
		cartMap[ct.goods_id + '_' + ct.sku_id] = {
			cartId: ct._id,
			cartPrice: ct.price,
			amount: ct.amount
		};
		ids.push(ct.goods_id);
		cartIds.push(ct._id);
	});
	//查询实时商品信息
	let goods = await goodsCollection.where({
		shopid: shopid,
		id: cmd.in(ids)
	}).field({
		"id": 1,
		"title": 1,
		"stock": 1,
		"src": 1,
		"price": 1,
		"skus": 1,
		"upc":1,
		"originPrice": 1,
		"miaosha": 1,
		"yuding": 1,
		"manjian": 1,
	}).get();

	if (goods.data.length > 0) {
		let goodsOut = [];
		//处理选中数量
		goods.data.map(ele => {
			if (ele.skus && ele.skus.length > 0) {
				ele.skus.map((sku, index) => {
					let key = ele.id + '_' + sku.id;
					if (cartMap[key] && cartMap[key].amount > 0) {
						//相当于clone对象
						let goo = { ...ele
						};
						//删除多型号
						delete goo.skus;
						if (goo.miaosha && goo.miaosha.sku_id != sku.id) {
							delete goo.miaosha;
						}
						goo["sku_id"] = sku.id;
						delete sku.id;
						Object.assign(goo, cartMap[key], sku, {
							hasSku: true,
							sku_index: index,
							subName: sku.name.replace('&gt;', ' ')
						})
						goodsOut.push(goo);
					}
				});
			} else {
				let key = ele.id + '_0';
				Object.assign(ele, cartMap[key], {
					hasSku: false,
					subName: "",
					sku_index: 0,
					sku_id: 0
				});
				goodsOut.push(ele);
			}
		});
		let time = new Date().getTime();
		for (let ele of goodsOut) {
			//提前预定，有折扣
			if (ele.yuding && ele.yuding.beginTime < time && ele.yuding.endTime > time) {
				//@todo 在预订时间内，仅支付定金,如果已经过了预定期，则不生效
				let yuding = { ...ele.yuding
				};
				//更改商品原价=原价-抵扣价,最大抵扣完，不会出现负数
				let price = ele.price - (yuding.deduction - yuding.price);
				//预售价
				ele.price = price > 0 ? price : yuding.price;
				//尾款=尾款单价*数量，只支持单个商品预定，所以不存在尾款累加

				//总定金
				yuding.price = yuding.price * ele.amount;
				//总尾款=预订价-定金
				yuding.finishPaymentPrice = Number((ele.price * ele.amount - yuding.price).toFixed(2));

				data.yuding = yuding;
				//购物车总金额=总定金+总尾款
				data.totalMoney += Number(data.yuding.price) + Number(data.yuding.finishPaymentPrice);
				data.goods.push(ele);
				data.cartCount += ele.amount;
				lastPayTimeMinute = 30;
			} else {
				//普通购买
				if (ele.miaosha) {
					//秒杀库存一定大于购买数量,如果秒杀限量，购买数量不能大于限量
					if (time < ele.miaosha.endTime && time > ele.miaosha.beginTime && ele.miaosha.stock >= ele.amount && (ele.miaosha
							.limit == 0 || ele.miaosha.limit >= ele.amount)) {
						//同步更新秒杀库存，相当于拿钥匙
						let isMiaoshaError = false;
						if (type == "submit") {
							let res = await updateGoodsMiaoshaStock(ele, 1);
							console.log("updateGoodsMiaoshaStock", res);
							if (res.updated < 1) {
								isMiaoshaError = true;
							} else {
								decrStockMiaoshaGoodsSuccess.push({
									_id: ele._id,
									amount: ele.amount
								});
							}
						}
						if (!isMiaoshaError) {
							ele.originPrice = ele.price;
							ele.price = ele.miaosha.price;
							ele.stock = ele.miaosha.stock;
						}
						//开始结束时间用时间戳  new Date().getTime()
						//测试代码===>key $date must not start with '$'
						/* delete ele.miaosha.beginTime;
						delete ele.miaosha.endTime; */
						//秒杀与满减不同享
						delete ele.manjian;
					}
				}
				//检查库存是否不足
				if (ele.amount > ele.stock) {
					data.stockNotEnough.push(ele);
				} else {
					//加入购物车时的差价
					ele.cutPrice = 0;
					if (ele.cartPrice > ele.price) {
						ele.cutPrice = ele.cartPrice - ele.price;
					}
					//购物车总价格
					data.totalMoney += ele.price * ele.amount;
					if (ele.originPrice > 0) {
						//购物车总折扣
						data.totalDiscount += (ele.originPrice - ele.price) * ele.amount;
					}
					data.goods.push(ele);
					data.cartCount += ele.amount;
				}
			}
		}
	} else {
		//结算商品不存在
		event.message = "商品不存在";
		return false;
	}
	//格式化数字
	data.totalDiscount = Number(data.totalDiscount.toFixed(2));
	//增加运费
	data.totalMoney = Number(data.totalMoney.toFixed(2));
	//提交订单
	if (type && type == "submit") {
		//检查是否存在库存不足的商品
		if (data.stockNotEnough.lengt > 0) {
			//归还秒杀库存1
			for (let ele of decrStockMiaoshaGoodsSuccess) {
				await updateGoodsMiaoshaStock(ele, -1);
			}
			event.message = "商品库存不足";
			event.data = data;
			return false;
		}
		let body = [];
		let isGoodsError = false;
		for (let ele of data.goods) {
			//减少库存,默认下单减库存，inc,这里不像redis能返回更新后的结果，所以还是可能会出现超卖的情况
			let res = await updateGoodsStock(ele, 1);
			console.log("updateGoodsStock", res);
			if (res.updated < 1) {
				isGoodsError = true;
				break;
			} else {
				decrStockGoodsSuccess.push({
					_id: ele._id,
					amount: ele.amount,
					hasSku: ele.hasSku,
					sku_index: ele.sku_index,
					sku_id: ele.sku_id
				});
			}
			body.push(ele.title + ele.subName);
		}
		if (isGoodsError) {
			//归还秒杀库存2
			for (let ele of decrStockMiaoshaGoodsSuccess) {
				await updateGoodsMiaoshaStock(ele, -1);
			}
			//归还商品库存
			for (let ele of decrStockGoodsSuccess) {
				await updateGoodsStock(ele, -1);
			}
			event.message = "提交订单失败!\n商品库存不足";
			return false;
		}
		//console.log(data.goods)
		//@todo decrStockGoodsSuccess 保存商品每日销量,最好是redis
		//备注
		data["remark"] = event.remark;
		const day = new Date().toISOString();
		data["created"] = day;
		data["modified"] = day;
		//如果是自提，需要生成提货码
		if (data.deliveryType == "selfRaising") {
			//顺序编号
			event.deliveryHour.number = await genIdentityId("order_ziti");
			//随机8位密码
			event.deliveryHour.password = (Math.random() + "").substr(2, 8);
		}
		//预计送达时间
		data["deliveryHour"] = event.deliveryHour;
		//最后支付时间，否则自动取消订单,5分钟支付时间,预定订单30分钟
		data["lastPayTime"] = (new Date()).getTime() + lastPayTimeMinute * 60 * 1000;
		//用户设备信息
		data["platform"] = [
			context.OS,
			context.PLATFORM
		].join(",");
		data["requestId"] = context.requestId;
		//用户真实ip
		//data["ip"] = context.headers["x-forwarded-for"];
		//状态：0未付款，1已付款，2已发货，3已收货
		data["state"] = 0;
		//是否删除，默认0,删除不改变原有状态
		data["isDelete"] = 0;
		//字典表递增获得位id,不靠谱
		//data["id"] = await genIdentityId("orders");
		//随机方法
		data["id"] = genOrderNo();
		if (data.yuding) {
			//获得预定支付订单id
			data.yuding.id = "YD_" + genOrderNo();
			//未支付
			data.yuding.state = 0;
		}
		data["body"] = body.join(",");
		//邀请信息,只允许2级关系
		let uinfo = context.userInfo;
		//用户邀请列表
		data["inviters"] = [];
		if (uinfo && uinfo.inviters) {
			data["inviters"] = uinfo.inviters.slice(0, 2)
		} else if (uid != data.shop.uid) {
			//默认为店主,logo为店铺,店主不能加自己为上级
			data["inviters"].push({
				id: data.shop.uid,
				shopid: data.shop.id,
				nickname: data.shop.name,
				portrait: data.shop.src
			});
			//设置到用户信息
			//let res = await uniID.setInviteCode(uid,data.shop.uid);
			const res = await uniID.updateUser({
				uid: uid,
				invite_code: data.shop.uid,
				inviters: data["inviters"]
			})
			console.log("默认加入店铺团队", data["inviters"], res);
		}
		let endTime = new Date().getTime();
		//结算商品消耗时间
		data["timeConsumingInfo"] = {
			beginTime: beginTime,
			endTime: endTime,
			consuming: endTime - beginTime
		};
		//保存订单
		let res = await orderCollection.add(data);
		if (!res.id) {
			event.message = "提交订单失败";
			return false;
		}

		//删除购物车cartId-------------我怀疑不支持异步操作--------单个商品结算+多商品结算
		if (cartIds.indexOf("none") == -1) {
			let delCart = await cartCollection.where({
				_id: cmd.in(cartIds)
			}).remove();
			console.log(delCart);
		}
		//更新用户待付款订单数
		await updateUserOrderCount(uid, "unpaid", 1, false, data.shopid);
		return res.id;
	}
	return data;
}


module.exports = {
	list,
	cancel,
	detail,
	delete: deletes,
	makesure,
	settlement
}
