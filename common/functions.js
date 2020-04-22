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

const getUserLocation = function(){
	//获取用户位置信息，首页需要，
	//顺序1：收货地址，2：当前定位，3：ip定位
	if(!state.location.id){
		
	}
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
	navToCreateOrder
}
