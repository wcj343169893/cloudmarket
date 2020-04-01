<template>
	<view class="container">
		<!-- 二级分类 -->
		<view class="cate-section" v-if="shopCategoriesList.length > 0">
			<scroll-view class="floor-list" scroll-x>
				<view class="scoll-wrapper">
					<view
						v-for="(item, index) in shopCategoriesList"
						:key="index"
						v-bind:class="{ active: cateId == item.id, 'floor-item': 1 }"
						@click="getShopsByCategory(item.id)"
					>
						<image :src="item.src" mode="aspectFill"></image>
						<text class="title clamp">{{ item.name }}</text>
					</view>
				</view>
			</scroll-view>
		</view>
		<!-- 主分类下的店铺 -->
		<view v-bind:class="{ fixed: nearbyHeaderPosition, 'nearby-func-section': 1 }">
			<text v-bind:class="{ active: (nearByShopIndex & 1) == 1, 'fast-btn': 1 }" @click="getNearbyShops(1, 1)">满减优惠</text>
			<text v-bind:class="{ active: (nearByShopIndex & 2) >> 1 == 1, 'fast-btn': 1 }" @click="getNearbyShops(2, 1)">30分钟内</text>
			<text v-bind:class="{ active: (nearByShopIndex & 4) >> 2 == 1, 'fast-btn': 1 }" @click="getNearbyShops(4, 1)">免配送费</text>
			<text v-bind:class="{ active: (nearByShopIndex & 8) >> 3 == 1, 'fast-btn': 1 }" @click="getNearbyShops(8, 1)">大众好评</text>
		</view>
		<view class="nearby-section">
			<view v-for="(item, index) in shopList" :key="index" class="shop-item" @click="navToShopPage(item)">
				<view class="image-wrapper"><image :src="item.src" mode="aspectFill"></image></view>
				<view class="desc">
					<view class="">
						<text class="title clamp">{{ item.name }}</text>
					</view>
					<view>
						<text class="ops">评分{{ item.score }}</text>
						<text class="ops">月售{{ item.monthSale }}</text>
					</view>
					<view class="">
						<text class="ops">起送￥{{ item.deliveryMin }}</text>
						<text class="ops">配送￥{{ item.deliveryMoney }}</text>
						<text v-if="item.deliveryMoneyBefore > 0" class="del ops">{{ item.deliveryMoneyBefore }}</text>
						<text class="ops">人均￥{{ item.perCapita }}</text>
					</view>
					<view class="youhui" v-if="item.hasManjian">
						<text class="yh" v-for="(cou, ind) in item.manjians" :key="ind">{{ cou.name }}</text>
					</view>
				</view>
			</view>
		</view>
		<uni-load-more :status="loadingType"></uni-load-more>
	</view>
</template>
<script>
import { mapState } from 'vuex';
import { getCategoryByPid, getShopsByCid } from '@/common/request.js';
import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue';
export default {
	components: {
		uniLoadMore
	},
	data() {
		return {
			page: 1,
			limit: 20,
			cateId: 0,
			catName: '',
			nearByShopIndex: 0,
			loadingType: 'more', //加载更多状态
			nearbyHeaderPosition: 0,
			nearByHeadTop: 100,
			shopCategoriesList: [],
			shopList: []
		};
	},
	async onLoad(options) {
		console.log(options);
		if (!options.id) {
			this.$api.msg('分类不存在');
			setTimeout(function() {
				uni.navigateBack({
					delta: 1
				});
			}, 3000);
			return;
		}
		this.cateId = options.id;
		this.catName = options.name;
		uni.setNavigationBarTitle({
			title: options.name
		});
		this.loadData();
	},
	onPageScroll(e) {
		//兼容iOS端下拉时顶部漂移
		if (e.scrollTop >= this.nearByHeadTop) {
			this.nearbyHeaderPosition = 1;
		} else {
			this.nearbyHeaderPosition = 0;
		}
	},
	//加载更多
	onReachBottom() {
		if (this.loadingType != 'nomore') {
			this.getNearbyShops(0, this.nearByShopPage + 1);
		}
	},
	computed: {
		...mapState(['userInfo', 'stationId'])
	},
	methods: {
		async loadData() {
			//加载子分类
			this.getSubCategories();
			//加载店铺
			this.getNearbyShops(0, 1);
		},
		getSubCategories() {
			console.log({
				id: this.cateId,
				stationId: this.stationId
			});
			getCategoryByPid({
				id: this.cateId,
				stationId: this.stationId
			}).then(res => {
				this.shopCategoriesList = res;
			});
		},
		getShopsByCategory(id) {
			this.cateId = id;
			this.$api.loading();
			this.getNearbyShops(0, 1);
		},
		getNearbyShops(index, page) {
			if (index > 0) {
				this.$api.loading();
				if ((this.nearByShopIndex & index) == index) {
					//已经存在，减少
					this.nearByShopIndex = this.nearByShopIndex - index;
				} else {
					this.nearByShopIndex = this.nearByShopIndex + index;
				}
			}
			this.page = page;
			getShopsByCid({
				page: page,
				limit: this.limit,
				index: this.nearByShopIndex,
				cid: this.cateId,
				stationId: this.stationId
			})
				.then(
					res => {
						if (page == 1) {
							//清空原数据
							this.shopList = res;
						} else {
							//累加到现有数组
							this.shopList = this.shopList.concat(res);
						}
						//不足一页，肯定没有下一页了
						if (res.length < this.limit) {
							this.loadingType = 'nomore';
						} else {
							//还有数据
							this.loadingType = 'more';
						}
					},
					err => {
						//没有数据
						this.loadingType = 'nomore';
					}
				)
				.catch(err => {
					console.log(err)
					this.$api.msg('网络异常');
				});
		},
		//详情页
		navToShopPage(item) {
			//测试数据没有写id，用title代替
			let id = item.id;
			uni.navigateTo({
				url: `/pages/shop/simple?id=${id}`
			});
		}
	}
};
</script>

