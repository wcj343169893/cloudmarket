'use strict';
const crypto = require('crypto');
const mapUtil = require("../basic/mapUtil.js")
const basic = require("../basic/index.js")
/**
 * 微信即时配送
 * @link https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/industry/immediate-delivery/api.html
 * @link https://www.kancloud.cn/yunfuplus/yunfu/2002997#5_37 云浮商城即时配送文档
 */
const models = {
	...basic,
	name: "jishi",
	async addShop(shop) {
		const result = await this.getWxShopList({});
		let company = result[shop.delivery.thirdPartyDeliveryCompany];
		if (!company) {
			return false;
		}
		let address = await mapUtil.getLocationAddress(shop);
		return {
			thirdPartyShopId: company.shopid,
			thirdPartyShopName: company.delivery_name,
			thirdPartyDeliveryId: company.delivery_id,
			addressInfo: {
				province: address.province,
				city: address.city,
				area: address.area,
				street: address.street,
				house: address.house,
				lat: shop.latitude,
				lng: shop.longitude,
				phone: shop.phone,
			}
		}
	},
	/**
	 * 查看第三方公司信息
	 * @param {Object} delivery
	 */
	async getShop(delivery) {
		let {
			thirdPartyShopId
		} = delivery;
		const result = await this.getWxShopList({});
		let options = Object.keys(result).reduce((pre, key) => {
			pre[key] = result[key].delivery_name;
			return pre;
		}, {})
		let keys = Object.keys(result)
		if (thirdPartyShopId && keys.indexOf(thirdPartyShopId) == -1) {
			thirdPartyShopId = ""
		}
		return {
			options,
			//默认选中第一个
			data: thirdPartyShopId ? thirdPartyShopId : (keys.length > 0 ? keys[0] : "")
		}
	},
	/**
	 * 拉取已绑定账号
	 * @param {Object} data
	 * @link https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/immediate-delivery/deliver-by-business/getBindAccount.html
	 */
	async getWxShopList(data) {
		const result = await this.send({}, "shop/get");
		if (result.shop_list && result.shop_list.length > 0) {
			return result.shop_list.filter(e => e.audit_result == 0).reduce((prev, item) => {
				prev[item.shopid] = item;
				return prev;
			}, {});
		}
		return {
			"NONE": "未绑定即时配送公司"
		};
	},
	async preAdd(order, context) {
		let base = await this.getOrderBaseInfo(order);
		let res = await this.send(base, "order/pre_add");
		console.log("preAdd", JSON.stringify(res));
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
		//return this.preAdd(order, context);
		let base = await this.getOrderBaseInfo(order);
		if (!base) {
			return false;
		}
		let res = await this.send(base, "order/add");
		//{"resultcode":0,"resultmsg":"ok","fee":13,"deliverfee":13,"couponfee":0,"tips":0,"distance":4848,"waybill_id":"3614882468418789889","order_status":101,"finish_code":0,"pickup_code":4731,"dispatch_duration":300,"sender_lng":116.327914,"sender_lat":40.045488} 
		// console.log("add", JSON.stringify(res));
		if (res) {
			//返回配送单号
			return {
				id: res.waybill_id,
				fee: res.fee,
				distance: res.distance,
				pickupCode: res.pickup_code,
				finishCode: res.finish_code,
				duration: res.dispatch_duration
			};
		}
		return false;
	},
	async getOrderBaseInfo(order) {
		const {
			shop,
			address,
			userInfo,
			deliveryHour,
			goods
		} = order;
		//判断是否达到配送下单时间，提前30分钟下单
		if (deliveryHour.id > Date.now() + 30 * 60 * 1000) {
			console.log("未到配送时间");
			return false;
		}
		let openid = userInfo && userInfo.wx_openid ? userInfo.wx_openid["mp-weixin"] : "";
		if (!openid) {
			console.error("用户openid不存在");
			return false;
		}
		const {
			addressInfo: shopAddressInfo
		} = shop.delivery;
		let addressMapInfo = await mapUtil.getLocationAddress(address);
		let data = {
			shopid: this.config.key,
			shop_order_id: order.id,
			delivery_id: this.delivery_id,
			openid,
			//发件人信息，闪送、顺丰同城急送必须填写，美团配送、达达，若传了shop_no的值可不填该字段
			sender: {
				name: shop.name,
				city: shopAddressInfo.city,
				address: shop.address,
				address_detail: shopAddressInfo.house,
				phone: shop.phone,
				lng: shop.longitude,
				lat: shop.latitude,
				coordinate_type: 0,
			},
			//收件人信息
			receiver: {
				name: address.name,
				city: addressMapInfo.city,
				address: address.address,
				address_detail: address.area,
				phone: address.mobile,
				lng: address.longitude,
				lat: address.latitude,
				coordinate_type: 0,
			},
			// 货物信息
			cargo: {
				goods_value: order.totalMoney,
				goods_weight: 0.99, //货物重量，单位为kg，精确到小数点后两位（如果小数点后位数多于两位，则四舍五入保留两位小数），范围为(0-50]
				goods_detail: {
					goods: goods.map(e => {
						return {
							good_name: e.title,
							good_count: e.amount,
							good_price: e.price
						}
					})
				},
				cargo_first_class: this.config.cargo_first_class,
				cargo_second_class: this.config.cargo_second_class
			},
			order_info: {
				order_type: 0, //订单类型, 0: 即时单 1 预约单
				poi_seq: order.dayIndex, //门店订单流水号，需保证同一门店唯一
				note: order.remark, //备注
				order_time: Math.floor(Date.now() / 1000), //下单时间
				rider_pick_method: 1, //物流流向，1：从门店取件送至用户；2：从用户取件送至门店
				is_finish_code_needed: 0, //收货码，0-不需要，1-需要
				is_pickup_code_needed: 0, //取货码，0-不需要，1-需要
			},
			shop: {
				wxa_path: "pages/order/detail?id=" + order._id,
				// detail_list: goods.map(e => {
				// 	return {
				// 		goods_name: e.title,
				// 		goods_img_url: e.src
				// 	}
				// }),
				img_url: goods[0].src,
				goods_name: order.body,
				goods_count: goods.length,
				wxa_appid: this.config.weixin.appid
			},
			shop_no: this.config.shopNo,
			sub_biz_id: this.config.weixin.appid,
		}
		// console.log("data", data);
		return data;
	},
	async validateSign(data) {
		const out = {
			orderid: data.shop_order_id,
			response: {
				return_code: 0,
				return_msg: "OK"
			}
		}
		let titles = {
			"101": "等待分配骑手",
			"102": "分配骑手成功",
			"103": "配送完成",
			"201": "骑手到店开始取货",
			"202": "取货成功",
			"203": "配送完成",
			"204": "配送完成",
			"205": "配送异常",
			"301": "配送中",
			"302": "配送成功",
			"303": "配送成功",
			"304": "配送异常",
			"305": "配送异常",
			"401": "配送异常",
			"501": "配送异常",
			"502": "配送异常",
		}
		let contents = {
			"101": "等待分配骑手",
			"102": "分配骑手成功",
			"103": "商家取消订单",
			"201": "骑手到店开始取货",
			"202": "取货成功",
			"203": "取货失败，请联系商家",
			"204": "取货失败，请联系商家",
			"205": "取货失败，请联系商家",
			"301": "配送中",
			"302": "配送完成",
			"303": "配送完成",
			"304": "无法联系收货人，请联系商家",
			"305": "收货人拒收，请联系商家",
			"401": "配送异常，请联系商家",
			"501": "因运力系统原因取消，请联系商家",
			"502": "因不可抗拒因素，请联系商家",
		}
		out.result = {
			delivery: {
				state: data.order_status,
				stateTitle: titles[data.order_status],
				stateContent: titles[data.order_status],
			}
		}
		// console.log(data);
		switch (data.order_status) {
			case 203:
			case 204:
			case 205:
				out.result.state = 3;
				break;
			
			case 202:
			case 301:
				//配送方取消订单
				out.result.state = 2;
				break;
			case 302:
			case 303:
			case 304:
			case 305:
			case 401:
			case 501:
			case 502:
				out.result.state = 3;
				break;
			default:
				break;
		}

		return out
	},
	_afterSend(data) {
		console.log("_afterSend", JSON.stringify(data));
		if (data.resultcode == 0) {
			return data;
		}
		console.log(data.errmsg);
		return false;
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