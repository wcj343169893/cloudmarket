//全局变量，是否正在跳转中，防止双击跳转两个页面
var isRedirect = false;
/**
 * 订单状态
 * @param {Object} ele
 */
const getOrderStateExp = function(item) {
	let stateTip = '',
		state = item.state,
		stateTipColor = '#303133',
		stateContent="";
	switch (+state) {
		case 0:
			stateTip = '待付款';
			stateContent = "订单未支付，去付款";
			stateTipColor = '#fa436a';
			break;
		case 1:
			stateTip = '待发货';
			stateContent = "订单已支付，等待发货";
			break;
		case 2:
			stateTip = '已发货';
			stateContent = "订单已发货，等待收货";
			break;
		case 3:
			stateTip = '已完成';
			stateContent = "感谢您的信任，祝您生活愉快";
			break;
		case 4:
			stateTip = '已评价';
			stateContent = "感谢您的信任，祝您生活愉快";
			break;
		case -1:
			stateTip = '已关闭';
			stateTipColor = '#909399';
			if(item.cancelStyle == "auto"){
				stateContent = "订单未支付，已自动取消";
			}else{
				stateContent = "订单未支付，已手动取消";
			}
			break;
		
			//更多自定义
	}
	return {
		stateTip,
		stateTipColor,
		stateContent,
	};
}
/**
 * 更新购物车总数量
 * @param int gnumber 
 */
const updateCartNumber = function(gnumber) {
	if (gnumber < 1) {
		uni.removeTabBarBadge({
			index: 2
		})
	} else if (gnumber > 999) {
		uni.setTabBarBadge({
			index: 2,
			text: "999+"
		});
	} else {
		uni.setTabBarBadge({
			index: 2,
			text: gnumber + ""
		});
	}
	console.log("cart_sum_count", gnumber)
	uni.setStorage({
		key: "cart_sum_count",
		data: gnumber
	})
};
/**
 * 获得购物车数量
 */
const getCartSumNumber = function() {
	let data = uni.getStorageSync("cart_sum_count");
	console.log("getCartSumNumber", data)
	if (data < 1) {
		data = 0;
	}
	return data;
}
/**
 * 递增购物车数量
 * @param {Object} number
 */
const incrCartNumber = function(number) {
	let data = getCartSumNumber();
	data += number;
	updateCartNumber(data);
	return data;
}
/**
 * 更新商品的标签,秒杀，满减
 * @param Object goods 商品信息
 * @param int isPrecise 是否精确，true:精确到规格
 */
const updateGoodsTags = function(goods, isPrecise) {
	let tags = [];
	//最大单品加入99件
	goods.limit = goods.limit || goods.stock < 100 ? goods.stock : 99;
	//是否存在多规格
	goods["hasSku"] = false;
	if (goods.skus && goods.skus.length > 0) {
		goods["hasSku"] = true;
		goods.skus.forEach(sku => {
			//多规格限购
			sku.limit = sku.limit || sku.stock < 100 ? sku.stock : 99;
		});
	} else {
		//默认id=0
		goods.sku_id = 0;
	}
	//console.log("updateGoodsTags");
	if (goods.miaosha) {
		let time = new Date().getTime();
		//秒杀必须是开始状态
		if (time < goods.miaosha.endTime && goods.miaosha.beginTime < time) {
			if (!isPrecise) {
				tags.push("限时");
			}
			//如果是多规格商品
			if (goods.hasSku) {
				let index = goods.skus.findIndex(sku => sku.id == goods.miaosha.sku_id);
				if (index != -1) {
					goods.miaosha.skuIndex = index;
					let sku = goods.skus[index];
					Object.assign(goods.skus[index], {
						originPrice: sku.price,
						price: goods.miaosha.price,
					});
					if (isPrecise) {
						sku.tags = ["限时"];
					}
					if (goods.price > sku.price) {
						goods.originPrice = sku.originPrice;
						//商品外面显示价格
						goods.price = sku.price;
					}
					//限量
					sku.limit = goods.miaosha.limit > 0 ? goods.miaosha.limit : goods.miaosha.stock;
					//型号信息
					goods.miaosha.skuInfo = sku;
				}
				/* 
				goods.skus.forEach(sku => {
					if (sku.id == goods.miaosha.sku_id) {
						goods.originPrice = sku.originPrice = sku.price;
						//规格折后价价格
						sku.price = goods.miaosha.price;
						//商品外面显示价格
						goods.price = goods.price > sku.price ? sku.price : goods.price;
						//限量
						sku.limit = goods.miaosha.limit > 0 ? goods.miaosha.limit : goods.miaosha.stock;
						if (isPrecise) {
							sku.tags = ["限时"];
						}
					}
				}) */
			} else {
				if (isPrecise) {
					tags.push("限时");
				}
				goods.originPrice = goods.price;
				goods.price = goods.miaosha.price;
				//限量
				goods.limit = goods.miaosha.limit > 0 ? goods.miaosha.limit : goods.miaosha.stock;
			}
			//console.log("goods.miaosha",goods)
		}
	}
	if (goods.manjian) {

	}
	goods["tags"] = tags;
};
//获取用户定位信息
const getUserLocation = function(state) {
	//获取用户位置信息，首页需要，
	//顺序1：收货地址，2：当前定位，3：ip定位
	if (state.latitude > 0) {
		return;
	}
	address({
		type: "default"
	}).then(res => {

	});
}
/**
 * 时间格式化,dateFormat('yyyy-MM-dd hh:mm:ss')}
 * @param {Object} value
 * @param {Object} fmt
 */
