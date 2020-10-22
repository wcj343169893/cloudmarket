<template>
	<view class="container">
		<view class="rating-wrap">
			<commentPage :commentTagStatics="commentTagStatics" :comment="comment" :isShowMoreTag="!0"></commentPage>
		</view>
		<uni-load-more :status="loadingType"></uni-load-more>
	</view>
</template>

<script>
	import commentPage from './components/comment.vue'; //评论列表
	import {
		cloudMall
	} from '@/common/request.js';
	export default {
		components: {
			commentPage
		},
		data() {
			return {
				key: "goodsInfo",
				commentTagStatics: [],
				id: 0,
				comment: [],
			};
		},
		onLoad() {
			this.loadData()
		},
		//滑到底部加载更多
		onReachBottom() {
			if (this.loadingType != 'noMore') {
				this.getComments();
			}
		},
		methods: {
			async loadData() {
				let goods = uni.getStorageSync(this.key);
				this.commentTagStatics = goods.commentTagStatics;
				this.id = goods._id;
				this.getComments();
			},
			getComments() {
				this.page++;
				this.loadingType = "more";
				cloudMall("product", "comment", {
					page: this.page,
					limit: this.limit,
					goodsid: this.id,
					shopid: this.shopId
				}).then(res => {
					this.comment = this.comment.concat(res);
					if (res.length < this.limit) {
						this.loadingType = "noMore";
					}
				},err=>{
					console.log("没有评论");
					this.loadingType = "noMore";
				})
			}
		}
	}
</script>

<style lang="scss">
	page,
	.container {
		background: $page-color-base;
	}

	/* 评价 */
	.rating-wrap {
		padding: 20rpx 30rpx 10rpx;
		background: #fff;

		&.no-data {
			padding: 10rpx 30rpx 10rpx;
		}

		.e-header {
			display: flex;
			align-items: center;
			height: 70rpx;
			font-size: 28rpx;
			color: #333;
		}

		.number {
			font-size: $font-sm;
			color: $font-color-light;
			margin-left: 8rpx;
		}

		.tit {
			font-size: 32rpx;
			color: #333;
			font-weight: 700;
			margin-right: 4rpx;
		}

		.tip {
			flex: 1;
			font-size: 26rpx;
			color: #999;
			text-align: right;
		}

		.icon-you {
			margin-left: 8rpx;
			font-size: 24rpx;
			color: #999;
		}

		.mix-rating-item::after {
			border: 0;
		}
	}
</style>
