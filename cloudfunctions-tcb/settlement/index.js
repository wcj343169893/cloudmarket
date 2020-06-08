'use strict';
const db = uniCloud.database();
const cmd = db.command;
const {
	updateGoodsMiaoshaStock,
	updateGoodsStock,
	updateUserOrderCount,
	genIdentityId,
	getUserInfoById,
	genOrderNo
} = require('base-common');
const auth = uniCloud.auth();
exports.main = async (event, context) => {
	let {
		customUserId
	} = await auth.getUserInfo();
	if (customUserId < 1) {
		return {
			"code": 401,
			"message": "用户信息不存在",
		};
	}
	//查询购物车选中数据
	let shopid = parseInt(event.id);
	let uid = +customUserId;
	let addressid = event.addressid;
	//处理类型，preview，submit
	let type = event.type;
	//console.log(event)
	//忽略库存不足商品
	const cartCollection = db.collection('carts');
	let lastPayTimeMinute = 5;
	let carts = {
		data: []
	};
	if (event.goods) {
		//单个商品结算,必须存在商品goods_id，型号sku_id，数量amount,price=0
		carts.data.push({
			_id: "none",
			goods_id: +event.goods.id,
			sku_id: event.goods.sku_id > 0 ? +event.goods.sku_id : 0,
			amount: +event.goods.amount,
			price: 0
		});
	} else if (event.goodslist) {
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

	}
	if (carts.data.length == 0) {
		return {
			"code": 404,
			"message": "结算商品不存在"
		};
	}
	let data = {
		"shopid": shopid,
		"uid": uid,
		"cartCount": 0, //总件数
		"totalMoney": 0,
		"stockNotEnough": [],
		"totalDiscount": 0,
		"freight": 0, //运费
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
	let address = await db.collection('addresses').where(addressCondition).orderBy("default", "desc").limit(1).get();
	if (address.data.length > 0) {
		data["address"] = address.data[0];
	} else if (type == "submit") {
		//收货地址不存在
		return {
			"code": 404,
			"message": "收货地址不存在"
		};
	}
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
	const goodsCollection = db.collection('goods');
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
				yuding.finishPaymentPrice = ele.price * ele.amount - yuding.price;

				data.yuding = yuding;
				//购物车总金额=总定金+总尾款
				data.totalMoney += data.yuding.price + data.yuding.finishPaymentPrice;
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
		return {
			"code": 404,
			"message": "商品不存在"
		};
	}
	//格式化数字
	data.totalDiscount = Number(data.totalDiscount.toFixed(2));
	data.totalMoney = Number(data.totalMoney.toFixed(2));
	//提交订单
	if (type && type == "submit") {
		//检查是否存在库存不足的商品
		if (data.stockNotEnough.lengt > 0) {
			//归还秒杀库存1
			decrStockMiaoshaGoodsSuccess.map(async (ele) => {
				return await updateGoodsMiaoshaStock(ele, -1);
			});
			return {
				"code": 404,
				"message": "商品库存不足",
				"data": data
			};
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
			decrStockMiaoshaGoodsSuccess.map(async (ele) => {
				return await updateGoodsMiaoshaStock(ele, -1);
			});
			//归还商品库存
			decrStockGoodsSuccess.map(async (ele) => {
				return await updateGoodsStock(ele, -1);
			});
			return {
				"code": 404,
				"message": "提交订单失败!\n商品库存不足",
			};
		}
		//console.log(data.goods)
		//@todo decrStockGoodsSuccess 保存商品每日销量,最好是redis
		//备注
		data["remark"] = event.remark;
		const day = new Date().toISOString();
		data["created"] = day;
		data["modified"] = day;
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
		let uinfo = await getUserInfoById(uid, {
			inviters: 1
		});
		//用户邀请列表
		data["inviters"] = [];
		if (uinfo && uinfo.inviters) {
			data["inviters"] = uinfo.inviters.slice(0, 2)
		}
		//保存订单
		let res = await db.collection("orders").add(data);
		if (!res.id) {
			return {
				"code": 404,
				"message": "提交订单失败",
			};
		}

		//删除购物车cartId-------------我怀疑不支持异步操作--------单个商品结算+多商品结算
		if (cartIds.indexOf("none") == -1) {
			let delCart = await db.collection('carts').where({
				_id: cmd.in(cartIds)
			}).remove();
			console.log(delCart);
		}
		//更新用户待付款订单数
		await updateUserOrderCount(uid, "unpaid", 1, false, data.shopid);
		return {
			"code": 200,
			"message": "操作成功",
			"data": res.id
		};
	}
	return {
		"code": 200,
		"message": "操作成功",
		"data": data
	};
};
