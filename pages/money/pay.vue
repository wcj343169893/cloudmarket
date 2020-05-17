<template>
	<view class="app">
		<view class="price-box">
			<text>支付金额</text>
			<text class="price">{{ orderInfo.totalMoney }}</text>
			<text class="lastTime" v-if="this.times.startTime > 0">支付剩余时间:{{ times.minute }}:{{ times.second }}</text>
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
		<text class="mix-btn" @click="confirmPay">确认支付</text>
	</view>
</template>

<script>
import { payInfo, orders, balancePay } from '@/common/request.js';
import { miaoshaCountDown, clearCountDownTimer } from '@/common/functions.js';
export default {
	data() {
		return {
			id: 0,
			payType: '',
			payment: [],
			times: {},
			orderInfo: {
				totalMoney: 0
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
	onUnload() {
		console.log('pay onUnload');
		//关闭秒杀定时器
		this.clouseTimer();
	},
	methods: {
		loadData() {
			payInfo({
				id: this.id
			}).then(
				res => {
					this.orderInfo = res.order;
					this.payment = res.payment;
					let time = new Date().getTime();
					this.times = {
						id: this.id,
						startTime: time,
						minute: '00',
						second: '00'
					};
					miaoshaCountDown(this.times, this.orderInfo.lastPayTime, () => {
						console.log('自动取消订单');
						//this.cancelOrder(ele, index, 'auto');
						orders({
							id: this.orderInfo._id,
							type: 'cancel',
							style: 'auto'
						}).then(res => {
							this.$api.msg('支付超时，订单已取消');
							this.goBack();
						});
					});
				},
				err => {
					this.$api.msg(err.message);
					this.goBack();
				}
			);
		},
		goBack() {
			setTimeout(() => {
				uni.navigateBack();
			}, 1500);
		},
		//选择支付方式
		changePayType(event) {
			this.payType = event.detail.value;
		},
		//确认支付
		confirmPay: async function() {
			if (this.payType == 'balance') {
				//余额支付，单独调用接口
				balancePay({
					id: this.id
				}).then(
					res => {
						this.paySuccess();
					},
					err => {
						this.payFailed();
					}
				);
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
					this.paySuccess();
				},
				fail: function(err) {
					this.payFailed();
				}
			});
		},
		paySuccess() {
			this.clouseTimer();
			uni.showModal({
				title: '温馨提示',
				content: '支付成功！',
				showCancel:false,
				success: function(res) {
					uni.navigateBack({
						delta: 1
					});
				}
			});
		},
		payFailed() {
			this.clouseTimer();
			uni.showModal({
				title: '温馨提示',
				content: '支付失败！',
				showCancel:false,
				success: function(res) {
					uni.navigateBack({
						delta: 1
					});
				}
			});
		},clouseTimer(){
			//关闭秒杀定时器
			clearCountDownTimer();
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
.lastTime {
	color: $font-color-warning;
}
</style>
