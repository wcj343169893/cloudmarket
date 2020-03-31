/**
 * @param {Object} options
 * 网络请求 模块
 */
const network = function(options) {
	return new Promise((resolve, reject) => {
		try {
			let userInfo = uni.getStorageSync('userInfo') || '';
			if(!options.data){
				options.data={};
			}
			if(userInfo.id){
				options.data.uid = userInfo.id;
				options.data.token = userInfo.token;
			}
		} catch (e) {
			reject("错误信息" + e)
		}

		if (!options.isShowLoading) { //是否需要显示  loading(true:不显示，false:显示)
			uni.showLoading({
				title: '正在加载',
				mask: false
			});
		}

		uniCloud.callFunction({
			name: options.url,
			data: options.data || {}
		}).then(res => {
			uni.hideLoading()
			if (res.result.code !== 200) {
				if(res.result.code !== 404){
					//没有数据
					reject({});
					return;
				}
				return Promise.reject(new Error(res.result.message));
			}
			resolve(res.result.data);
		}).catch(err => {
			uni.hideLoading()
			reject(err)
			uni.showToast({
				icon: "none",
				title: '稍后重试' + err.message
			});
		})
	})
}

export default network;
