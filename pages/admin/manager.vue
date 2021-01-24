<template>
	<view class="container">
		<mix-list-cell icon="icon-tuandui" iconColor="#54b4ef" title="用户管理" @eventClick="navToUsers('all','charge')" tips="账户充值"></mix-list-cell>
		<view class="cover-container">
			<view class="order-section">
				<view class="order-item" v-for="(item, index) in userTypes" :key="index" hover-class="common-hover" @click="navToUsers(item.state)"
				 :hover-stay-time="50">
					<text class="number">{{ item.number }}</text>
					<text>{{ item.name }}</text>
				</view>
			</view>
		</view>
		<mix-list-cell icon="icon-fenlei1" iconColor="#54b4ef" title="提现管理" @eventClick="navTo('/pages/admin/cashout/list')"
		 tips="审核提现申请"></mix-list-cell>
	</view>
</template>

<script>
	import {
		shopAdmin,
	} from '@/common/admin_request.js';
	export default {
		data() {
			return {
				userTypes: [],
			};
		},
		onLoad() {
			this.loadData();
		},
		methods: {
			loadData() {
				uni.setStorageSync("adminShopId", 123457)
				shopAdmin('manager', {}, true).then(res => {
					console.log(res)
					for (let i in res) {
						this[i] = res[i];
					}
				})
			},
			navToUsers(state, type) {
				this.navTo(`/pages/admin/user/list?state=${state}&type=${type}`);
			},
		}
	}
</script>

<style lang="scss">
	%flex-center {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	%section {
		display: flex;
		justify-content: space-around;
		align-content: center;
		background: #fff;
		border-radius: 10upx;
	}

	.order-section {
		@extend %section;
		padding: 16upx 0;
		flex-wrap: wrap;
		justify-content: flex-start;

		// margin-top: 20upx;
		.order-item {
			@extend %flex-center;
			width: 20%;
			height: 120upx;
			border-radius: 10upx;
			font-size: $font-sm;
			color: $font-color-dark;

			.yticon {
				position: relative;
			}

			.sub {
				position: absolute;
				top: -20upx;
				right: -18upx;
				font-size: $font-ssm;
				color: #fff;
				background: #fa436a;
				border-radius: 50%;
				width: 36upx;
				height: 36upx;
				text-align: center;
				line-height: 36upx;
			}
		}

		.yticon {
			font-size: 48upx;
			color: #fa436a;
		}

		.icon-shouhoutuikuan {
			font-size: 44upx;
		}

		.number {
			font-size: $font-llg;
			font-weight: 500;
			color: $font-color-warning;
		}
	}

	.cover-container {
		margin-top: 0upx;
		position: relative;
		background: #f5f5f5;
		padding-bottom: 20upx;

		.arc {
			position: absolute;
			left: 0;
			top: -34upx;
			width: 100%;
			height: 36upx;
		}
	}

	.m-t {
		margin-top: 20upx;
	}
</style>
