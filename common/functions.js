//全局变量，是否正在跳转中，防止双击跳转两个页面
var isRedirect=false;
//更新购物车总数量
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
//获取用户定位信息
const getUserLocation = function(state){
	//获取用户位置信息，首页需要，
	//顺序1：收货地址，2：当前定位，3：ip定位
	if(state.latitude > 0){
		return ;
	}
	address({
		type:"default"
	}).then(res=>{

	});
}
//登录提示框
const showLoginDialog = function(){
	uni.showModal({
		title:"温馨提示",
		content:'您还未登录，请登录后再操作',
		cancelText:'再逛逛',
		confirmText:'去登录',
		success: function (res) {
			if (res.confirm) {
				navToLoginPage();
			}
		}
	});
}
//跳转登录
const navToLoginPage = function(id, sid) {
	if(isRedirect){
		return false;
	}
	isRedirect=true;
	uni.navigateTo({
		url: `/pages/public/login`,
		success: function() {
			isRedirect=false;
		}
	});
}
/** 跳转商品详细页 id商品id，sid型号id*/
const navToGoodsPage = function(id, sid) {
	if(isRedirect){
		return false;
	}
	isRedirect=true;
	uni.navigateTo({
		url: `/pages/product/product?id=${id}&sid=${sid}`,
		success: function() {
			isRedirect=false;
		}
	});
}
//创建订单
const navToCreateOrder = function() {
	if(isRedirect){
		return false;
	}
	isRedirect=true;
	uni.navigateTo({
		url: `/pages/order/createOrder`,
		success: function() {
			isRedirect=false;
		}
	});
}
export {
	updateCartNumber,
	navToGoodsPage,
	navToLoginPage,
	navToCreateOrder,
	getUserLocation,
	showLoginDialog
}
