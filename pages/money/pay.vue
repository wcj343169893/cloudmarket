<template>
	<view class="app">
		<view class="price-box">
			<text>支付金额</text>
			<text class="price">{{orderInfo.totalMoney}}</text>
		</view>

		<view class="pay-type-list">
			<radio-group @change="changePayType">
				<block v-for="(item, index) in payment" :key="index">
					<view class="type-item b-b">
						<text class="icon yticon" :class="item.icon"></text>
						<view class="con">
							<text class="tit">{{ item.name }}</text>
							<text>{{ item.desc }}</text>
						</view>
						<label class="radio"><radio :value="item.value" :disabled="!item.usable" color="#54b85d" :checked="index == 0" /></label>
					</view>
				</block>
			</radio-group>
		</view>
		<text class="mix-btn" @click="confirm">确认支付</text>
	</view>
</template>

<script>
import { payInfo } from '@/common/request.js';
export default {
	data() {
		return {
			id: 0,
			payType: '',
			payment: [],
			orderInfo: {
				totalMoney:0
			}
		};
	},
	computed: {},
	onLoad(options) {
		if (options.id) {
			this.id = options.id;
			this.orderInfo.totalMoney = options.money;
		}
		this.loadData();
	},

	methods: {
		loadData() {
			payInfo({
				id: this.id
			}).then(res => {
				this.orderInfo = res.order;
				this.payment = res.payment;
			});
		},
		//选择支付方式
		changePayType(event) {
			this.payType = event.detail.value;
		},
		//确认支付
		confirm: async function() {
			if(this.payType == "balance"){
				//余额支付，单独调用接口
				uni.showModal({
					title: '温馨提示',
					content: '支付失败！'
				});
				return;
			}
			//刷新上一页数据
			this.$api.prePage().refreshList();
			//https://uniapp.dcloud.io/api/plugins/payment?id=orderinfo
			/* uni.redirectTo({
				url: '/pages/money/paySuccess'
			}); */
			uni.requestPayment({
				provider: this.payType,
				orderInfo: this.id,
				//微信、支付宝订单数据
				success: function(res) {
					uni.showModal({
						title: '温馨提示',
						content: '支付成功！',
						success: function(res) {
							if (res.confirm) {
								uni.navigateBack({
									delta: 1
								});
							} else {
								uni.navigateBack({
									delta: 1
								});
							}
						}
					});
				},
				fail: function(err) {
					uni.showModal({
						title: '温馨提示',
						content: '支付失败！',
						success: function(res) {
							console.log(res.data)
						}
					});
				}
			});
		}
	}
};
</script>

<style lang="scss">
.app {
	width: 100%;
}

.price-box {
	background-color: #fff;
	height: 265upx;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	font-size: 28upx;
	color: #909399;

	.price {
		font-size: 50upx;
		margin-top: 12upx;
	}
}

.pay-type-list {
	margin-top: 20upx;
	background-color: #fff;
	padding-left: 60upx;

	.type-item {
		height: 120upx;
		padding: 20upx 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-right: 60upx;
		font-size: 30upx;
		position: relative;
	}

	.icon {
		width: 100upx;
		font-size: 52upx;
	}
	.icon-erjiye-yucunkuan {
		color: #fe8e2e;
	}
	.icon-weixinzhifu {
		color: #36cb59;
	}
	.icon-alipay {
		color: #01aaef;
	}
	.tit {
		font-size: $font-lg;
		color: $font-color-dark;
		margin-bottom: 4upx;
	}
	.con {
		flex: 1;
		display: flex;
		flex-direction: column;
		font-size: $font-sm;
		color: $font-color-light;
	}
}
.mix-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 630upx;
	height: 80upx;
	margin: 80upx auto 30upx;
	font-size: $font-lg;
	color: #fff;
	background-color: $base-color;
	border-radius: 10upx;
}
</style>
