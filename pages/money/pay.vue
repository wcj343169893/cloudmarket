<template>
	<view class="app">
		<view class="price-box">
			<text>支付金额</text>
			<text class="price">{{ orderInfo.totalMoney }}</text>
			<text class="lastTime">支付剩余时间:{{ times.minute }}:{{ times.second }}</text>
		</view>

		<view class="pay-type-list">
			<radio-group @change="changePayType">
				<block v-for="(item, index) in payment" :key="index">
					<label class="radio type-item b-b">
						<text class="icon yticon" :class="item.icon"></text>
						<view class="con">
							<text class="tit">{{ item.name }}</text>
							<text>{{ item.desc }}</text>
							<text v-if="!item.usable">{{ item.usableText }}</text>
						</view>
						<radio :value="item.value" :disabled="!item.usable" color="#54b85d" :checked="index == 0" />
					</label>
				</block>
			</radio-group>
		</view>
		<text class="mix-btn" @click="confirmPay">确认支付</text>
	</view>
</template>

<script>
import { payInfo, orders, balancePay, payment } from '@/common/request.js';
import { miaoshaCountDown, clearCountDownTimer } from '@/common/functions.js';
export default {
	data() {
		return {
			id: 0,
			comefrom: '',
			payType: '',
			openid: '',
			payment: [],
			times: {
				minute: '05',
				second: '00'
			},
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
			this.comefrom = options.comefrom;
		} else {
			this.$api.msg('支付订单号不存在');
			this.goBack();
			return;
		}
		this.loadData();
	},
	onUnload() {
		console.log('pay onUnload');
		//关闭秒杀定时器
		this.clouseTimer();
	},
	methods: {
		async loadData() {
			let paymentKey = 'paymentKey';
			//优先从缓存加载支付方式
			let data = uni.getStorageSync(paymentKey);
			if (data) {
				this.payment = data;
				this.payType = data[0].value;
			}
			//#ifdef MP
			//微信小程序需要openid，读取用户信息中的openid
			uni.getStorage({
				key:"userOpenId",
				success:(info) =>{
					this.openid = info.data;
					console.log("openid ",info)
				}
			});
			//#endif
			payInfo({
				id: this.id
			}).then(
				res => {
					this.orderInfo = res.order;
					this.payment = res.payment;
					if (res.payment.length > 0) {
						//默认第一条
						this.payType = res.payment[0].value;
					}
					//写入缓存
					uni.setStorage({
						key: paymentKey,
						data: res.payment
					});
					//订单详情
					uni.setStorage({
						key: 'orderDetail',
						data: this.orderInfo
					});
					//如果订单金额为0，则直接默认余额支付，并支付完成
					if (this.orderInfo.totalMoney < 0.001) {
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
					}
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
						if (this.comefrom == 'order') {
							//默认切换到第一个选项卡，保证返回后一定有数据
							this.$api.prePage().tabClick(0);
						}
						orders({
							id: this.orderInfo._id,
							type: 'cancel',
							style: 'auto'
						}).then(
							res => {
								this.$api.msg('支付超时，订单已取消');
								this.goBack();
								//刷新上一页数据
								this.$api.prePage().refreshList();
							},
							err => {
								this.$api.msg('支付超时，订单已取消');
								this.goBack();
							}
						);
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
			console.log(event.detail.value);
		},
		//确认支付
		confirmPay() {
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
			payment({
				openid: this.openid,
				provider: this.payType,
				id: this.id
			}).then(
				res => {
					console.log(res);
					uni.requestPayment({
						// #ifdef APP-PLUS
						provider: this.payType, // App端此参数必填，可以通过uni.getProvider获取
						// #endif

						// #ifdef MP-WEIXIN
						...res,
						// #endif

						// #ifdef APP-PLUS || MP-ALIPAY
						orderInfo: res,
						// #endif

						//微信、支付宝订单数据
						success: res => {
							this.paySuccess();
						},
						fail: res => {
							this.payFailed();
						}
					});
				},
				err => {
					console.log(err);
				}
			);
			//https://uniapp.dcloud.io/api/plugins/payment?id=orderinfo
			/* uni.redirectTo({
				url: '/pages/money/paySuccess'
			}); */
		},
		//支付成功
		paySuccess() {
			this.clouseTimer();
			//刷新上一页数据
			this.$api.prePage().refreshList();
			//直接跳转支付成功页面
			let comefrom = this.comefrom;
			let id = this.id;
			uni.redirectTo({
				url: `/pages/money/paySuccess?id=${id}&comefrom=${comefrom}`
			});
		},
		//支付失败，可以另外选择支付方式
		payFailed() {
			uni.showModal({
				title: '温馨提示',
				content: '支付失败！',
				showCancel: false,
				success: function(res) {
					/* uni.navigateBack({
						delta: 1
					}); */
				}
			});
		},
		clouseTimer() {
			//关闭秒杀定时器
			clearCountDownTimer(this.id);
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
