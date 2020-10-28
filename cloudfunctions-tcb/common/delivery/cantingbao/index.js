'use strict';
const crypto = require('crypto');
const {
	getDateFormat,
	getTime
} = require("base-common");
const models = {
	baseUrl: "http://sdk.test.canqu.com.cn/Shop/V1/",
	//baseUrl: "http://sdk.canqu.com.cn/Shop/V1/",
	config: {
		key: "84Qrm9NwSCTVanyldcak9LJpX",
		secret: "XYEUJBWYBEBSVGV81832"
	},
	name: "cantingbao",
	/**
	 * 增加新订单
	 * @param {Object} order
	 */
	async addOrder(order) {
		let deduction = order.deduction ? order.deduction : "0.00";
		let data = {
			OrderId: order.id,
			ShopId: order.shopid,
			ShopName: order.shop.name,
			OrderUserName: order.address.name ? order.address.name : "",
			OrderUserPhone: order.address.mobile,
			OrderUserAddress: order.address.address + " " + order.address.addressName,
			OrderRemark: order.remark,
			PayType: 1, //支付方式（0为货到付款，1为预付款）
			BoxFee: order.boxFee ? order.boxFee : 0,
			Freight: order.freight,
			ActivityMoney: order.totalDiscount,
			ShopActivityMoney: 0,
			DepositMoney: 0,
			Invoice: 0,
			InvoiceTitle: "",
			TaxpayerId: "",
			FoodList: [],
			Flag: "小程序", //订单标记，如：美团、饿了么、饿了么星选等，也可以是商家自定义标记
			//UserBaiduCoordinate
			//UserGPSCoordinate
			UserGaodeCoordinate: `${order.address.longitude}|${order.address.latitude}`,
			DayIndex: order.dayIndex, //订单所在门店的当日流水号，请尽量填写便于骑手快速取餐
			PickType: 0,
			Weight: order.weight ? order.weight : 1
		};
		//预计送达时间
		if (order.deliveryHour) {
			data.ReachTime = getDateFormat("yyyy-MM-dd hh:mm:ss", order.deliveryHour.endTime);
		}

		//预约时间ReachTime，预约时间，如果是立即配送请填空字符串或者不填（格式：yyyy-MM-dd HH:mm:ss）
		//商品列表FoodList，存放APIFoodItem对象
		for (let goods of order.goods) {
			data.FoodList.push({
				FoodName: goods.title,
				FoodPrice: goods.price,
				FoodCount: goods.amount
			});
		}
		let res = await this.send(data, "ClientOrder.ashx", "SendOrderData");
		if (res) {
			//这里只返回配送订单号，方便查询
			return res.OrderId;
		}
		return false;
	},
	/**
	 * 取消订单，注意：骑手取餐后禁止关闭
	 * @param {Object} order
	 * @param {Object} order.id 商家订单号
	 * @param {Object} order.cancelReason 取消原因
	 */
	async cancelOrder(order) {
		let data = {
			OrderId: order.id,
			Reason: order.cancelReason ? order.cancelReason : "商家关闭"
		};
		return await this.send(data, "ClientOrder.ashx", "CloseOrder");
	},
	/**
	 * 修改商家是否出餐,会收到一个出餐通知
	 * @param {Object} order
	 */
	async updateShopFlag(order) {
		//是否出餐：,0为未出餐,1为已出餐
		let data = {
			OrderId: order.id,
			ShopFlag: order.state >= 2 ? 1 : 0
		};
		return await this.send(data, "ClientOrder.ashx", "UpdateShopFlag");
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
		let ts = parseInt(getTime() / 1000);
		let requestData = {
			action,
			ts,
			key: this.config.key,
			content
		};
		requestData.sign = this.sign(requestData);
		console.log(JSON.stringify(requestData));
		const res = await uniCloud.httpclient.request(this.baseUrl + url, {
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
		return crypto.createHash('sha1').update([this.config.key, data.content, this.config.secret, data.ts].join("")).digest(
			'hex').toLowerCase();
	}
}
module.exports = models;
