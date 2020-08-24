/**
 * @param {Object} data
 * 各个 数据请求 方法
 */
import network from "./network.js";
/**
 * 获取店铺信息
 * @param {Object} data
 */
const shopAdmin = function(action,data,isShowLoading) {
	return adminNetwork("shops",action,data,isShowLoading);
}
/**
 * 订单管理
 * @param {Object} data
 */
const orderAdmin = function(action,data) {
	return adminNetwork("orders",action,data,false);
}

/**
 * 商品信息管理
 * @param {Object} data
 */
const goodsAdmin = function(action,data) {
	return adminNetwork("goods",action,data,false);
}

/**
 * 商品信息管理
 * @param {Object} data
 */
const categoryAdmin = function(action,data) {
	return adminNetwork("categories",action,data,false);
}
/**
 * 店铺广告信息
 * @param {Object} data
 */
const adsAdmin = function(action,data) {
	return adminNetwork("ads",action,data,false);
}
/**
 * 文档管理
 * @param {Object} action
 * @param {Object} data
 */
const docsAdmin = function(action,data) {
	return adminNetwork("docs",action,data,false);
}

const adminNetwork = (module,action,data,isShowLoading)=>{
	isShowLoading = isShowLoading!= undefined ?isShowLoading:true;
	//统一读取店铺id,必填项
	let adminShopId = uni.getStorageSync("adminShopId");
	if(!adminShopId){
		return false;
	}
	//console.log(adminShopId)
	return network({
		url: "cloud-admin",
		data: {
			module:module,
			action:action,
			data:data,
			shopid:adminShopId
		},
		auth: true,
		isShowLoading: isShowLoading
	});
}
export {
	shopAdmin,
	orderAdmin,
	goodsAdmin,
	categoryAdmin,
	adsAdmin,
	docsAdmin
}
