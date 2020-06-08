<template>
	<view class="container">
		<empty v-if="loaded === true && goodsList.length === 0"></empty>
		<view class="order-item" v-for="(item, goodsIndex) in goodsList" :key="goodsIndex">
			<view class="goods-box-single" @click="navToGoodsDetail(item)">
				<image class="goods-img" :src="item.src" mode="aspectFill"></image>
				<view class="right">
					<view class="">
						<text class="title clamp">{{ item.title }}</text>
					</view>
					<view class="attr-box">
						<text>单价:</text>
						<text class="price">{{ item.price }}</text>
						<block v-if="item.originPrice > 0">
							<text class="price del">{{ item.originPrice }}</text>
						</block>
						<text>库存:</text>
						<text class="m-r">{{ item.stock }}</text>
					</view>
					<view class="attr-box">
						<text>月售:</text>
						<text class="m-r">{{ item.monthlySale }}</text>
						<text>浏览:</text>
						<text>{{ item.visite }}</text>
					</view>
					<view class="attr-box" v-if="item.skuname && item.skuname.length > 0">
						<text>规格:</text>
						<text class="skunames" v-for="(sk, i) in item.skuname" :key="i">{{ sk }}</text>
					</view>
					<view class="attr-box miaosha" v-if="item.miaosha" :class="[item.miaosha.state]">
						<text>秒杀:</text>
						<text>{{ item.miaosha.beginTime | dateFormat('MM-dd hh:mm:ss')  }}</text>
						<text class="m-lr">至</text>
						<text>{{ item.miaosha.endTime | dateFormat('MM-dd hh:mm:ss')  }}</text>
					</view>
					<view class="attr-box yuding" v-if="item.yuding" :class="[item.yuding.state]">
						<text>预售:</text>
						<view class="steps">
							<view class="">
								<text>定金:</text>
								<text class="price">{{ item.yuding.price }}</text>
							</view>
							<view class="step1">
								<text>付定金:</text>
								<text>{{ item.yuding.beginTime | dateFormat('MM-dd hh:mm:ss') }}</text>
								<text class="m-lr">至</text>
								<text>{{ item.yuding.endTime | dateFormat('MM-dd hh:mm:ss')  }}</text>
							</view>
							<view class="step1">
								<text>交尾款:</text>
								<text>{{ item.yuding.finalPaymentBeginTime | dateFormat('MM-dd hh:mm:ss')  }}</text>
								<text class="m-lr">至</text>
								<text>{{ item.yuding.finalPaymentEndTime | dateFormat('MM-dd hh:mm:ss')  }}</text>
							</view>
						</view>
					</view>
					<view class="attr-box manjian" v-if="item.manjian">
						<text>满减:</text>
						<text>{{ item.manjian.name }}</text>
					</view>
				</view>
			</view>
			<view class="action-box b-t">
				<block v-if="item.miaosha"><button class="action-btn" @click.stop="stopMiaosha(item)">秒杀</button></block>
				<block v-else-if="item.yuding"><button class="action-btn" @click.stop="yudingInfo(item)">预定</button></block>
				<block v-if="item.manjian"><button class="action-btn" @click.stop="manjianInfo(item)">满减</button></block>
				<block v-if="item.skuname"><button class="action-btn" @click.stop="skuInfo(item)">规格</button></block>
				<button class="action-btn" @click.stop="preview(item)">预览</button>
				<button class="action-btn" @click.stop="addDelivery(item)">编辑</button>
			</view>
		</view>
		<uni-load-more :status="loadingType"></uni-load-more>
	</view>
</template>

<script>
import { getGoodsList, goodsAdmin } from '@/common/admin_request.js';
import {  navToGoodsItemPage,getGoodsTypes } from '@/common/functions.js';
export default {
	data() {
		return {
			shopid: 0,
			state: '',
			page: 0,
			limit: 20,
			loaded: false,
			loadingType: 'more',
			goodsList: []
		};
	},
	onLoad(options) {
		this.shopid = options.shopid;
		this.state = options.state;
		this.loadData();
		//设置标题
		this.setNavTitle();
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
			getGoodsList({
				shopid: this.shopid,
				state: this.state,
				page: this.page,
				limit: this.limit
			}).then(
				res => {
					let time = new Date().getTime();
					//处理秒杀开始，结束时间
					res.data.forEach(item => {
						if (item.miaosha) {
							item.miaosha.state = 'notstart';
							if (item.miaosha.endTime < time) {
								item.miaosha.state = 'ended';
							} else if (item.miaosha.beginTime < time) {
								item.miaosha.state = 'started';
							}
						}
						if (item.yuding) {
							item.yuding.state = 'notstart';
							if (item.yuding.finalPaymentEndTime < time) {
								item.yuding.state = 'ended';
							} else if (item.yuding.beginTime < time) {
								item.yuding.state = 'started';
							}
						}
					});
					this.goodsList = this.goodsList.concat(res.data);
					if (res.data.length < this.limit) {
						//没有数据了
						//loaded新字段用于表示数据加载完毕，如果为空可以显示空白页
						this.loaded = true;
						//判断是否还有数据， 有改为 more， 没有改为noMore
						this.loadingType = 'noMore';
					}
				},
				err => {
					this.loaded = true;
					this.loadingType = 'noMore';
				}
			);
		},
		//预览商品效果,打开前端显示页面
		preview(item) {
			navToGoodsItemPage(item);
		},
		setNavTitle() {
			let types = getGoodsTypes();
			uni.setNavigationBarTitle({
				title: types[this.state]
			});
		}
	}
};
</script>

<style lang="scss">
page,
.content {
	background: $page-color-base;
	height: 100%;
}
.order-item {
	display: flex;
	flex-direction: column;
	padding-left: 30upx;
	background: #fff;
	margin-top: 16upx;
	/* 单条商品 */
	.goods-box-single {
		display: flex;
		padding: 20upx 0;
		.goods-img {
			display: block;
			width: 120upx;
			height: 120upx;
			border-radius: 4%;
		}
		.right {
			flex: 1;
			display: flex;
			flex-direction: column;
			padding: 0 30upx 0 24upx;
			overflow: hidden;
			.title {
				font-size: $font-base + 2upx;
				color: $font-color-dark;
				line-height: 1;
			}
			.attr-box {
				font-size: $font-sm + 2upx;
				color: $font-color-light;
				padding: 8upx 0upx 0;
				&.notstart {
					color: $base-color;
				}
				&.started {
					color: $font-color-warning;
					.price {
						color: $font-color-warning;
					}
				}
				&.ended {
					text-decoration: line-through;
				}
			}
		}
	}

	.price-box {
		display: flex;
		justify-content: flex-end;
		align-items: baseline;
		padding: 20upx 30upx;
		font-size: $font-sm + 2upx;
		color: $font-color-light;
		.num {
			margin: 0 8upx;
			color: $font-color-dark;
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
	}
	.skunames {
		margin-right: 14upx;
	}
	.m-r {
		margin-right: 8upx;
	}
	.m-lr {
		margin: 0 8upx 0;
	}
}
.yuding {
	display: flex;
	.steps {
		flex: 1;
	}
}
</style>
