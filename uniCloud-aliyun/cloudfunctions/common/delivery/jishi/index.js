'use strict';
const crypto = require('crypto');
const mapUtil = require("../basic/mapUtil.js")
const basic = require("../basic/index.js")
/**
 * 微信即时配送
 * @link https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/industry/immediate-delivery/api.html
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

	},
	getOrderBaseInfo(order) {
		const {
			shop,
			address,
			userInfo,
			deliveryHour,
			goods
		} = order;
		let openid = userInfo && userInfo.wx_openid ? userInfo.wx_openid["mp-weixin"] : "";
		if (!openid) {
			console.error("用户openid不存在");
			return;
		}
		let data = {
			shopid: this.config.key,
			shop_order_id: order._id,
			delivery_id: this.delivery_id,
			openid,
			sender: {
				name: shop.name,
				city: shop.address.city,
			}
		}
	},
	_afterSend(data) {
		console.log("_afterSend", JSON.stringify(data));
		if (data.resultcode == 0) {
			return data;
		}
		console.log(data.resultmsg);
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