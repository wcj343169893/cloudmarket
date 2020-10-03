<template>
	<view class="container">
		<empty v-if="loaded === true && refundList.length === 0"></empty>
		<view v-for="(item, index) in refundList" :key="index" class="items" :class="[item.state]">
			<view class="header b-b">
				<text>退款单号:{{ item.id }}</text>
				<text>申请时间:{{ item.created | dateFormat('yyyy-MM-dd hh:mm:ss') }}</text>
			</view>
			<view class="content b-b">
				<view class="content-text">
					<view class="line state">
						<text>{{ item.stateTip }}</text>
						<text class="desc m-l">{{ item.stateContent }}</text>
					</view>
					<view class="line money">
						<text>金额:</text>
						<text class="price">{{ (item.fee / 100) | toFixed }}</text>
					</view>
					<view class="line money">
						<text>数量:</text>
						<text>{{ item.refundApplyAmount }}</text>
					</view>
					<view class="line">
						<text>类型:</text>
						<text>{{ item.refundType }}</text>
					</view>
					<view class="line">
						<text>原因:</text>
						<text>{{ item.refundReason }}</text>
					</view>
					<view class="desc">
						<text>{{ item.refundContent }}</text>
					</view>
					<view class="desc">
						<view class="imgs" v-if="item.refundImgs && item.refundImgs.length > 0">
							<view v-for="(img, index2) in item.refundImgs" :key="index2" @click="preview(item.refundImgs, index2)">
								<image :src="img" mode="aspectFill"></image>
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="goods-box-single">
				<image class="goods-img" :src="item.goods.src" mode="aspectFill"></image>
				<view class="right">
					<view class="">
						<text class="title">{{ item.goods.title }}</text>
					</view>
					<view class="attr-box">
						<text>申请数量:</text>
						<text>{{ item.refundApplyAmount }}</text>
						<text class="m-l">已退数量:</text>
						<text>{{ item.goods.refundAmount * 1 }}</text>
						<text class="m-l">购买数量:</text>
						<text>{{ item.goods.amount }}</text>
					</view>
				</view>
			</view>
		</view>
		<uni-load-more :status="loadingType"></uni-load-more>
	</view>
</template>

<script>
import { orderAdmin } from '@/common/admin_request.js';
export default {
	data() {
		return {
			shopid: 0,
			refundList: []
		};
	},
	onLoad(options) {
		this.shopid = options.shopid;
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
			this.loadingType = 'loading';
			this.page++;
			orderAdmin('getRefunded', {
				state: 'all',
				key: this.searchWord,
				page: this.page,
				limit: this.limit
			})
				.then(
					res => {
						this.buildData(res);
						if (this.page == 1) {
							this.refundList = res;
						} else {
							this.refundList = this.refundList.concat(res);
						}
						if (res.length < this.limit) {
							this.loadingType = 'noMore';
						}
					},
					err => {
						this.loadingType = 'noMore';
					}
				)
				.finally(() => {
					this.loaded = true;
				});
		},
		buildData(data) {
			data.forEach(item => {
				this.buildDataItem(item);
			});
		},
		buildDataItem(item) {
			let payname = '';
			let tips = {
				failed: '退款失败',
				verifying: '退款中',
				successed: '退款成功'
			};
			let contents = {
				failed: '拒绝退款',
				verifying: '请仔细核对金额、数量、商品'
			};
			item.stateTip = tips[item.state];
			if (item.state != 'successed') {
				item.stateContent = contents[item.state];
			} else {
				payname = item.payInfo.typeName || item.payInfo.name;
				if (item.payInfo.type == 'delivery') {
					//货到付款
					item.stateContent = '请不要准备此商品';
				} else {
					item.stateContent = `退款将退回至对方的${payname}账户`;
				}
			}
		},
		//拒绝
		refuse(item) {
			orderAdmin('refuseRefund', {
				id: item._id
			}).then(res => {
				//verifying审核中，successed成功,failed失败
				item.state = 'failed';
				this.buildDataItem(item);
				this.$api.success('操作成功');
			});
		},
		//通过
		passed(item) {
			orderAdmin('passedRefund', {
				id: item._id
			}).then(res => {
				item.state = 'successed';
				this.buildDataItem(item);
				this.$api.success('操作成功');
			});
		},
		preview(urls, index) {
			uni.previewImage({
				urls: urls,
				current: index
			});
		}
	}
};
</script>

<style lang="scss">
page,
.container {
	background: $background-color;
	font-size: $font-base;
}

.items {
	background: #ffffff;
	margin-top: 20rpx;
	padding: 20rpx 0 0 0rpx;
}

.goods-box-single {
	display: flex;
	padding: 20upx $page-row-spacing;
	position: relative;

	.goods-img {
		display: block;
		width: 100upx;
		height: 100upx;
		border-radius: 4%;
	}

	.right {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 0 30upx 0 24upx;
		overflow: hidden;

		.title {
			font-size: $font-base;
			color: $font-color-dark;
			line-height: 1;
		}

		.attr-box {
			font-size: $font-sm;
			color: $font-color-light;
			padding: 8upx 0upx 0;
		}
	}
}

.header {
	padding: 20rpx $page-row-spacing;
	position: relative;
	font-size: $font-sm;
	display: flex;
	justify-content: space-between;
}

.content {
	display: flex;
	align-items: center;
	position: relative;
	padding: 20rpx $page-row-spacing;

	.content-text {
		flex: 1;

		.line {
			margin-bottom: 12rpx;
		}
	}

	.money {
		font-size: $font-lg;

		.price {
			font-size: $font-lg;
		}
	}

	.desc {
		font-size: $font-sm;
		color: $font-color-base;
	}

	.yticon {
		color: $font-color-light;
	}
}

.action-box {
	display: flex;
	justify-content: flex-end;
	align-items: center;
	height: 100upx;
	position: relative;
	padding-right: 30upx;
}

.action-btn {
	height: 60upx;
	margin: 0;
	padding: 0 30upx;
	margin-left: 24upx;
	text-align: center;
	line-height: 60upx;
	font-size: $font-sm + 2upx;
	color: $font-color-dark;
	background: #fff;
	border-radius: 100px;

	.time {
		width: 72upx;
		display: inline-block;
	}

	&:after {
		border-radius: 100px;
	}

	&.recom {
		background: $base-color;
		color: #fff;
	}

	&.warning {
		background: $btn-color-warning;
		color: #fff;
	}
}

.imgs {
	display: flex;
	flex-wrap: wrap;
	margin-top: 12rpx;

	image {
		width: 200rpx;
		height: 200rpx;
		margin-right: 16rpx;
		border-radius: 12rpx;
	}
}

.m-l {
	margin-left: 16rpx;
}
</style>
