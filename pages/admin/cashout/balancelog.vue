<template>
	<view class="container">
		<empty v-if="loaded === true && balanceList.length === 0"></empty>
		<view v-for="(item, index) in balanceList" :key="index" class="items b-b">
			<view class="content">
				<view class="">
					<text class="">{{item.description}}</text>
					<text v-if="item.cashout" class="text-sm margin-left-xs text-gray">{{item.cashout.message}}</text>
				</view>
				<view class="desc">
					<text>{{item.created | dateFormat('MM-dd hh:mm') }}</text>
				</view>
			</view>
			<view class="money">
				<view class="type">
					<text v-if="item.type == 1" class="important">+{{item.money | toFixed}}</text>
					<text v-else>-{{item.money | toFixed}}</text>
				</view>
				<view class="refund" v-if="item.refund">
					<text v-if="item.refund < item.money">退款 {{item.refund | toFixed}}</text>
					<text v-else>已全额退款</text>
				</view>
				<view class="balance">
					<text>余额 {{item.balance | toFixed}}</text>
				</view>
			</view>
		</view>
		<uni-load-more :status="loadingType"></uni-load-more>
	</view>
</template>

<script>
	import {
		cashoutAdmin,
	} from '@/common/admin_request.js';
	import {
		cashoutState,
	} from '@/common/functions.js';
	export default {
		data() {
			return {
				fuid: "",
				balanceList: [],
				limit: 20
			};
		},
		onLoad(e) {
			this.fuid = e.id;
			this.loadData();
		},
		//滑到底部加载更多
		onReachBottom() {
			if (this.loadingType != 'noMore') {
				this.loadData();
			}
		},
		methods: {
			async loadData() {
				this.page++;
				cashoutAdmin("balancelog", {
					page: this.page,
					limit: this.limit,
					fuid: this.fuid
				}, false).then(res => {
					if (this.page == 1) {
						this.balanceList = []
					}
					res.forEach(item => {
						if (item.cashout) {
							cashoutState(item.cashout);
						}
					})
					this.balanceList = this.balanceList.concat(res)
					if (res.length < this.limit) {
						this.loadingType = 'noMore'
					}
					this.loaded = true;
				}, err => {
					this.loadingType = 'noMore'
				})
			}
		}
	}
</script>

<style lang="scss">
	page,
	.container {
		background: $background-color;
		font-size: $font-base;
	}

	.items {
		background: #FFFFFF;
		padding: 20rpx 0 20rpx 0rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: relative;

		&::after {
			left: 20rpx;
		}
	}

	.content {
		flex: 1;
		padding: 20rpx $page-row-spacing;
		font-size: $font-sm;

		.desc {
			margin-top: 12rpx;
			color: $font-color-base;
		}
	}

	.money {
		width: 260rpx;
		text-align: right;
		padding-right: $page-row-spacing;

		.type {
			font-weight: 500;
			font-size: $font-lg;
		}

		.refund {
			font-size: $font-sm;
			color: $font-color-warning;
		}

		.balance {
			font-size: $font-sm;
			margin-top: 8rpx;
			color: $font-color-base;
		}

		.important {
			color: $font-color-emphasis;
		}
	}
</style>
