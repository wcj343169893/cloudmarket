<template>
	<view class="container">
		<empty v-if="loaded === true && goodsList.length === 0"></empty>
		<view class="order-item" v-for="(item, goodsIndex) in goodsList" :key="goodsIndex">
			<view class="goods-box-single" @click="preview(item)">
				<image class="goods-img" :src="item.src" mode="aspectFill"></image>
				<view class="right">
					<view class="">
						<text class="title clamp">{{ item.title }}</text>
					</view>
					<view class="sub-title" v-if="item.subTitle && item.subTitle != ''">
						<text>{{ item.subTitle }}</text>
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
						<text>{{ item.miaosha.beginTime | dateFormat('MM-dd hh:mm') }}</text>
						<text class="m-lr">至</text>
						<text>{{ item.miaosha.endTime | dateFormat('MM-dd hh:mm') }}</text>
					</view>
					<view class="attr-box miaosha ended" v-if="item.miaoshaBackUp">
						<text>秒杀:</text>
						<text>{{ item.miaoshaBackUp.beginTime | dateFormat('MM-dd hh:mm') }}</text>
						<text class="m-lr">至</text>
						<text>{{ item.miaoshaBackUp.endTime | dateFormat('MM-dd hh:mm') }}</text>
					</view>
					<view class="attr-box manjian" v-if="item.manjian">
						<text>满减:</text>
						<text>{{ item.manjian.name }}</text>
					</view>
					<block v-if="item.modified">
						<view class="attr-box">
							<text>修改:</text>
							<text>{{ item.modified | dateFormat('yyyy-MM-dd hh:mm:ss') }}</text>
						</view>
					</block>
					<block v-if="item.deleteTime">
						<view class="attr-box">
							<text>删除:</text>
							<text>{{ item.deleteTime | dateFormat('yyyy-MM-dd hh:mm:ss') }}</text>
						</view>
					</block>
				</view>
			</view>
			<view class="action-box b-t">
				<block v-if="item.miaosha">
					<button class="action-btn warning" @click.stop="pause(item)">暂停</button>
					<button class="action-btn error" @click.stop="canceled(item)">删除</button>
					<button class="action-btn recom" @click.stop="edit(item, 1)">编辑</button>
				</block>
				<block v-else-if="item.miaoshaBackUp">
					<button class="action-btn warning" @click.stop="restart(item)">开始</button>
					<button class="action-btn recom" @click.stop="edit(item, 2)">编辑</button>
				</block>
			</view>
		</view>
		<uni-load-more :status="loadingType"></uni-load-more>
	</view>
</template>

<script>
import { goodsAdmin } from '@/common/admin_request.js';
import { navToGoodsItemPage } from '@/common/functions.js';
export default {
	data() {
		return {
			state: 'miaoshaAdmin',
			redirect: false,
			page: 0,
			limit: 20,
			loaded: false,
			loadingType: 'more',
			goodsList: []
		};
	},
	onShow() {
		this.redirect = false;
	},
	onLoad() {
		this.loadData();
	},
	// #ifndef MP
	//点击导航栏 buttons 时触发
	onNavigationBarButtonTap(e) {
		const index = e.index;
		console.log('onNavigationBarButtonTap');
		//this.$api.msg(index+" ");
		if (index === 0) {
			uni.navigateTo({
				url: `/pages/admin/goods/miaosha/add`
			});
		}
	},
	// #endif
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
			goodsAdmin('list', {
				state: this.state,
				page: this.page,
				limit: this.limit
			}).then(
				res => {
					let time = new Date().getTime();
					//处理秒杀开始，结束时间
					res.forEach(item => {
						if (item.miaosha) {
							item.miaosha.state = 'notstart';
							if (item.miaosha.endTime < time) {
								item.miaosha.state = 'ended';
							} else if (item.miaosha.beginTime < time) {
								item.miaosha.state = 'started';
							}
						}
					});
					this.goodsList = this.goodsList.concat(res);
					if (res.length < this.limit) {
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
			navToGoodsItemPage(item, true);
		},
		restart(item) {
			//重新开始秒杀
			goodsAdmin('restartMiaosha', {
				_id: item._id
			}).then(
				res => {
					this.$api.msg('重启成功', 2000, true, 'success');
					setTimeout(() => {
						uni.navigateBack({
							delta: 1
						});
					}, 2500);
				},
				err => {
					this.$api.msg(err.message);
				}
			);
		},
		pause(item) {
			//暂停秒杀,移动秒杀到备份
			goodsAdmin('pauseMiaosha', {
				_id: item._id
			}).then(
				res => {
					this.$api.msg('暂停成功', 2000, true, 'success');
					setTimeout(() => {
						uni.navigateBack({
							delta: 1
						});
					}, 2500);
				},
				err => {
					this.$api.msg(err.message);
				}
			);
		},
		canceled(item) {
			uni.showModal({
				content: '是否确定删除秒杀信息,删除后无法恢复,商品原信息不影响。',
				success: res => {
					if (res.confirm) {
						//清理秒杀
						goodsAdmin('cancelMiaosha', {
							_id: item._id
						}).then(
							res => {
								this.$api.msg('删除成功', 2000, true, 'success');
								setTimeout(() => {
									uni.navigateBack({
										delta: 1
									});
								}, 2500);
							},
							err => {
								this.$api.msg(err.message);
							}
						);
					}
				}
			});
		},
		edit(item, type) {
			if (this.redirect) {
				return false;
			}
			this.redirect = true;
			uni.setStorage({
				key: 'goodsMiaoshaEdit',
				data: item,
				success: () => {
					//编辑秒杀信息
					uni.navigateTo({
						url: `/pages/admin/goods/miaosha/add?id=${item._id}&type=${type}`
					});
				}
			});
		},
		refreshList(data,type) {
			this.page = 0;
			this.loaded = false;
			this.loadingType = 'more';
			this.goodsList = [];
			this.loadData();
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
		position: relative;
		flex-wrap: wrap;
		padding: 20upx 30upx 10upx 0;
	}
	.action-btn {
		height: 60upx;
		margin: 0 0 10upx 24upx;
		padding: 0 30upx;
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
			background-color: $uni-color-warning;
			color: #fff;
		}
		&.error {
			background-color: $uni-color-error;
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
.sub-title {
	font-size: $font-sm;
	color: $font-color-disabled;
}
</style>
