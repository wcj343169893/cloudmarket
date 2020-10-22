<template>
	<view class="container">
		<view class="result">
			<text class="tex">{{number}}</text>
			<button type="default" @click="del()">删除</button>
		</view>
		<view class="keyboard">
			<view class="kb">
				<button type="default" @click="keyinput(1)">1</button>
				<button type="default" @click="keyinput(2)">2</button>
				<button type="default" @click="keyinput(3)">3</button>
			</view>
			<view class="kb">
				<button type="default" @click="keyinput(4)">4</button>
				<button type="default" @click="keyinput(5)">5</button>
				<button type="default" @click="keyinput(6)">6</button>
			</view>
			<view class="kb">
				<button type="default" @click="keyinput(7)">7</button>
				<button type="default" @click="keyinput(8)">8</button>
				<button type="default" @click="keyinput(9)">9</button>
			</view>
			<view class="kb">
				<button type="default" @click="keyinput('0')">0</button>
				<button type="primary" class="submit" @click="submit">验证</button>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		orderAdmin
	} from '@/common/admin_request.js';
	export default {
		data() {
			return {
				numbers: [],
				maxLength: 10
			}
		},
		computed: {
			number() {
				if (this.numbers.length == 0) {
					return "请输入提货码";
				}
				return this.numbers.join("");
			}
		},
		methods: {
			keyinput(number) {
				if (this.numbers.length >= this.maxLength) {
					return;
				}
				this.numbers.push(number)
			},
			del() {
				if (this.numbers.length > 0) {
					this.numbers.splice(this.numbers.length - 1, 1)
				}
			},
			submit() {
				if (this.isSubmit) {
					return;
				}
				this.isSubmit = true;
				orderAdmin("detail", {
					number: this.number
				}, true).then(res => {
					uni.setStorage({
						key:"orderDetail",
						data:res,
						success() {
							uni.redirectTo({
								url: `/pages/admin/order/detail?id=${res.id}`
							});
						}
					})
				}, err => {
					this.$api.msg("订单不存在")
					this.isSubmit = false;
				});
			}
		}
	}
</script>

<style lang="scss">
	.result {
		display: flex;
		align-items: center;
		padding: 30rpx;

		.tex {
			flex: 1;
			background-color: $background-color;
			padding: 0 36rpx;
			border-radius: 6rpx;
			margin-right: 20rpx;
			letter-spacing: 10rpx;
			line-height: 72rpx;
			height: 72rpx;
			font-size: 32rpx;
			text-align: center;
		}
	}

	$size : 160rpx;

	.keyboard {
		margin-top: 60rpx;

		.kb {
			display: flex;
			align-items: center;
			margin: 60rpx 0 100rpx;
			justify-content: space-between;

			button {
				width: $size;
				height: $size;
				line-height: $size;
				border-radius: $size;
				border: 0;

				&::after {
					border-radius: $size;
				}
			}

			$size:130rpx;

			.submit {
				width: 400rpx;
				height: $size;
				line-height: $size;
				background-color: $base-color;
			}
		}
	}
</style>
