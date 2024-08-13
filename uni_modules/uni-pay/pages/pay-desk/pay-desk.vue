<template>
	<!-- 自定义收银台页面模式 -->
	<view class="uni-pay">
		<view class="mobile-pay-popup" v-if="insideData && insideData.currentProviders">
			<view class="mobile-pay-popup-amount-box">
				<view>待支付金额：</view>
				<view class="mobile-pay-popup-amount">{{ (options.total_fee / 100).toFixed(2) }}</view>
			</view>
			<view class="mobile-pay-popup-provider-list">
				<uni-list>
					<!-- #ifdef MP-WEIXIN || H5 || APP -->
					<uni-list-item v-if="insideData.currentProviders.indexOf('wxpay') > -1" :thumb="insideData.images.wxpay" title="微信支付" @click="createOrder({ provider: 'wxpay' })" clickable link></uni-list-item>
					<!-- #endif -->
					<!-- #ifdef MP-ALIPAY || H5 || APP -->
					<uni-list-item v-if="insideData.currentProviders.indexOf('alipay') > -1" :thumb="insideData.images.alipay" title="支付宝" @click="createOrder({ provider: 'alipay' })" clickable link></uni-list-item>
					<!-- #endif -->
				</uni-list>
			</view>
		</view>
		<!-- 挂载支付组件 -->
		<uni-pay ref="uniPay" :to-success-page="false" @mounted="onMounted" @success="onSuccess"></uni-pay>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				options: {
					total_fee: "",
				},
				insideData: {}, // uni-pay组件mounted事件获得的数据
				adpid: "", // 广告id
				return_url: "", // 支付成功后点击查看订单跳转的订单详情页面地址
				main_color: "", // 支付成功页面的主色调
			}
		},
		// 监听 - 页面每次【加载时】执行(如：前进)
		onLoad(options = {}) {
			options = JSON.parse(decodeURI(options.options));
			//console.log('options: ', options)
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
			// 监听 - 支付组件加载完毕事件
			onMounted(insideData){
				this.insideData = insideData;
			},
			// 发起支付
			createOrder(provider){
				Object.assign(this.options, provider);
				this.$refs.uniPay.createOrder(this.options);
			},
			// 监听事件 - 支付成功
			onSuccess(res){
				console.log('success: ', res);
				if (res.user_order_success) {
					// 代表用户已付款，且你自己写的回调成功并正确执行了
					uni.redirectTo({
						url:`/uni_modules/uni-pay/pages/success/success?out_trade_no=${res.out_trade_no}&order_no=${res.pay_order.order_no}&pay_date=${res.pay_order.pay_date}&total_fee=${res.pay_order.total_fee}&adpid=${this.adpid}&return_url=${this.return_url}&main_color=${this.main_color}`
					});
				} else {
					// 代表用户已付款，但你自己写的回调执行成功（通常是因为你的回调代码有问题）
				
				}
			},
		},
		// 监听器
		watch:{
			
		},
		// 计算属性
		computed:{

		}
	}
</script>
<style lang="scss" scoped>
.mobile-pay-popup {
	min-height: calc(100vh - var(--window-bottom) - var(--window-top));
	background-color: #f3f3f3;
	border-radius: 30rpx 30rpx 0 0;
	overflow: hidden;

	.mobile-pay-popup-title {
		background-color: #ffffff;
		text-align: center;
		font-weight: bold;
		font-size: 40rpx;
		padding: 20rpx;
	}

	.mobile-pay-popup-amount-box {
		background-color: #ffffff;
		padding: 30rpx;

		.mobile-pay-popup-amount {
			color: #e43d33;
			font-size: 60rpx;
			margin-top: 20rpx;
		}
	}

	.mobile-pay-popup-provider-list {
		background-color: #ffffff;
		margin-top: 20rpx;
	}
}
</style>