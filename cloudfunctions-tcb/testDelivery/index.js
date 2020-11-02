'use strict';
const db = uniCloud.database();
const {
	add
} = require("delivery");
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	return await add({
		module: "cantingbao",
		data: {
			"address": {
				"_id": "e656fa635f7fd678014dcf8844bd1daa",
				"address": "南商新天地2-72",
				"addressName": "小屋酱",
				"area": "102",
				"default": true,
				"latitude": 29.16226,
				"longitude": 107.087047,
				"mobile": "13500135000",
				"name": "清醒",
				"uid": "9ffb2a485f38964200999b1f07cb7b80"
			},
			"body": "秒杀红提10斤装",
			"cartCount": 1,
			"created": "2020-10-27T14:59:07.350Z",
			"dayIndex": 1,
			"deliveryHour": {
				"checked": true,
				"endTime": 1603846800000,
				"id": 1603843200000,
				"name": "明天 ",
				"number": 1018277973,
				"password": "72371591",
				"time": "08:00-09:00"
			},
			"deliveryType": "selfRaising",
			"freight": 0,
			"freightTitle": "免配送费",
			"goods": [{
				"_id": "e373396c5f64878e00116b157655de63",
				"amount": 1,
				"cartId": "none",
				"cartPrice": 0,
				"cutPrice": 0,
				"hasSku": false,
				"id": 21094,
				"miaosha": {
					"beginTime": 1603555200000,
					"endTime": 1606752000000,
					"limit": 0,
					"price": 47.92,
					"rate": 80,
					"sales": 0,
					"sku_id": 0,
					"state": "started",
					"stock": 80
				},
				"name": "",
				"onlySelfTake": 1,
				"originPrice": 59.9,
				"price": 47.92,
				"sku_id": 0,
				"sku_index": 0,
				"src": "https://646f-douwei-cad38c-1302662516.tcb.qcloud.la/goods_face/2020-09-18/37412867725874277.jpg",
				"stock": 80,
				"title": "秒杀红提10斤装",
				"tuangou": {
					"beginTime": 1600423680000,
					"endTime": 1600650480000,
					"pickup": 1600510080000,
					"price": 39.9,
					"unit": "件"
				},
				"upc": ""
			}],
			"id": new Date().getTime(),
			"inviter_uid": [],
			"isDelete": 0,
			"isPrint": false,
			"isSendNewOrder": {
				"RASL_1027_a3b88066514147eab8f642c05d80b6cb": {
					"6d653c19f83f44eb7e52fb7bbeb23c11": "successed_offline"
				}
			},
			"juli": 11.46,
			"lastPayTime": 1603811047449,
			"modified": "2020-10-27T14:59:10.722Z",
			"outTradeNo": "16038107506319124c1e53065a56b4",
			"payInfo": {
				"balance": 85515.21,
				"callback": "paySuccess",
				"module": "mall",
				"name": "余额支付",
				"outTradeNo": "16038107506319124c1e53065a56b4",
				"platform": "app-plus",
				"time": "2020-10-27T14:59:10.722Z",
				"totalFee": 4792,
				"tradeStatus": "TRADE_SUCCESS",
				"transactionId": "8e5be7055f9835be02662408745ad5e4",
				"type": "balance",
				"typeName": "余额",
				"uid": "9ffb2a485f38964200999b1f07cb7b80"
			},
			"platform": "ios,app-plus",
			"remark": "",
			"shop": {
				"_id": "b8df3bd65f94de3601bd053e7f02c190",
				"address": "重庆市南川区兴星支路18号",
				"delivery": {
					"deliveryDay": 4,
					"deliveryPeriod": [{
							"begin": 28800,
							"end": 32400
						},
						{
							"begin": 32400,
							"end": 45000
						},
						{
							"begin": 45000,
							"end": 48600
						},
						{
							"begin": 48600,
							"end": 52200
						}
					],
					"freeMoney": 10,
					"maxDistance": 5000,
					"minDistance": 5,
					"minPrice": 10,
					"money": 5,
					"perMoney": 1,
					"time": 30,
					"timeStep": 3600
				},
				"deliverySupportType": 3,
				"deliveryTypes": [
					"selfRaising"
				],
				"id": 123458,
				"latitude": 29.168182899,
				"longitude": 107.00708345,
				"name": "渝之道-兴隆镇",
				"phone": "18883380303",
				"src": "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/user/images/2020/8/29/1598701118731.jpg",
				"uid": "9ffb2a485f38964200999b1f07cb7b80"
			},
			"shopid": 123458,
			"state": 1,
			"stockNotEnough": [],
			"timeConsumingInfo": {
				"beginTime": 1603810747200,
				"consuming": 250,
				"endTime": 1603810747450
			},
			"totalDiscount": 11.98,
			"totalMoney": 47.92,
			"uid": "9ffb2a485f38964200999b1f07cb7b80"
		}
	});
};