<style lang="scss">
page,
.container {
	height: 100%;
	background-color: #f8f8f8;
}
/* #ifdef MP */
page {
	.cate-section {
		position: relative;
		z-index: 5;
		border-radius: 16upx 16upx 0 0;
		margin-top: -20upx;
	}
}
/* #endif */
/* 分类 */
.cate-section {
	display: flex;
	justify-content: space-around;
	align-items: center;
	flex-wrap: nowrap;
	padding: 30upx 22upx 0 22upx;
	background: #fff;
	.cate-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		font-size: $font-sm + 2upx;
		color: $font-color-dark;
		width: 150upx;
		padding-bottom: 30upx;
		&.active {
			.name {
				color: #fa436a;
			}
		}
	}
	/* 原图标颜色太深,不想改图了,所以加了透明度 */
	image {
		width: 88upx;
		height: 88upx;
		margin-bottom: 14upx;
		border-radius: 50%;
		opacity: 0.7;
		box-shadow: 4upx 4upx 20upx rgba(250, 67, 106, 0.3);
	}
}
.nearby-section {
	padding: 10upx 22upx;
	.shop-item {
		background-color: #ffffff;
		display: flex;
		flex-direction: wrap;
		padding: 20upx 20upx 30upx;
		border-radius: 20upx;
		margin-bottom: 10upx;
	}
	.image-wrapper {
		width: 140upx;
		height: 140upx;
		border-radius: 3px;
		overflow: hidden;
		margin-right: 22upx;
		image {
			width: 100%;
			height: 100%;
			opacity: 1;
		}
	}
	.desc {
		flex: 1;
		font-size: $font-sm;
		color: $font-color-light;
		.title {
			font-size: $font-lg;
			color: $font-color-dark;
			line-height: 60upx;
			font-weight: 400;
		}
		.ops {
			margin-right: 12upx;
		}
		.del {
			text-decoration: line-through;
		}
		.youhui {
			padding-top: 8upx;
			.yh {
				margin-right: 10upx;
				color: #f0ad4e;
				border: 1px solid #f0ad4e;
				font-size: 0.8em;
				padding: 0upx 10upx;
				line-height: 1;
				border-radius: 8upx;
			}
		}
	}
}
.nearby-func-section {
	padding: 0 20upx 20upx;
	font-size: $font-sm;
	background: #fff;
	.fast-btn {
		background-color: #f8f8f8;
		color: $font-color-light;
		padding: 6upx 30upx;
		margin-right: 20upx;
		border-radius: 8upx;
		&.active {
			background-color: #fa436a;
			color: #ffffff;
		}
	}
}
/* 分类 */
.cate-section {
	padding: 4upx 30upx 24upx;
	background: #fff;
	.floor-list {
		white-space: nowrap;
	}
	.scoll-wrapper {
		display: flex;
		align-items: flex-start;
	}
	.floor-item {
		width: 200upx;
		margin-right: 40upx;
		font-size: $font-sm + 2upx;
		color: $font-color-dark;
		line-height: 1.2;
		text-align: center;
		image {
			width: 88upx;
			height: 88upx;
		}
		&.active {
			.title {
				color: #fa436a;
			}
		}
	}
}
</style>
