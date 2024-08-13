<template>
	<view class="app" :style="styleCom">
		<view class="header">
			<image :src="images.success" class="success-image"></image>
			<view class="success-title">支付成功</view>
			<view class="hr"></view>
		</view>
		<view class="info-box">
			<view class="info-amount">¥ {{ (options.total_fee / 100).toFixed(2) }}</view>
			<view class="left-circle"></view>
			<view class="right-circle"></view>
			<view class="info-main">
				<view class="info-cell">
					<view class="left">订单编号</view>
					<view class="right">{{ options.order_no }}</view>
				</view>
				<view class="info-cell">
					<view class="left">付款时间</view>
					<view class="right">{{ timeFormat(options.pay_date,'yyyy-MM-dd hh:mm:ss') }}</view>
				</view>
			</view>
		</view>
		<!-- 广告位开始 -->
		<view class="uni-ad">
			<!-- 红包广告-->
			<ad-interactive v-if="options.adpid" :adpid="options.adpid" v-slot:default="{data, loading, error}" open-page-path="/uni_modules/uni-pay/pages/ad-interactive-webview/ad-interactive-webview" @error="onaderror">
				<view v-if="data" class="ad-interactive">
					<!-- 可以自定义此图片，组件提供了默认素材，通过 uni-ad 后台配置 -->
					<image :src="data.imgUrl" mode="widthFix"></image>
				</view>
			</ad-interactive>
			<!-- #ifndef MP-WEIXIN -->
			<!-- 注意：h5下的广告出来有延迟，后续要优化 -->
			<!-- <ad v-if="options.adpid" :adpid="options.adpid" type="banner" @error="onaderror"></ad> -->
			<!-- #endif -->
		</view>
		<!-- 广告位结束 -->
		<view v-if="options.return_url" class="button-query" @click="queryOrder">查看订单</view>
		<view class="footer-hr"></view>
	</view>
</template>

<script>
	import jsSdk from "../../js_sdk/js_sdk.js"
	export default {
		data() {
			return {
				options:{
					adpid:"",
					main_color:"",
					order_no:"",
					out_trade_no:"",
					total_fee:"",
					pay_date:"",
					return_url:""
				},
				images:{
					success:"data:image/png;base64,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"
				},
				// 默认颜色
				color:{
					wxpay:"#01be6e",
					alipay:"#108ee9"
				}
			}
		},
		// 监听 - 页面每次【加载时】执行(如：前进)
		onLoad(options = {}) {
			this.options = options;
		},
		// 监听 - 页面【首次渲染完成时】执行。注意如果渲染速度快，会在页面进入动画完成前触发
		onReady(){},
		// 监听 - 页面每次【显示时】执行(如：前进和返回) (页面每次出现在屏幕上都触发，包括从下级页面点返回露出当前页面)
		onShow() {},
		// 监听 - 页面每次【隐藏时】执行(如：返回)
		onHide() {},
		// 函数
		methods: {
			timeFormat: jsSdk.timeFormat,
			queryOrder(){
				let url = this.options.return_url + `?out_trade_no=${this.options.out_trade_no}&order_no=${this.options.order_no}`;
				if (url.indexOf("/") !== 0) url = `/${url}`;
				uni.navigateTo({
					url,
				});
			},
			onaderror(e) {
				console.log("ad-error", e);
			},
		},
		// 监听器
		watch:{
			"mainColorCom":{
				immediate:true,
				handler(newVal, oldVal){
					// 动态改变导航栏颜色
					setTimeout(function(){
						uni.setNavigationBarColor({
							frontColor: "#ffffff",
							backgroundColor: newVal
						});
					}, 0); 
				}
			}
		},
		// 计算属性
		computed:{
			mainColorCom(){
				let color = "";
				// #ifdef MP-ALIPAY
				color = this.options.main_color || this.color.alipay;
				// #endif
				// #ifndef MP-ALIPAY
				color = this.options.main_color || this.color.wxpay
				// #endif
				return color;
			},
			styleCom(){
				return `--main:${this.mainColorCom};`;
			}
		}
	}
</script>
<style lang="scss" scoped>
	.app{
		--bgcolor: #f3f3f3;
		
		background-color: var(--bgcolor);
		min-height: calc(100vh - var(--window-bottom) - var(--window-top));
	}
	.header{
		background-color: var(--main);
		text-align: center;
		color: #ffffff;
		padding: 80rpx 30rpx 50rpx 30rpx;
		.success-image{
			width: 120rpx;
			height: 120rpx;
		}
		.success-title{
			font-size: 34rpx;
			margin-top: 40rpx;
			font-weight: bold;
		}
		.hr{
			margin-top: 40rpx;
			width: 100%;
			height: 30rpx;
			border-radius: 20rpx;
			opacity: 0.1;
			background-color: #000000;
		}
	}
	.info-box{
		width: calc(100% - 100rpx);
		margin: 0 50rpx;
		position: relative;
		margin-top: -64rpx;
		background-color: #ffffff;
		.info-amount{
			height: 150rpx;
			line-height: 150rpx;
			text-align: center;
			color: var(--main);
			font-weight: bold;
			font-size: 60rpx;
			border-bottom: 4rpx dashed #f3f3f3;
		}
		.left-circle{
			background-color: var(--bgcolor);
			position: absolute;
			width: 40rpx;
			height: 40rpx;
			border-radius: 50%;
			top:calc(150rpx - 20rpx);
			left:-20rpx;
		}
		.right-circle{
			background-color: var(--bgcolor);
			position: absolute;
			width: 40rpx;
			height: 40rpx;
			border-radius: 50%;
			top:calc(150rpx - 20rpx);
			right:-20rpx;
		}
		.info-main{
			padding: 30rpx;
			font-size: 26rpx;
			color: #333333;
			.info-cell{
				/* #ifndef APP-NVUE */
				display: flex;
				/* #endif */
				line-height: 50rpx;
				.left{
					width: 200rpx;
					text-align: left;
				}
				.right{
					flex: 1;
					text-align: right;
				}
			}
		}
	}
	.uni-ad{
		margin-top: 50rpx;
		min-height: 100rpx;
		.ad-interactive{
			text-align: center;
		}
	}
	.button-query{
		background-color: var(--main);
		color: #ffffff;
		width: calc(100% - 120rpx);
		margin: 50rpx 60rpx 0 60rpx;
		padding: 20rpx 30rpx;
		border-radius: 50rpx;
		text-align: center;
		box-sizing: border-box;
	}
	.button-query:active{
		opacity: 0.7;
	}
	
	.footer-hr{
		height: 100rpx;
		display: block;
	}
	
</style>