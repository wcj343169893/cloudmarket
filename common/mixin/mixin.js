export default{
	data(){
		return {
			page: 0, //页码
			limit: 10, //每页加载数据量
			loadingType: "loading", //0加载前 1加载中 2没有更多
			isLoading: false, //刷新数据
			loaded: false, //加载完毕
			isSubmit:false,//是否正在提交数据
			itemDataKey: "navigateToItemData"
		}
	},
	computed: {
		shopId(){
			return this.$store.state.shopId;
		}
	},
	methods: {
		log(data){
			console.log(JSON.parse(JSON.stringify(data)))
		},
		
		/**
		 * navigatorTo跳转页面
		 * @param {String} url
		 * @param {Object} options
		 * @param {Boolean} options.login 是否检测登录  
		 */
		navTo(url, options={}){
			this.$finishSubmit();
			if(!url){
				return;
			}
			uni.navigateTo({
				url
			})
		},
		/**
		 * 传递数据到下一个页面
		 * @param {Object} url
		 * @param {Object} item
		 */
		navToItem(url, item) {
			this.$submitData(() => {
				if (item) {
					uni.setStorageSync(this.itemDataKey, item);
				}
				this.navTo(url);
			});
		},
		navTimeBack(fn) {
			setTimeout(() => {
				uni.navigateBack({})
				if(fn){
					fn();
				}
			}, 2000);
		},
		/**
		 * 获取上一个页面传过来的数据,对象是最好的，不要来数组
		 * @param {Boolean} isAutoSet 是否设置到data数据中
		 */
		getItemData(isAutoSet) {
			let data = uni.getStorageSync(this.itemDataKey);
			if (isAutoSet) {
				//数组不允许设置
				//console.log(typeof(data))
				if (typeof(data) == "array") {
					return data;
				}
				for (let key in data) {
					this[key] = data[key];
				}
			}
			return data;
		},
		/**
		 * 开始提交数据，设置isSubmit防止重复提交
		 * @param {Object} fn
		 */
		$submitData(fn) {
			if (this.isSubmit) {
				return false;
			}
			this.isSubmit = true;
			//如果回调不成功，则认为本次执行完毕
			if (!fn()) {
				this.$finishSubmit();
			}
		},
		/**
		 * 结束提交
		 */
		$finishSubmit() {
			this.isSubmit = false;
		},
		imageOnLoad(data, key){
			//这里有问题，页面数据重新刷新后，图片地址为改变的时候，不触发图片的load事件，
			setTimeout(()=>{
				this.$set(data, 'loaded', true);
			}, 100)
		},
		showPopups(key){
			this.$api.throttle(()=>{
				this.$refs[key].open();
			}, 200)
		},
		hidePopups(key){
			this.$refs[key].close();
		},
		stopPrevent(){},
	},
}