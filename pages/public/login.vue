<template>
	<view class="container"></view>
</template>

<script>
const shanYanSDKModule = uni.requireNativePlugin('CLSDK-ShanYanSDKModule'); //调用
import { mobileAutoLogin } from '@/common/request.js';
import { mapMutations } from 'vuex';

export default {
	data() {
		return {
			platform:"",
			logining: false
		};
	},
	onLoad() {
		this.platform = uni.getSystemInfoSync().platform;
		//在应用初始化调用
		this.initLogin();
		//this.getPhoneInfo();
	},
	methods: {
		...mapMutations(['login']),
		async initLogin(){
			uni.showLoading({
				mask: true
			});
			//初始化自动登录
			let appid;
			let appkey;
			if (this.platform == 'android') {
				appid = '5AvWkYQj';
				appkey = 'MxqI3HJV';
			} else if (this.platform == 'ios') {
				appid = 'eWWfA2KJ';
				appkey = 'tDo3Ml2K';
			}
			console.log('初始化自动登录', appid);
			shanYanSDKModule.init(
				{
					appid: appid
				},
				result => {
					//初始化回调
					console.log('初始化', result);
					if(result.code == 1022){
						setTimeout(()=>{
							this.getPhoneInfo();
						},3000);
					}
				}
			);
		},
		async getPhoneInfo() {
			uni.showLoading({
				mask: true
			});
			//实际预取号建议提前调用，如将要调起授权页的前置页面的onLoad中、个人中心页面的onLoad等可预期会触发一键登录的时机
			if (this.platform == 'android') {
				//闪验SDK 预取号
				shanYanSDKModule.getPhoneInfo(result => {
					console.log('getPhoneInfo', result);
					if (result.code == 1022) {
						this.qulickLogin();
					}else{
						uni.hideLoading();
						this.$api.msg(result.result);
						this.navTimeBack();
					}
				});
			} else if (this.platform == 'ios') {
				//闪验SDK 预取号
				shanYanSDKModule.preGetPhonenumber(complete => {
					console.log('getPhoneInfo', result);
					if (result.code == 1022) {
						this.qulickLogin();
					}else{
						this.$api.msg(result.result);
					}
				});
			}
		},
		qulickLogin() {
			setTimeout(function() {
				uni.hideLoading();
			}, 5000);
			if (this.platform == 'android') {
				/*************************Android*************************/
				//闪验SDK  拉起授权页方法
				shanYanSDKModule.openLoginAuth(
					true,
					result => {
						uni.hideLoading();
						console.log('授权页面打开结果：', result);
					},
					result => {
						console.log('授权返回结果：', result);
						if (result.code == 1000) {
							//同意授权
							let res = JSON.parse(result.result);
							console.log(res.token);
							mobileAutoLogin({
								token: res.token
							}).then(res => {
								console.log(res);
							});
							//"{"token":"A3-v7l3nambShQoBlgZKkaNX5qcE01lV3SENSERL4bOv0ZkVs6dc-7mIACAraAog2X-3qqtQISP1cBdba9v-ty1Nf6MuzbfI7H0iIF-iBWRGHx3oKtvHrTeNogO8BabqCg7Z7PIN8TxOiYFDCtENzAKBeOrfTOdlb-1pzzp9dVyBgFmkC1rwFzBD2gz_uzwBHN3hHUg-PvM5NRWWMMloTT_2A"}"
						} else {
							this.navBack();
						}
					}
				);
			} else if (this.platform == 'ios') {
				/*************************iOS*************************/
				//闪验SDK  拉起授权页方法
			}
		},
		navTimeBack(){
			setTimeout(()=>{
				this.navBack();
			},3000);
		},
		navBack() {
			uni.navigateBack();
		},
		async toLogin() {
			this.qulickLogin();
			return;
			this.logining = true;
			const { mobile, password } = this;
			/* 数据验证模块
				if(!this.$api.match({
					mobile,
					password
				})){
					this.logining = false;
					return;
				}
				*/
			const sendData = {
				mobile,
				password
			};
			const result = await this.$api.json('userInfo');
			if (result.status === 1) {
				this.login(result.data);
				setTimeout(() => {
					uni.navigateBack();
				}, 200);
			} else {
				this.$api.msg(result.msg);
				this.logining = false;
			}
		}
	}
};
</script>

<style lang="scss">
page {
	background: #fff;
}
.container {
	padding-top: 115px;
	position: relative;
	width: 100vw;
	height: 100vh;
	overflow: hidden;
	background: #fff;
}
.wrapper {
	position: relative;
	z-index: 90;
	background: #fff;
	padding-bottom: 40upx;
}
.back-btn {
	position: absolute;
	left: 40upx;
	z-index: 9999;
	padding-top: var(--status-bar-height);
	top: 40upx;
	font-size: 40upx;
	color: $font-color-dark;
}
.left-top-sign {
	font-size: 120upx;
	color: $page-color-base;
	position: relative;
	left: -16upx;
}
.right-top-sign {
	position: absolute;
	top: 80upx;
	right: -30upx;
	z-index: 95;
	&:before,
	&:after {
		display: block;
		content: '';
		width: 400upx;
		height: 80upx;
		background: #b4f3e2;
	}
	&:before {
		transform: rotate(50deg);
		border-radius: 0 50px 0 0;
	}
	&:after {
		position: absolute;
		right: -198upx;
		top: 0;
		transform: rotate(-50deg);
		border-radius: 50px 0 0 0;
		/* background: pink; */
	}
}
.left-bottom-sign {
	position: absolute;
	left: -270upx;
	bottom: -320upx;
	border: 100upx solid #d0d1fd;
	border-radius: 50%;
	padding: 180upx;
}
.welcome {
	position: relative;
	left: 50upx;
	top: -90upx;
	font-size: 46upx;
	color: #555;
	text-shadow: 1px 0px 1px rgba(0, 0, 0, 0.3);
}
.input-content {
	padding: 0 60upx;
}
.input-item {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	justify-content: center;
	padding: 0 30upx;
	background: $page-color-light;
	height: 120upx;
	border-radius: 4px;
	margin-bottom: 50upx;
	&:last-child {
		margin-bottom: 0;
	}
	.tit {
		height: 50upx;
		line-height: 56upx;
		font-size: $font-sm + 2upx;
		color: $font-color-base;
	}
	input {
		height: 60upx;
		font-size: $font-base + 2upx;
		color: $font-color-dark;
		width: 100%;
	}
}

.confirm-btn {
	width: 630upx;
	height: 76upx;
	line-height: 76upx;
	border-radius: 50px;
	margin-top: 70upx;
	background: $uni-color-primary;
	color: #fff;
	font-size: $font-lg;
	&:after {
		border-radius: 100px;
	}
}
.forget-section {
	font-size: $font-sm + 2upx;
	color: $font-color-spec;
	text-align: center;
	margin-top: 40upx;
}
.register-section {
	position: absolute;
	left: 0;
	bottom: 50upx;
	width: 100%;
	font-size: $font-sm + 2upx;
	color: $font-color-base;
	text-align: center;
	text {
		color: $font-color-spec;
		margin-left: 10upx;
	}
}
</style>
