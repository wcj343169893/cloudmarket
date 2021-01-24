<template>
	<view class="container">
		<view class="text-center padding flex flex-column align-center">
			<text class="price">{{userInfo.balance}}</text>
			<text class="text-sm text-gray">可提现金额</text>
		</view>
		<mix-list-input title="提现金额" type="digit" v-model="money" placeholder="请输入提现金额"></mix-list-input>
		<view class="padding text-sm text-gray">
			<text>预计7个工作日内到账</text>
		</view>
		<button class="cu-btn bg-green fixed-add-btn" @click="submit">提交申请</button>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex';
	import {
		cloudUser
	} from '@/common/request.js';
	export default {
		data() {
			return {
				money: 0
			};
		},
		onLoad() {
			this.$store.dispatch('getUserInfo');
		},
		computed: {
			...mapState(['userInfo'])
		},
		methods: {
			submit() {
				if (this.money > this.userInfo.balance) {
					/* this.$api.msg("余额不足")
					return; */
					this.money = this.userInfo.balance;
				}
				if (!this.userInfo.wx_openid && !this.userInfo.ali_openid) {
					this.$api.msg("请绑定微信或者支付宝")
					return;
				}
				console.log(this.money)
				cloudUser("info", "cashout", {
					money: this.money
				}, true).then(res => {
					this.$api.success("申请成功");
					this.getOpenerEventChannel().emit('refreshData');
					this.$store.dispatch('getUserInfo');
					this.navTimeBack();
				}, err => {
					this.$api.msg("申请失败")
				});
			}
		}
	}
</script>

<style lang="scss">
	page {
		background: #FFFFFF;
	}

	.price {
		font-size: 100rpx;
	}

	.price:before {
		font-size: 0.5em;
	}
</style>
