'use strict';
const basic = require("../basic/index.js")

const models = {
	...basic,
	async addShop(data) {
		const result = await this.getWxShopList({});
		let company = result[data.delivery.thirdPartyDeliveryCompany];
		if (!company) {
			return false;
		}
		return {
			thirdPartyShopId: company.shopid,
			thirdPartyShopName: company.delivery_name,
			thirdPartyDeliveryId: company.delivery_id,
		}
	},
	/**
	 * 查看第三方公司信息
	 * @param {Object} data
	 */
	async getShop(data) {
		let {
			thirdPartyShopId
		} = data;
		const result = await this.getWxShopList({});
		let options = Object.keys(result).reduce((pre, key) => {
			pre[key] = result[key].delivery_name;
			return pre;
		}, {})
		return {
			options,
			data: thirdPartyShopId
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
			return result.shop_list.reduce((prev, item) => {
				prev[item.shopid] = item;
				return prev;
			}, {});
		}
		return {
			"NONE": "未绑定即时配送公司"
		};
	}
}
module.exports = models;