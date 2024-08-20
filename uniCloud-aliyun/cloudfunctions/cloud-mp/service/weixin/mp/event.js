const {
	Service
} = require('uni-cloud-router');
const BasicService = require('./basic.js')
const delivery = require('delivery');
/**
 * 事件消息
 */
module.exports = class EventService extends BasicService {
	constructor(ctx) {
		super(ctx)
	}
	/**
	 * 关注公众号事件，绑定后台用户
	 * {"ToUserName":"gh_d224039b88de","FromUserName":"ov7Ue52jOWPY1PCBu2e3yOXSJrTM","CreateTime":"1662365351","MsgType":"event","Event":"subscribe","EventKey":""}
	 * @param {Object} data
	 * 
	 */
	async subscribe(data) {
		console.log("处理关注事件")
		//查询用户信息
		await this.bindAccount(data.FromUserName)
		return "欢迎关注公众号"
	}


	/**
	 * 取消关注
	 * @param {Object} data
	 */
	async unsubscribe(data) {
		console.log("取消关注", data.FromUserName)
		await this.service.user.user.updateByOpenid(data.FromUserName, this.wxConfig.appid, this.ctx.context
			.APPID, {
				is_subscribe_mp: false
			})
	}
	/**
	 * 更新即时配送订单状态
	 * @param {Object} data
	 */
	async updateWaybillStatus(data) {
		console.log("updateWaybillStatus", data)
		//调用mall云函数
		const res2 = await uniCloud.callFunction({
			name: "cloud-mall",
			data: {
				module: "order",
				action: "dealstate",
				data: {
					module: "jishi",
					...data
				},
				context: this.ctx.context
			}
		})
		console.log(res2)
	}
}