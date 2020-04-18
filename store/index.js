import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
	state: {
		hasLogin: false,
		stationId: 0, //分站id
		shopId:123457,//分站店铺id，根据收货地址动态设置
		categoryId:0,
		userInfo: {},
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
			console.log(state.userInfo);
		},
		logout(state) {
			state.hasLogin = false;
			state.userInfo = {};
			uni.removeStorage({
				key: 'userInfo'
			})
		},
		loginPage(){
			uni.navigateTo({
				url: '/pages/public/login'
			});
		},
		//修改最近店铺id
		changeShopId(state,id){
			state.shopId = id;
		},
		changeMainCateId(state,id){
			state.categoryId = id;
		}
	},
	actions: {

	}
})

export default store
