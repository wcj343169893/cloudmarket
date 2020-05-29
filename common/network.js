/**
 * @param {Object} options
 * 网络请求 模块
 */
const network = function(options) {
	return new Promise((resolve, reject) => {
		let data={};
		if(options.data){
			data = options.data;
		}
		let showLoginDialog=false;
		try {
			//云验证访问令牌,将来可以取消此段代码
			let userInfo = uni.getStorageSync('userInfo') || {};
			if(userInfo.id){
				showLoginDialog=true;
				data["uid"]=userInfo.id;
				if(!data.token){
					data["token"]=userInfo.token;
				}
			}
		} catch (e) {
			reject("错误信息" + e)
		}
		//没有合理的登录信息，对于必须验证登录的接口，直接返回404
		if(!showLoginDialog && options.auth){
			reject({
				code:404,
				message:"未登录"
			});
			return;
		}

		if (options.isShowLoading) { //是否需要显示  loading(true:不显示，false:显示)
			uni.showLoading({
				title: '正在加载',
				mask: options.isShowMask
			});
		}

		uniCloud.callFunction({
			name: options.url,
			data: data
		}).then(res => {
			uni.hideLoading()
			console.log(res)
			if (res.result.code !== 200) {
				if(res.result.code === 404){
					//没有数据,message,data
					reject(res.result);
					return;
				}else if(res.result.code === 401){
					//登录信息错误,需要重新登录
					uni.removeStorage({
						key:"userInfo"
					});
					const auth = uniCloud.auth();
					auth.signOut().then(res=>{
						console.log(res)
					});
					if(showLoginDialog){
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
							}
						});
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