const dateFormat = function(value, fmt) {
	let getDate = new Date(value);
	let o = {
		'M+': getDate.getMonth() + 1,
		'd+': getDate.getDate(),
		'h+': getDate.getHours(),
		'm+': getDate.getMinutes(),
		's+': getDate.getSeconds(),
		'q+': Math.floor((getDate.getMonth() + 3) / 3),
		'S': getDate.getMilliseconds()
	};
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (getDate.getFullYear() + '').substr(4 - RegExp.$1.length))
	}
	for (let k in o) {
		if (new RegExp('(' + k + ')').test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
		}
	}
	return fmt;
}
let countDownTimerMap={};
/**
 * 关闭定时器
 * @param {Object} id
 */
const clearCountDownTimer = function(id){
	if(id && countDownTimerMap[id]){
		//删除指定
		clearInterval(countDownTimerMap[id]);
	}else{
		//删除所有
		for (let tid in countDownTimerMap) {
			clearInterval(countDownTimerMap[tid]);
		}
	}
}
/**
 * 倒计时,用于秒杀未开始或者已开始
 * @param {Object} item，包含输入的时间 startTime，输出的小时，分，秒
 * @param int endTime 最后时间
 * @param function callback 回调方法
 */
const miaoshaCountDown = function(item, endTime, callback) {
	let startTime = parseInt(item.startTime / 1000);
	let lastTime = parseInt(endTime / 1000);
	/* if(startTime >= lastTime){
		if(callback){
			callback();
		}
		return false;
	} */
	let timerId = item.id;
	if(item.subId){
		timerId = item.id+"_"+item.subId;
	}
	if(countDownTimerMap[timerId]){
		clearInterval(countDownTimerMap[timerId]);
	}
	console.log(timerId)
	let tick = function() {
		let n1 = lastTime - startTime;
		//这里判断很关键，如果写1，在1秒之内，会重复调用
		if (n1 < 0) {
			return true;
		}
		let hour = parseInt(n1 / 3600);
		let minute = parseInt((n1 - hour * 3600) / 60);
		let second = parseInt(n1 % 60);

		item.hour = number2String(hour);
		item.minute = number2String(minute);
		item.second = number2String(second);
		startTime++;
		//console.log(item.minute,item.second);
		return false;
	}
	let number2String = function(n) {
		return ("00" + n).substr(("" + n).length);
	}
	let timePromise = new Promise((resolve, reject) => {
		let t1 = tick();
		countDownTimerMap[timerId] = setInterval(function() {
			t1 = tick();
			if (t1) {
				clearInterval(countDownTimerMap[timerId]);
				resolve();
			}
		}, 1000);
	});
	timePromise.then(res => {
		console.log("miaoshaCountDown finish")
		if (callback) {
			callback();
		}
	})
}

//登录提示框
const showLoginDialog = function() {
	uni.showModal({
		title: "温馨提示",
		content: '您还未登录，请登录后再操作',
		cancelText: '再逛逛',
		confirmText: '去登录',
		success: (res) => {
			if (res.confirm) {
				navToLoginPage();
			}
		}
	});
}
//跳转登录
const navToLoginPage = function(id, sid) {
	if (isRedirect) {
		return false;
	}
	isRedirect = true;
	uni.navigateTo({
		url: `/pages/public/login`,
		success: function() {
			isRedirect = false;
		}
	});
}
/** 跳转商品详细页 id商品id，sid型号id*/
const navToGoodsPage = function(id, sid) {
	if (isRedirect) {
		return false;
	}
	isRedirect = true;
	uni.navigateTo({
		url: `/pages/product/product?id=${id}&sid=${sid}`,
		success: function() {
			isRedirect = false;
		}
	});
}
//创建订单
const navToCreateOrder = function() {
	if (isRedirect) {
		return false;
	}
	isRedirect = true;
	uni.navigateTo({
		url: `/pages/order/createOrder`,
		success: function() {
			isRedirect = false;
		}
	});
}
//支付订单跳转
const navToPayOrder = function(id, money) {
	if (isRedirect) {
		return false;
	}
	isRedirect = true;
	uni.navigateTo({
		url: `/pages/money/pay?id=${id}&money=${money}`,
		success: function() {
			isRedirect = false;
		}
	});
}
/**
 * 订单商品列表
 */
const navToOrderGoodsList = function() {
	if (isRedirect) {
		return false;
	}
	isRedirect = true;
	uni.navigateTo({
		url: `/pages/order/goods`,
		success: function() {
			isRedirect = false;
		}
	});
}
/**
 * 订单详情
 */
const navToOrderDetail = function(id) {
	if (isRedirect) {
		return false;
	}
	isRedirect = true;
	uni.navigateTo({
		url: `/pages/order/detail?id=${id}`,
		success: function() {
			isRedirect = false;
		}
	});
}

export {
	updateCartNumber,
	incrCartNumber,
	getCartSumNumber,
	navToGoodsPage,
	navToLoginPage,
	navToCreateOrder,
	getUserLocation,
	showLoginDialog,
	navToPayOrder,
	updateGoodsTags,
	navToOrderGoodsList,
	dateFormat,
	miaoshaCountDown,
	navToOrderDetail,
	clearCountDownTimer,
	getOrderStateExp
}
