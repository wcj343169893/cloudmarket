/**
 * @param {Object} data
 * 各个 数据请求 方法
 */
import network from "./network.js";
//获取水果首页数据
const getHomeFruitData = function(data) {
	return network({
		url: "cloud-mall",
		data: {
			module: "home",
			action: "index",
			data
		},
		isShowLoading: false
	})
}
/**
 * 分页查询最近的秒杀商品
 * @param {Object} data
 */
const getMiaosha = function(data) {
	return network({
		url: "cloud-mall",
		data: {
			module: "product",
			action: "miaosha",
			data
		},
		isShowLoading: false
	})
}
/**
 * 分页查询最近的团购商品
 * @param {Object} data
 */
const getTuangou = function(data) {
	return network({
		url: "cloud-mall",
		data: {
			module: "product",
			action: "tuangou",
			data
		},
		isShowLoading: false
	})
}
//根据上级id，查询二级分类
const getCategoryByPid = function(data) {
	return network({
		url: "getCategoryByPid",
		data: data,
		isShowLoading: false
	})
}
//根据分类id，分页查询店铺
const getShopsByCid = function(data) {
	return network({
		url: "getShops",
		data: data,
		isShowLoading: false
	})
}
//根据分类id，分页查询店铺
const getShopHome = function(data) {
	return network({
		url: "shopHome",
		data: data,
		isShowLoading: true
	})
}
const getAllCategories = function(data) {
	return network({
		url: "cloud-mall",
		data: {
			module: "category",
			action: "main",
			data
		},
		isShowLoading: true
	})
}
const getCategories = function(action, data) {
	return network({
		url: "cloud-mall",
		data: {
			module: "category",
			action: action,
			data
		},
		isShowLoading: true
	})
}
const getGoodsByCid = function(data) {
	return network({
		url: "getGoodsByCid",
		data: data
	})
}
/**
 * 查询商品详情
 * @param {Object} data
 */
const getGoodsInfo = function(data) {
	return network({
		url: "cloud-mall",
		data: {
			module: "product",
			action: "detail",
			data
		},
	})
}
//单独获取购物车数据
const getCartList = function(data) {
	return network({
		url: "cloud-mall",
		data: {
			module: "cart",
			action: data.opt || "list",
			data
		},
		auth: true,
		isShowLoading: data.showLoading
	})
}
//修改购物车数量，0为删除
const editCart = function(data) {
	return network({
		url: "cloud-mall",
		data: {
			module: "cart",
			action: "edit",
			data
		},
		auth: true,
		isShowLoading: true
	})
}
const addManyCart = function(data) {
	return network({
		url: "cloud-mall",
		data: {
			module: "cart",
			action: "addmany",
			data
		},
		auth: true,
		isShowLoading: true
	})
}
//清空购物车数量，0为删除
const cleanCart = function(data) {
	return network({
		url: "cloud-mall",
		data: {
			module: "cart",
			action: "clean",
			data
		},
		auth: true,
		isShowLoading: true
	})
}
//批量选择购物车
const selectCart = function(data) {
	return network({
		url: "cloud-mall",
		data: {
			module: "cart",
			action: "selected",
			data
		},
		auth: true,
		isShowLoading: true
	})
}
//购物车结算
const settlementCart = function(data) {
	return network({
		url: "cloud-mall",
		data: {
			module: "cart",
			action: "settlement",
			data
		},
		auth: true,
		isShowLoading: true,
		isShowMask: true
	})
}
//预结算、结算提交订单
const settlement = function(data) {
	return network({
		url: "cloud-mall",
		data: {
			module: "order",
			action: "settlement",
			data
		},
		auth: true,
		isShowLoading: true
	})
}
//收货地址管理,新增，删除，修改，列表
const address = function(data, action) {
	return network({
		url: "cloud-mall",
		data: {
			module: "address",
			action: action,
			data
		},
		auth: true,
		isShowLoading: true
	})
}
//支付查询
const payInfo = function(data, module) {
	return network({
		url: "cloud-payment",
		data: {
			module: module,
			action: "info",
			data
		},
		auth: true,
		isShowLoading: true,
		isShowMask: true
	})
}
//获取支付参数
const payment = function(data, module, action) {
	return network({
		url: "cloud-payment",
		data: {
			module: module,
			action: "pay",
			data
		},
		isShowLoading: true,
		isShowMask: true
	})
}
//订单
const orders = function(data) {
	let isShowLoading = data["type"] != "list";
	return network({
		url: "cloud-mall",
		data: {
			module: "order",
			action: data.type,
			data
		},
		auth: true,
		isShowLoading: isShowLoading,
		isShowMask: true
	})
}
/**
 * 退款
 * @param {Object} action
 * @param {Object} data
 * @param {Object} isShowLoading
 */
