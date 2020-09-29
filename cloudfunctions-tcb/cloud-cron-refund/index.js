'use strict';
const db = uniCloud.database();
const cmd = db.command;
const uniPay = require('unipay');
const {
	getAlipayConfig,
	getWxPayConfig
} = require('configs');
const {
	addUserBalanceLog,
	genOrderNo
} = require('base-common');
const orderRefundsCollection = db.collection("cloud_order_refunds");
const userCollection = db.collection("uni-id-users");
const orderCollection = db.collection("cloud_orders");
exports.main = async (event, context) => {
	//1.查询退款记录
	let data = await orderRefundsCollection.where({
		state: "successed",
		refundStatus: "paying"
	}).orderBy("id", "asc").limit(10).get();
	if (data.data.length > 0) {
		for (let order of data.data) {
			let uniPayIns = getPayIns(order.payInfo);
			if (uniPayIns) {
				let res = await uniPayIns.refund({
					uid: order.uid,
					outTradeNo: order.payInfo.outTradeNo,
					outRefundNo: "RF_" + genOrderNo(),
					totalFee: order.totalFee,
					refundFee: order.fee, //退款金额
					refundDesc: order.description, //退款原因
				});
				console.log("uniPayIns.refund", res);
				let description = "商家将不再准备此商品";
				if (order.payInfo.type !== "delivery") {
					let payname = order.payInfo.typeName || order.payInfo.name;
					description = `退款将退回至您的${payname}账户，请注意查收`;
				}
				res = await orderRefundsCollection.doc(order._id).update({
					refundStatus: "successed",
					modified: new Date().toISOString(),
					steps: cmd.unshift({
						title: "退款成功",
						desc: description,
						time: new Date().toISOString()
					})
				});
				console.log("uniPayIns.refund update", res);
				if (res.updated == 0) {
					//更新失败了,回滚事物
				}
				await pushOrderCancelInfo(order.id, "您的退款已受理完成，到账周期可查看退款明细。");
			}
		}
	}
	return data.data;
};
const payInsList = {};
const getPayIns = function(config) {
	if (!payInsList[config.type]) {
		let uniPayIns = false;
		switch (config.type) {
			case "wxpay":
				uniPayIns = uniPay.initWeixin(getWxPayConfig());
				break;
			case "alipay":
				uniPayIns = uniPay.initAlipay(getAlipayConfig())
				break;
			default:
				//余额
				uniPayIns = balancePay;
				break;
		}
		payInsList[config.type] = uniPayIns;
	}
	return payInsList[config.type];
}
const balancePay = {
	getBalance: async (uid) => {
		//账户余额
		let userInfo = await userCollection.where({
			_id: uid
		}).field({
			balance: 1
		}).get();
		let balance = 0;
		if (userInfo.data.length > 0 && userInfo.data[0].balance > 0) {
			//处理余额为2位小数
			balance = parseFloat(userInfo.data[0].balance.toFixed(2));
		}
		console.log("查询用户余额：", uid, balance);
		return balance;
	},
	refund: async (order) => {
		let money = order.refundFee / 100;
		let uid = order.uid;
		let res = await userCollection.where({
			_id: uid
		}).update({
			balance: cmd.inc(money)
		});
		let balance = await balancePay.getBalance(uid);
		console.log("保存账户资金", res);
		//记录余额变动历史user_balance_logs
		let log = await addUserBalanceLog({
			uid: uid,
			type: 1, //0支出，1收入
			balance: balance,
			orderId: order.outTradeNo,
			money: money,
			description: order.refundDesc,
		});
		console.log("保存账户收入日志", log);
	}
};

/**
 * 添加取消订单进度
 * @param {Object} id 
 * @param {Object} message
 */
const pushOrderCancelInfo = async function(id, message) {
	return await orderCollection.doc(id).update({
		cancelApply: cmd.push({
			message: message,
			time: new Date().getTime()
		})
	});
}
