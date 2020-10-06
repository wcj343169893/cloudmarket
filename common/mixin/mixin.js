export default{
	data(){
		return {
			page: 0, //页码
			limit: 10, //每页加载数据量
			loadingType: "loading", //0加载前 1加载中 2没有更多
			isLoading: false, //刷新数据
			loaded: false, //加载完毕
			isSubmit:false,//是否正在提交数据
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
			if(!url){
				return;
			}
			uni.navigateTo({
				url
			})
		},
		navTimeBack(fn) {
			setTimeout(() => {
				uni.navigateBack({})
				if(fn){
					fn();
				}
			}, 2000);
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