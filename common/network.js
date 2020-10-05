// const {client,auth} = require("./cloud.js")
import {
	client,
	auth
} from './cloud.js';
let isShowLoginDialog=false;
/**
 * @param {Object} options
 * 网络请求 模块
 */
const network = (options)=> {
	return new Promise((resolve, reject) => {
		let data = {};
		if (options.data) {
			data = options.data;
		}
		let showLoginDialog = false;
		if (options.auth) {
			showLoginDialog = true;
			let uni_id_token_expires = uni.getStorageSync("uni_id_token_expires");
			if (uni_id_token_expires < new Date().getTime()) {
				//没有合理的登录信息，对于必须验证登录的接口，直接返回404
				if(uni_id_token_expires > 0){
				}
				console.log("未登录",uni_id_token_expires)
				reject({
					code: 401,
					message: "未登录"
				});
				return;
			}
		}
		if (options.isShowLoading) { //是否需要显示  loading(true:不显示，false:显示)
			uni.showLoading({
				title: "加载中",
				mask: options.isShowMask
			});
		}
		console.log("network",JSON.stringify(options));
		client.callFunction({
			name: options.url,
			data: data
		}).then(res => {
			uni.hideLoading()
			console.log(res)
			if (res.result.code !== 200) {
				console.log(options);
				if (res.result.code === 404) {
					//没有数据,message,data
					reject(res.result);
					return;
				} else if (res.result.code === 401) {
					//登录信息错误,需要重新登录
					if (showLoginDialog && !isShowLoginDialog) {
						isShowLoginDialog=true;
						uni.showModal({
							title: "温馨提示",
							content: '您的登录已失效，请登录后再操作',
							cancelText: '取消',
							confirmText: '去登录',
							success: (res) => {
								if (res.confirm) {
									uni.navigateTo({
										url: `/pages/public/login`
									});
								}
								isShowLoginDialog=false;
								uni.$emit('logoutEvent'); //全局更新购物车
							}
						});
						return;
					}
				}
				return Promise.reject(new Error(res.result.message));
			}
			resolve(res.result.data);
		}).catch(err => {
			uni.hideLoading()
			reject(err)
			uni.showToast({
				icon: "none",
				title: err.message || '系统错误,请稍后重试'
			});
		})
	})
}

export default network;
