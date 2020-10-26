'use strict';
const db = uniCloud.database();
const cmd = db.command;
const crypto = require('crypto');
const {
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
			PickType: 0
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
		return await this.send(data, "ClientOrder.ashx", "SendOrderData")
	},
	/**
	 * 统一发送接口
	 * @param {Object} data
	 * @param {Object} url
	 */
	async send(data, url, action, isTry) {
		let requestString = this.createRequestString(data, action);
		console.log(requestString)
		const res = await uniCloud.httpclient.request(this.baseUrl + url, {
			method: 'POST',
			contentType:"application/x-www-form-urlencoded",
			content: requestString,
			dataType: "json"
		});
		console.log(res.data);
		if (res.data.StateCode == "0") {
			if (res.data.body) {
				return res.data.body;
			}
			//没有body返回值，默认true，表示请求成功
			return true;
		}
		console.log(res.data.StateMsg);
		return false;
	},
	/**
	 * 签名+请求字符
	 * @param {Object} data
	 * @link 验证签名 http://shopapi.sdk.test.canqu.com.cn/GetSign.aspx
	 */
	createRequestString(data, action) {
		//传值内容
		let content = "";
		if (data) {
			content = new Buffer(JSON.stringify(data)).toString('base64');
		}
		//时间戳,服务器有8小时时差
		let timestamp = parseInt(getTime()/1000);
		/*
		     签名算法：
		     1、将PartnerKey、Content、Secret、Timesta的字符串顺序链接；
		     2、对该字符串进行SHA-1计算，并转换成16进制编码；
		     3、转换为全小写形式后即获得签名串
		 */
		let signature = [this.config.key, content, this.config.secret, timestamp].join("");
		signature = crypto.createHash('sha1').update(signature).digest('hex').toLowerCase();
		return `action=${action}&sign=${signature}&ts=${timestamp}&key=${this.config.key}&content=${content}`;
	}
}
module.exports = models;
