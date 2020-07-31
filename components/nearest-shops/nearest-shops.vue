<template>
	<!-- 主分类下的店铺 -->
	<view v-bind:class="{ fixed: nearbyHeaderPosition, 'nearby-func-section': 1 }">
		<text v-bind:class="{ active: (nearByShopIndex & 1) == 1, 'fast-btn': 1 }" @click="getNearbyShops(1, 1)">满减优惠</text>
		<text v-bind:class="{ active: (nearByShopIndex & 2) >> 1 == 1, 'fast-btn': 1 }" @click="getNearbyShops(2, 1)">30分钟内</text>
		<text v-bind:class="{ active: (nearByShopIndex & 4) >> 2 == 1, 'fast-btn': 1 }" @click="getNearbyShops(4, 1)">减配送费</text>
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
					<text class="ops">起送￥{{ item.delivery.minPrice }}</text>
					<text class="ops">配送￥{{ item.delivery.money }}</text>
					<text class="ops">人均￥{{ item.perCapita }}</text>
				</view>
				<view class="youhui" v-if="item.hasManjian">
					<text class="yh" v-for="(cou, ind) in item.manjians" :key="ind">{{ cou.name }}</text>
				</view>
			</view>
		</view>
	</view>
	<uni-load-more :status="loadingType"></uni-load-more>
</template>

<script>
import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue';
export default {
	components: {
		uniLoadMore
	},
	name: 'nearest-shops',
	props: {
		cid: {
			type: String,
			default: '0'
		}
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
	}
};
</script>

<style lang="scss">
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
</style>
