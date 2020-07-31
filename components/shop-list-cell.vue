<template>
	<view class="shop-list-cell">
		<view v-bind:class="{ fixed: nearbyHeaderPosition, 'nearby-func-section': 1 }">
			<text v-bind:class="{ active: (nearByShopIndex & 1) == 1, 'fast-btn': 1 }" @click="getNearbyShops(1)">满减优惠</text>
			<text v-bind:class="{ active: (nearByShopIndex & 2) == 2, 'fast-btn': 1 }" @click="getNearbyShops(2)">30分钟内</text>
			<text v-bind:class="{ active: (nearByShopIndex & 4) == 4, 'fast-btn': 1 }" @click="getNearbyShops(4)">免配送费</text>
			<text v-bind:class="{ active: (nearByShopIndex & 8) == 8, 'fast-btn': 1 }" @click="getNearbyShops(8)">大众好评</text>
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
						<text class="ops">起送￥{{ item.delivery.minPrice }}</text>
						<text v-if="item.delivery.money == 0" class="ops ops1">免配送费</text>
						<text v-else>
							<text class="ops">配送￥{{ item.delivery.money }}</text>
						</text>
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
import { getShopsByCid } from '@/common/request.js';
import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue';
export default {
	name: 'shop-list-cell',
	components: {
		uniLoadMore
	},
	props: {
		id: {
			type: [Number, String],
			default: 1
		},
		cid: {
			type: [Number],
			default: 0
		},
		limit: {
			type: [Number],
			default: 5
		},
		next: {
			type: [Number],
			default: 1
		}
	},
	data() {
		return {
			page:1,
			nearByShopIndex: 0,
			nearbyHeaderPosition: 0,
			stationId: 0,
			loadingType: 'more',
			shopList: []
		};
	},
	watch: {
		cid(val) {
			//切换分类
			console.log('shop-list-cell cid', val);
			this.page=1;
			//加载下一页
			this.getNearbyShopsData();
		},
		next(val) {
			//页面滑到了底部，加载下一页
			console.log('shop-list-cell next', val);
			//触发了到底事件
			if (this.loadingType == 'nomore') {
				console.log('没有更多数据了', val);
				return;
			}
			this.page++;
			//加载下一页
			this.getNearbyShopsData();
		}
	},
	created() {
		console.log('shop-list-cell created');
		//默认加载第一页
		this.getNearbyShops(0);
	},
	methods: {
		getNearbyShops(index) {
			if (index > 0) {
				if ((this.nearByShopIndex & index) == index) {
					//已经存在，减少
					this.nearByShopIndex = this.nearByShopIndex - index;
				} else {
					this.nearByShopIndex = this.nearByShopIndex + index;
				}
			}
			console.log('getNearbyShops', index);
			//重新加载数据
			this.loadingType = 'more';
			this.page = 1;
			this.getNearbyShopsData();
		},
		getNearbyShopsData() {
			getShopsByCid({
				page: this.page,
				limit: this.limit,
				index: this.nearByShopIndex,
				cid: this.cid,
				stationId: this.stationId
			})
				.then(
					res => {
						if (this.page == 1) {
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
						console.log('没有数据');
					}
				)
				.catch(err => {
					console.log(err);
				});
		},
		//店铺主页
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

<style lang="scss" scoped>
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
		border-radius: 8upx;
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
			&.ops1{
				color: $font-color-emphasis;
			}
		}
		.del {
			text-decoration: line-through;
		}
		.youhui {
			padding-top: 8upx;
			.yh {
				margin-right: 10upx;
				color: $font-color-emphasis;
				border: 1px solid $font-color-emphasis;
				font-size: 0.8em;
				padding: 0upx 10upx;
				line-height: 1;
				border-radius: 8upx;
			}
		}
	}
}
</style>
