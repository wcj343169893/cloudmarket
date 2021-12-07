const {
	Controller
} = require('uni-cloud-router')
/**
 * 后台订单管理，发货（录入单号），退货等
 */
module.exports = class OrderController extends Controller {
	constructor(ctx) {
		super(ctx)
	}
	/**
	 *  发货，如果存在商品id，即为单个发货，并修改状态为已发货
	 */
	async deliver() {
		const {
			uid: adminUser
		} = this.ctx.auth;
		return await this.service.mall.order.setDeliver(this.ctx.data, adminUser);
	}

	/**
	 * 强制取消订单，全额退款
	 */
	async cancel() {
		const {
			uid: adminUser
		} = this.ctx.auth;
		let {
			id, //订单id
			uid,
			module //订单类型
		} = this.ctx.data;
		return await this.service.order[module].cancel(id, uid, async (order) => {
			if (order && order.payInfo) {
				//已付款订单，取消订单
				await this.service.payment[order.payInfo.type].refund({
					payInfo: order.payInfo,
					platform: order.platform,
					uid: order.user_id,
					outTradeNo: order.payInfo.outTradeNo,
					outRefundNo: order._id,
					totalFee: order.total_fee, //支付总金额
					refundFee: order.total_fee, //退款金额
					refundDesc: "取消订单", //退款原因
				})
			}
		}, true, adminUser);
	}
}
