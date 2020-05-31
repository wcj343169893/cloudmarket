import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
	state: {
		hasLogin: false,
		stationId: 0, //分站id
		shopId: 123457, //分站店铺id，根据收货地址动态设置
		categoryId: 0,
		location: {
			id: false, //收货地址id
			latitude: 0, //纬度
			longitude: 0, //经度
			name: "" //地址名称
		},
		userInfo: {
			nickname: "游客",
			portrait: "/static/missing-face.png",
			balance: 0,
			score: 0,
			coupons: 0
		},
	},
	mutations: {
		login(state, provider) {
			state.hasLogin = true;
			state.userInfo = provider;
			//缓存用户登陆状态
			uni.setStorage({
				key: 'userInfo',
				data: provider
			})
			//console.log(state.userInfo);
		},
		logout(state) {
			state.hasLogin = false;
			state.userInfo = {
				nickname: "游客",
				portrait: "/static/missing-face.png",
				balance: 0,
				score: 0,
				coupons: 0
			};
			uni.removeStorage({
				key: 'userInfo'
			});
			//重置收货地址
			state.location = {
				id: false, //收货地址id
				latitude: 0, //纬度
				longitude: 0, //经度
				name: "" //地址名称
			};
			uni.removeStorage({
				key: 'userLocationInfo'
			});
		},
		loginPage() {
			uni.navigateTo({
				url: '/pages/public/login'
			});
		},
		//修改最近店铺id
		changeShopId(state, id) {
			state.shopId = id;
		},
		//更新默认选中分类选项卡分类id
		changeMainCateId(state, id) {
			state.categoryId = id;
		},
		setUserLocation(state, data) {
			//获取用户位置信息，首页需要，如果是设置的收货地址，下次直接默认
			//顺序1：收货地址，2：当前定位，3：ip定位
			state.location = data;
			uni.setStorage({
				key: 'userLocationInfo',
				data: state.location
			})
		}
	},
	actions: {

	}
})

export default store
