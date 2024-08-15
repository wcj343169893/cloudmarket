'use strict';
const crypto = require('crypto');
const {
	getDateFormat
} = require("base-common");
const {
	getDeliveryConfig
} = require("configs");
const basic = require("../basic/index.js")
//回调地址/http/cloud/mall/order/dealstate/cantingbao
const models = {
	...basic,
	testUrl: "http://sdk.test.canqu.com.cn/Shop/V1/",
	productUrl: "http://sdk.canqu.com.cn/Shop/V1/",
	config: {
		key: "",
		secret: "",
		product: false //是否正式环境
	},
	name: "cantingbao",
	async preAdd() {
		return false;
	},
	async addShop(shop) {
		return false;
	},
	async getShop(shop) {
		return false;
	},
	/**
	 * 增加新订单
	 * @param {Object} order
	 */
	async add(order) {
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
			return {
				id: res.OrderId,
				fee: 0,
				distance: 0,
				pickupCode: "",
				finishCode: "",
				duration: 300
			};
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
		let data = {
			OrderId: order.id,
			OrderUserName: order.address.name ? order.address.name : "",
			OrderUserPhone: order.address.mobile,
			OrderUserAddress: order.address.address + " " + order.address.addressName,
			OrderRemark: order.remark,
			Invoice: 0,
			InvoiceTitle: "",
			TaxpayerId: "",
		};
		//预计送达时间
		if (order.deliveryHour) {
			//data.ReachTime = getDateFormat("yyyy-MM-dd hh:mm:ss", order.deliveryHour.endTime);
			data.StartReachTime = getDateFormat("yyyy-MM-dd hh:mm:ss", order.deliveryHour.id);
			data.EndReachTime = getDateFormat("yyyy-MM-dd hh:mm:ss", order.deliveryHour.endTime);
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
	async send(data, url, action, isTry) {
		console.log(JSON.stringify(data));
		let content = "";
		if (data) {
			content = new Buffer(JSON.stringify(data)).toString('base64');
		}
		//时间戳,服务器有8小时时差
		let ts = parseInt(Date.now() / 1000);
		let requestData = {
			action,
			ts,
			key: this.config.key,
			content
		};
		requestData.sign = this.sign(requestData);
		console.log(JSON.stringify(requestData));
		let baseUrl = this.config.product ? this.productUrl : this.testUrl;
		const res = await uniCloud.httpclient.request(baseUrl + url, {
			method: 'POST',
			contentType: "application/x-www-form-urlencoded",
			data: requestData,
			dataType: "json"
		});
		console.log(JSON.stringify(res.data));
		if (res.data.StateCode == "0") {
			if (res.data.ExtObj) {
				return res.data.ExtObj;
			}
			//没有body返回值，默认true，表示请求成功
			return true;
		}
		console.log(res.data.StateMsg);
		return false;
	},
	/**
	 * 验证签名
	 * 回调地址：https://fc-mp-42xxxxx98df5245.next.bspapp.com/http/cloud/mall/__UNI__7A5FE35/mp-weixin/order/dealstate/cantingbao
	 * @param {Object} data
	 */
	async validateSign(data) {
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
	   签名算法：
	    1、将PartnerKey、Content、Secret、Timesta的字符串顺序链接；
	    2、对该字符串进行SHA-1计算，并转换成16进制编码；
	    3、转换为全小写形式后即获得签名串
	 */
	sign(data) {
		return crypto.createHash('sha1').update([this.config.key, data.content, this.config.secret, data.ts].join(
			"")).digest(
			'hex').toLowerCase();
	}
}
module.exports = models;