'use strict';
const db = uniCloud.database();
const cmd = db.command;
const orderCollection = db.collection("cloud_orders");
const orderRefundsCollection = db.collection("cloud_order_refunds");
const goodsDaySalesCollection = db.collection("cloud_goods_day_sales");
const goodsShopDaySalesCollection = db.collection("cloud_goods_shop_day_sales");
const {
	updateUserOrderCount,
	getDateString
} = require('base-common');
const {
	print
} = require('printers');
const model = {
	/**
	 * 检查订单状态
	 */
	async checkOrder(data) {
		let time = new Date().getTime();
		const order = await this.getOrderByConditions({
			_id: data.id
		}, {
			id: 1,
			totalMoney: 1,
			totalDiscount: 1,
			freight: 1,
			state: 1,
			body: 1, //商品描述，100字以内
			yuding: 1,
			lastPayTime: 1
		});
		if (!order) {
			data.message = "订单不存在";
			return false;
		}
		if (order.state !== 0) {
			data.message = "订单" + (order.state = 1 ? "已支付" : "已取消");
			return false;
		} else if (order.lastPayTime < time) {
			data.message = "订单已超时"
			return false;
		} else if (order.yuding) {
			//1.未支付，2已支付定金
			if (order.yuding.endTime > time) {
				if (order.yuding.state == 1) {
					data.message = "已支付定金"
					return false;
				}
				//支付预定订单
				order.totalMoney = order.yuding.price;
				//切换通知模块，方便后面处理
				order.module = "yuding";
				//不能使用的支付方式
				order.excludePayment = ["delivery"];
				order.body = "定金：" + order.body;
				console.log("定金", order.yuding);
			} else {
				//支付尾款
				order.totalMoney = order.yuding.finishPaymentPrice + order.freight;
				order.body = "尾款：" + order.body;
				console.log("尾款", order.yuding);
			}
		} else {
			order.totalMoney += order.freight;
		}
		return order;
	},
	/**
	 * 更新支付单号，避免重复，支付成功之后，根据此id查询订单
	 */
	async updateOutTradeNo(order) {
		return await orderCollection.doc(order._id).update({
			outTradeNo: order.outTradeNo
		});
	},

	/**
	 * 支付完成后，更新订单信息
	 * @param {Object} event
	 */
	async updatePaymentInfo(event) {
		//console.log(event);
		let time = new Date().toISOString();
		//reserve_
		let outTradeNo = event.outTradeNo;
		let data = await orderCollection.where({
			state: 0,
			outTradeNo
		}).update({
			state: 1,
			payInfo: {
				time: time,
				...event
			},
			modified: time
		});
		//首次修改状态
		if (data.updated == 1) {
			let order = await this.getOrderByConditions({
				outTradeNo
			}, this.getFields());
			//更新用户订单统计，用户待付款订单数
			let res = await updateUserOrderCount(order.uid, "payup", 1, "unpaid", order.shopid);
			console.log("updateUserOrderCount", res);
			// 打印订单
			res = await print(order, order.shopid);
			console.log("print", res);

			//商品销量日志
			let up = {
				goods: {}
			};
			let shopSales = {
				shops: {}
			};
			order.goods.map((g) => {
				//每件商品销量
				up.goods[g._id] = cmd.inc(g.amount * 1);
			});
			//店铺销量
			shopSales.shops[order.shopid] = cmd.inc(order.cartCount * 1)
			let dayTime = getDateString();

			//商品销量
			res = await goodsDaySalesCollection.where({
				day: dayTime
			}).update(up);
			console.log("saleRes", res);
			//店铺每日销量
			res = await goodsShopDaySalesCollection.where({
				day: dayTime
			}).update(shopSales);
			console.log("saleRes", res);
		}
		return data;
	},

	/**
	 * 根据条件查询订单信息
	 * @param {Object} conditions
	 * @param {Object} fields
	 */
	async getOrderByConditions(conditions, fields) {
		let data = await orderCollection.where(conditions).limit(1).field(fields).get();
		if (data.data.length == 0) {
			return false;
		}
		return data.data[0];
	},
	/**
	 * 获取需要退款的订单
	 */
	async getRefundOrders() {
		let data = await orderRefundsCollection.where({
			state: "successed",
			refundStatus: "paying"
		}).orderBy("id", "asc").limit(10).get();
		console.log("查询到商城退款记录", data.data.length);
		return data.data;
	},
	/**
	 * 处理退款成功的订单
	 */
	async refundSuccess(refund) {
		let res = await orderRefundsCollection.doc(refund._id).update({
			refundStatus: "successed",
			modified: new Date().toISOString(),
			steps: cmd.unshift({
				title: "退款成功",
				desc: refund.message,
				time: new Date().toISOString()
			})
		});
		console.log("处理退款记录", res);
		if (refund.canceled) {
			res = await orderCollection.doc(refund.orderId).update({
				cancelApply: cmd.push({
					message: "您的退款已受理完成，到账周期可查看退款明细。",
					time: new Date().getTime()
				})
			});
			console.log("增加取消订单消息", res);
		}
		return true;
	},
	getFields() {
		return {
			uid: 1,
			id: 1,
			goods: 1,
			shopid: 1,
			yuding: 1,
			shop: 1,
			juli: 1,
			address: 1,
			deliveryType: 1,
			deliveryHour: 1,
			created: 1,
			remark: 1,
			totalMoney: 1,
			totalDiscount: 1,
			deduction: 1,
			freight: 1,
			cartCount: 1
		};
	}
}
module.exports = model;
