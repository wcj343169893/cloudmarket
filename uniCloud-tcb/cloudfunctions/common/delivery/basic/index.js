'use strict';
const crypto = require('crypto');
const createConfig = require('uni-config-center');
const wxAuth = require('wx-auth');
const {
	getDateFormat
} = require("base-common");
const {
	getDeliveryConfig
} = require("configs");
const models = {
	//https://api.weixin.qq.com/cgi-bin/express/local/business/order/pre_add?access_token=ACCESS_TOKEN
	//https://api.weixin.qq.com/cgi-bin/express/local/business/delivery/getall?access_token=ACCESS_TOKEN
	testUrl: "https://api.weixin.qq.com/cgi-bin/express/local/business/",
	productUrl: "https://api.weixin.qq.com/cgi-bin/express/local/business/",
	config: {
		key: "",
		secret: "",
		shop: "",
		product: false //是否正式环境
	},
	name: "shunfeng",
	delivery_id: "SFTC",
	async preAdd(order, context) {
		this.context = context;
		this.config = getDeliveryConfig(this.name);
		let base = this.getOrderBaseInfo(order);
		let res = await this.send(base, "order/pre_add");
		if (res) {
			//这里只返回配送订单号，方便查询
			return res.delivery_token;
		}
		//返回delivery_token，有些不返回，建议放弃此字段
		return false;
	},
	/**
	 * 增加新订单
	 * @param {Object} order
	 */
	async add(order, context) {
		this.context = context;


		let deduction = order.deduction ? order.deduction : "0.00";
		let base = this.getOrderBaseInfo(order);
		let data = {
			ShopId: order.shopid,
			ShopName: order.shop.name,
			PayType: 1, //支付方式（0为货到付款，1为预付款）
			BoxFee: order.boxFee ? order.boxFee : 0,
			Freight: order.freight,
			ActivityMoney: order.totalDiscount,
			ShopActivityMoney: 0,
			DepositMoney: 0,
			FoodList: [],
			Flag: "小程序", //订单标记，如：美团、饿了么、饿了么星选等，也可以是商家自定义标记
			//UserBaiduCoordinate
			//UserGPSCoordinate
			UserGaodeCoordinate: `${order.address.longitude}|${order.address.latitude}`,
			DayIndex: order.dayIndex, //订单所在门店的当日流水号，请尽量填写便于骑手快速取餐
			PickType: 0,
			Weight: order.weight ? order.weight : 1
		};

		//预约时间ReachTime，预约时间，如果是立即配送请填空字符串或者不填（格式：yyyy-MM-dd HH:mm:ss）
		//商品列表FoodList，存放APIFoodItem对象
		for (let goods of order.goods) {
			data.FoodList.push({
				FoodName: goods.title,
				FoodPrice: goods.price,
				FoodCount: goods.amount
			});
		}
		let res = await this.send({
			...base,
			...data
		}, "ClientOrder.ashx", "SendOrderData");
		if (res) {
			//这里只返回配送订单号，方便查询
			return res.OrderId;
		}
		return false;
	},
	/**
	 * 修改订单
	 * 订单编号（OrderId）为必填
	 * 字符串类型参数：空字符串为忽略不修改
	 * 整型参数：-1为忽略不修改
	 * 当订单状态为“已取餐”，以及以后的状态时，禁止修改订单
	 * @param {Object} order
	 */
	async update(order) {
		return await this.send(this.getOrderBaseInfo(order), "ClientOrder.ashx", "CloseOrder");
	},
	getOrderBaseInfo(order) {
		const {
			shop,
			address,
			userInfo
		} = order
		let data = {
			"cargo": {
				"cargo_first_class": "美食夜宵",
				"cargo_second_class": "零食小吃",
				"goods_detail": {
					"goods": [{
							"good_count": 1,
							"good_name": "水果",
							"good_price": 10,
							"good_unit": "元"
						},
						{
							"good_count": 2,
							"good_name": "蔬菜",
							"good_price": 20,
							"good_unit": "元"
						}
					]
				},
				"goods_value": order.totalMoney,
				"goods_weight": 1,
			},
			"delivery_id": this.delivery_id,
			"openid": userInfo.wx_openid ? userInfo.wx_openid["mp-weixin"] : "", //用户openid
			"order_info": {
				"delivery_service_code": "", //配送服务代码 不同配送公司自定义, 顺丰和达达不填
				"expected_delivery_time": parseInt(Date.now() / 1000) +
					300, //期望派单时间(达达支持，表示达达系统调度时间, 到那个时间才会有状态更新的回调通知)，unix-timestamp, 比如1586342180
				"is_direct_delivery": 0,
				"is_finish_code_needed": 1,
				"is_insured": 0,
				"is_pickup_code_needed": 1,
				"note": order.remark,
				"order_time": parseInt(Date.now() / 1000),
				"order_type": 0,
				"poi_seq": order.id, //门店订单流水号，建议提供，方便骑手门店取货，最长不超过32个字符
				"tips": 0
			},
			"receiver": {
				"address": address.address,
				"address_detail": address.addressName,
				"city": address.city,
				"coordinate_type": 0,
				"lat": address.latitude,
				"lng": address.longitude,
				"name": address.name,
				"phone": address.mobile
			},
			"sender": {
				"address": shop.address,
				"address_detail": shop.addressName,
				"city": shop.addressObject.city,
				"coordinate_type": 0,
				"lat": shop.latitude,
				"lng": shop.longitude,
				"name": shop.name,
				"phone": shop.phone
			},
			"shop": {
				"goods_count": order.goods.length,
				"goods_name": order.body,
				"img_url": shop.src,
				"wxa_path": "/page/index/fruit" //首页地址
			},
			"shop_no": shop.delivery && shop.delivery.shop ? shop.delivery.shop : this
				.shop, //，如果店铺没有独立设置，则默认configs中的配送店铺id"3243279847393"
			"sub_biz_id": `${order.shopid}`,
			"shop_order_id": order._id,
		};
		//预计送达时间
		if (order.deliveryHour) {
			data.order_info.expected_delivery_time = order.deliveryHour.endTime;
		}
		return data;
	},
	/**
	 * 取消订单，注意：骑手取餐后禁止关闭
	 * @param {Object} order
	 * @param {Object} order.id 商家订单号
	 * @param {Object} order.cancelReason 取消原因
	 */
	async cancel(order) {
		let data = {
			OrderId: order.id,
			Reason: order.cancelReason ? order.cancelReason : "无"
		};
		return await this.send(data, "ClientOrder.ashx", "CloseOrder");
	},
	/**
	 * 订单退款
	 * 此接口主要用于商家自有预付费支付系统，在退款时和本系统的交互
	 * 如果商家觉得无需交互，可以在自己系统退款后，发送取消订单请求
	 * @param {Object} order
	 */
	async refund(order) {
		let data = {
			OrderId: order.id,
			ApplyType: 0, //申请类型：0为发起退款1为确认退款2为驳回退款3为用户取消退款4为用户取消退款申述
			IsRefuse: 0, //是否可以拒绝：0为不可以1为可以
			Reason: order.refundReason ? order.refundReason : "无"
		};
		return await this.send(data, "ClientOrder.ashx", "OrderRefund");
	},
	/**
	 * 4、锁定和解锁订单
	 * 修改商家是否出餐,会收到一个出餐通知
	 * @param {Object} order
	 */
	async updateShopFlag(order) {
		//是否出餐：,0为未出餐,1为已出餐
		let data = {
			OrderId: order.id,
			ShopFlag: order.state >= 2 ? 1 : 0,
		};
		return await this.send(data, "ClientOrder.ashx", "UpdateShopFlag");
	},
	/**
	 * 锁定和解锁订单
	 * @param {Object} order
	 */
	async lock(order) {
		let data = {
			OrderId: order.id,
			IsLock: order.delivery.lock ? 1 : 0, //是否锁定：1为锁定0为解锁
			Reason: order.lockReason ? order.lockReason : "无"
		};
		return await this.send(data, "ClientOrder.ashx", "OrderLock");
	},
	/**
	 * 统一发送接口
	 * @param {Object} data
	 * @param {Object} url
	 */
	async send(data, url, isTry) {
		this.config = getDeliveryConfig(this.name);
		//获取access_token
		const accessToken = await wxAuth.getAccessToken({}, this.context)
		console.log(JSON.stringify(data));
		let requestData = {
			...data,
			shopid: this.config.key,
			openid: this.openid
		};
		requestData.delivery_sign = this.sign(requestData);
		console.log(JSON.stringify(requestData));
		let baseUrl = this.config.product ? this.productUrl : this.testUrl;
		const res = await uniCloud.httpclient.request(baseUrl + url + "?access_token=" + accessToken, {
			method: 'POST',
			contentType: "application/json",
			data: requestData,
			dataType: "json"
		});
		console.log(JSON.stringify(res.data));
		if (res.data.resultcode == 0) {
			return res.data;
		}
		console.log(res.data.resultmsg);
		return false;
	},
	/**
	 * 验证签名
	 * @param {Object} data
	 */
	async validateSign(data) {
		this.config = getDeliveryConfig(this.name);
		if (data.key != this.config.key) {
			console.log("key 不一致")
			data.message = "key 不一致";
			return false;
		}
		let sign = this.sign(data);
		if (data.sign != sign) {
			console.log("签名错误")
			data.message = "签名错误";
			return false;
		}
		let content = JSON.parse(new Buffer(data.content, 'base64').toString());
		let subscribe = require("./subscribe");
		if (!subscribe) {
			//没找到通知模块
			return false;
		}
		console.log(content);
		console.log("开始执行订阅方法", data.action);
		return subscribe[data.action](content);
	},
	/*
	 *  签名算法：
	 * delivery_sign=SHA1(shopid + shop_order_id + AppSecret)
	 * delivery_sign=SHA1(shopid + AppSecret)
	 * @link https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/industry/immediate-delivery/read_first.html
	 */
	sign(data) {
		return crypto.createHash('sha1').update([this.config.key, data.shop_order_id, this.config.secret].filter(
			e => !!e).join(
			"")).digest(
			'hex').toLowerCase();
	}
}
module.exports = models;
