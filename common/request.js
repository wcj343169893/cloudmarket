/**
 * @param {Object} data
 * 各个 数据请求 方法
 */
import network from "./network.js";
//获取首页数据
const getHomeData = function(data) {
	return network({
		url: "home",
		data: data,
		isShowLoading: false
	})
}
//获取水果首页数据
const getHomeFruitData = function(data) {
	return network({
		url: "homeFruit",
		data: data,
		isShowLoading: false
	})
}
/**
 * 分页查询最近的秒杀商品
 * @param {Object} data
 */
const getMiaosha = function(data) {
	data["action"] = "miaosha";
	return network({
		url: "goods",
		data: data,
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
	data["action"] = "detail";
	return network({
		url: "goods",
		data: data
	})
}
//单独获取购物车数据
const getCartList = function(data) {
	data["opt"] = data.opt || "list";
	return network({
		url: "carts",
		data: data,
		auth: true,
		isShowLoading: data.showLoading
	})
}
//修改购物车数量，0为删除
const editCart = function(data) {
	data["opt"] = "edit";
	return network({
		url: "carts",
		data: data,
		auth: true,
		isShowLoading: true
	})
}
const addManyCart = function(data) {
	data["opt"] = "addmany";
	return network({
		url: "carts",
		data: data,
		auth: true,
		isShowLoading: true
	})
}
//清空购物车数量，0为删除
const cleanCart = function(data) {
	data["opt"] = "clean";
	return network({
		url: "carts",
		data: data,
		auth: true,
		isShowLoading: true
	})
}
//批量选择购物车
const selectCart = function(data) {
	data["opt"] = "selected";
	return network({
		url: "carts",
		data: data,
		auth: true,
		isShowLoading: true
	})
}
//购物车结算
const settlementCart = function(data) {
	data["opt"] = "settlement";
	return network({
		url: "carts",
		data: data,
		auth: true,
		isShowLoading: true,
		isShowMask: true
	})
}
//预结算、结算提交订单
const settlement = function(data) {
	return network({
		url: "settlement",
		data: data,
		auth: true,
		isShowLoading: true
	})
}
//收货地址管理,新增，删除，修改，列表
const address = function(data) {
	return network({
		url: "address",
		data: data,
		auth: true,
		isShowLoading: true
	})
}
//支付查询
const payInfo = function(data) {
	return network({
		url: "payInfo",
		data: data,
		auth: true,
		isShowLoading: true,
		isShowMask: true
	})
}
//获取支付参数
const payment = function(data) {
	return network({
		url: "payment",
		data: data,
		isShowLoading: true,
		isShowMask: true
	})
}
//订单
const orders = function(data) {
	let isShowLoading = data["type"] != "list";
	return network({
		url: "orders",
		data: data,
		auth: true,
		isShowLoading: isShowLoading,
		isShowMask: true
	})
}
//最近浏览记录
const getGoodsVisites = function(data) {
	data["action"] = "visite";
	return network({
		url: "goods",
		data: data,
		auth: true,
		isShowLoading: false
	})
}
//极光手机号自动登录
const mobileAutoLogin = function(data) {
	data["channel"] = "jiguang";
	return network({
		url: "login",
		data: data,
		isShowLoading: true
	})
}
//手机号+验证码登录
const mobileLogin = function(data) {
	data["channel"] = "mobile";
	return network({
		url: "login",
		data: data,
		isShowLoading: true
	})
}
/**
 * token自动登录，有有效期限制
 */
const channelLogin = function(data) {
	return network({
		url: "login",
		data: data,
		isShowLoading: true
	})
}
/**
 * 获取自己的信息
 * @param {Object} data
 */
const getUserInfo = function(data) {
	return network({
		url: "users",
		data: data,
		auth: true,
		isShowLoading: true
	})
}
/**
 * 修改自己的信息
 * @param {Object} data
 */
const saveUserInfo = function(data) {
	data["type"] = data.type || "save";
	return network({
		url: "users",
		data: data,
		auth: true,
		isShowLoading: true
	})
}
/**
 * 余额支付
 * @param {Object} data
 */
const balancePay = function(data) {
	data["provider"] = "balance";
	return network({
		url: "payment",
		data: data,
		auth: true,
		isShowLoading: true,
		isShowMask: true
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
	data["action"] = "search";
	return network({
		url: "goods",
		data: data,
		isShowLoading: true,
		isShowMask: true
	})
}
const getDocContent = function(data) {
	return network({
		url: "documents",
		data: data
	})
}
/**
 * 小程序登录
 * @param {Object} data
 */
const micLogin = function(data) {
	return network({
		url: "micLogin",
		data: data
	})
}
export {
	getHomeFruitData,
	getMiaosha,
	getCategoryByPid,
	getShopsByCid,
	getHomeData,
	getShopHome,
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
	getUserInfo,
	saveUserInfo,
	getGoodsVisites,
	balancePay,
	mobileAutoLogin,
	cronCancelOrders,
	getToken,
	searchGoodsByKey,
	getDocContent,
	micLogin,
	mobileLogin,
	channelLogin
}
