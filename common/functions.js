//全局变量，是否正在跳转中，防止双击跳转两个页面
var isRedirect = false;
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
};
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
	}
	if (goods.miaosha) {
		if (!isPrecise) {
			tags.push("限时");
		}
		//如果是多规格商品
		if (goods.hasSku) {
			goods.skus.forEach(sku => {
				//多规格限购
				sku.limit = sku.limit || sku.stock < 100 ? sku.stock : 99;
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
			})
		} else {
			if (isPrecise) {
				tags.push("限时");
			}
			goods.originPrice = goods.price;
			goods.price = goods.miaosha.price;
			//限量
			goods.limit = goods.miaosha.limit > 0 ? goods.miaosha.limit : goods.miaosha.stock;
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
/**
 * 倒计时,用于秒杀未开始或者已开始
 * @param {Object} item
 * @param int endTime
 */
const countDown = function(item,endTime){
	
}

//登录提示框
const showLoginDialog = function() {
	uni.showModal({
		title: "温馨提示",
		content: '您还未登录，请登录后再操作',
		cancelText: '再逛逛',
		confirmText: '去登录',
		success: function(res) {
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

export {
	updateCartNumber,
	navToGoodsPage,
	navToLoginPage,
	navToCreateOrder,
	getUserLocation,
	showLoginDialog,
	navToPayOrder,
	updateGoodsTags,
	navToOrderGoodsList,
	dateFormat
}