const refunds = function(action, data, isShowLoading) {
	return network({
		url: "cloud-mall",
		data: {
			module: "order",
			action: action,
			data
		},
		auth: true,
		isShowLoading: isShowLoading,
		isShowMask: true
	})
}
//最近浏览记录
const getGoodsVisites = function(data) {
	return network({
		url: "cloud-mall",
		data: {
			module: "product",
			action: "visite",
			data
		},
		auth: true,
		isShowLoading: false
	})
}
//手机号+验证码登录
const mobileLogin = function(data) {
	return network({
		url: "cloud-user",
		data: {
			module: "login",
			action: "mobile",
			data
		},
		isShowLoading: true
	})
}
//手机号+验证码登录
const mobileAutoLogin = function(data) {
	return network({
		url: "cloud-user",
		data: {
			module: "login",
			action: "jiguang",
			data
		},
		isShowLoading: true
	})
}
/**
 * 获取自己的信息
 * @param {Object} data
 */
const getUserInfo = function(data, action, isShowLoading = true) {
	action = action || "mine";
	return network({
		url: "cloud-user",
		data: {
			module: "info",
			action: action,
			data
		},
		auth: true,
		isShowLoading: isShowLoading
	})
}
const getUserStatistics = function(data) {
	return network({
		url: "cloud-user",
		data: {
			module: "info",
			action: "statistics",
			data
		},
		auth: true,
	})
}
/**
 * 发送短信
 * @param {Object} data
 */
const sendSms = function(data) {
	return network({
		url: "cloud-user",
		data: {
			module: "login",
			action: "sendSms",
			data
		},
		isShowLoading: true
	})
}
/**
 * 修改自己的信息
 * @param {Object} data
 */
const saveUserInfo = function(data, action) {
	return network({
		url: "cloud-user",
		data: {
			module: "info",
			action: action,
			data
		},
		auth: true,
		isShowLoading: true
	})
}
/**
 * 手动清理用户未支付的过期订单
 * @param {Object} data
 */
const cronCancelOrders = function(data) {
	return network({
		url: "cronCancelOrders",
		data: data,
		auth: true,
		isShowLoading: false
	})
}
/**
 * 获取登录访问令牌
 * @param {Object} data
 */
const getToken = function(data) {
	return network({
		url: "token",
		data: data,
		isShowLoading: false
	})
}
/**
 * 按关键字搜索商品
 * @param {Object} data
 */
const searchGoodsByKey = function(data) {
	return network({
		url: "cloud-mall",
		data: {
			module: "product",
			action: "search",
			data
		},
		isShowLoading: true,
		isShowMask: true
	})
}
const getDocContent = function(data, action) {
	return network({
		url: "cloud-mall",
		data: {
			module: "document",
			action: action,
			data
		},
	})
}
/**
 * 小程序登录
 * @param {Object} data
 */
const micLogin = function(data, provider) {
	return network({
		url: "cloud-user",
		data: {
			module: "login",
			action: provider,
			data
		}
	})
}
const cloudMall = (model, action, data, isShowLoading) => {
	return network({
		url: "cloud-mall",
		data: {
			module: model,
			action: action,
			data
		},
		isShowLoading: !!isShowLoading
	})
}
const cloudUser = (model, action, data, isShowLoading) => {
	return network({
		url: "cloud-user",
		data: {
			module: model,
			action: action,
			data
		},
		isShowLoading: !!isShowLoading
	})
}
const cloudVideo = (model, action, data, isShowLoading) => {
	return network({
		url: "cloud-video",
		data: {
			module: model,
			action: action,
			data
		},
		isShowLoading: !!isShowLoading
	})
}
export {
	getHomeFruitData,
	getMiaosha,
	getTuangou,
	getCategoryByPid,
	getShopsByCid,
	getShopHome,
	getAllCategories,
	getGoodsInfo,
	getGoodsByCid,
	getCartList,
	editCart,
	selectCart,
	cleanCart,
	addManyCart,
	settlementCart,
	settlement,
	address,
	payInfo,
	payment,
	orders,
	cloudVideo,
	getUserInfo,
	saveUserInfo,
	getGoodsVisites,
	cronCancelOrders,
	getToken,
	searchGoodsByKey,
	getDocContent,
	micLogin,
	mobileLogin,
	mobileAutoLogin,
	sendSms,
	getUserStatistics,
	refunds,
	getCategories,
	cloudMall,
	cloudUser
}
