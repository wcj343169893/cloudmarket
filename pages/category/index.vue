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
		<shop-list-cell :cid="cateId" :next="goNext"></shop-list-cell>
	</view>
</template>
<script>
import { mapState } from 'vuex';
import { getCategoryByPid } from '@/common/request.js';
import shopListCell from '@/components/shop-list-cell.vue';
export default {
	components: {
		shopListCell
	},
	data() {
		return {
			page: 1,
			limit: 20,
			cateId: 0,
			catName: '',
			goNext:1,
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
		this.cateId = +options.id;
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
		this.goNext +=1;
	},
	computed: {
		...mapState(['userInfo', 'stationId'])
	},
	methods: {
		async loadData() {
			//加载子分类
			this.getSubCategories();
			//加载店铺
			//this.getNearbyShops(0, 1);
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
			this.cateId = +id;
			//this.$api.loading();
			//this.getNearbyShops(0, 1);
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
