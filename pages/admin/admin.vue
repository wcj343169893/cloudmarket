<template>
	<view class="container">
		<view class="basic-section">
			<image class="bg" :src="banner"></image>
			<view class="user-info-box">
				<view class="portrait-box"><image class="portrait" :src="src"></image></view>
				<view class="info-box">
					<text class="username">{{ name }}({{ shopid }})</text>
					<view class="desc">
						<view class="">
							<text>{{ address }}</text>
						</view>
						<view class="">
							<text>{{ notice }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="cover-container">
			<view class="header"><text>订单管理</text></view>
			<!-- 订单信息统计 -->
			<view class="order-section m-t">
				<view class="order-item" v-for="(item, index) in orderTypes" :key="index" @click="navToOrder(item)" hover-class="common-hover" :hover-stay-time="50">
					<text class="number">{{ item.number }}</text>
					<text>{{ item.name }}</text>
				</view>
			</view>
			<!-- 商品信息统计，今日销售最高的4件商品 -->
			<view class="header">
				<text>商品管理</text>
				<view @click="navToAddGoods()" class="more">
					<text>新增</text>
					<text class="yticon icon-you"></text>
				</view>
			</view>
			<view class="order-section m-t">
				<view class="order-item" v-for="(item, index) in goodsTypes" :key="index" @click="navToGoods(item)" hover-class="common-hover" :hover-stay-time="50">
					<text class="number">{{ item.number }}</text>
					<text>{{ item.name }}</text>
				</view>
			</view>
		</view>
		<mix-list-cell icon="icon-fenlei1" iconColor="#54b4ef" title="分类管理" @eventClick="navTo('/pages/admin/goods/category')" tips=""></mix-list-cell>
		<mix-list-cell icon="icon-shouhoutuikuan" iconColor="#54b4ef" title="限时秒杀" @eventClick="navTo('/pages/admin/goods/miaosha/list')" tips=""></mix-list-cell>
		<mix-list-cell icon="icon-shouye" iconColor="#54b4ef" title="轮播广告" @eventClick="navTo('/pages/admin/ad/list')" tips="首页滚动广告图"></mix-list-cell>
	</view>
</template>

<script>
import { mapMutations } from 'vuex';
import { shopAdmin } from '@/common/admin_request.js';
import { getOrderTypes, getGoodsTypes } from '@/common/functions.js';
export default {
	data() {
		return {
			shopid: 0,
			isSetTitle: false,
			name: '',
			src: '/static/store-face.png',
			banner: '/static/banner.jpg',
			address: '',
			notice: '',
			orderTypes: [],
			goodsTypes: []
		};
	},
	onLoad(options) {
		this.shopid = +options.shopid;
		this.setAdminShop(this.shopid);
		console.log(this.shopid, options);
		if (options.second) {
			//进一步跳转到下一页页面
			uni.navigateTo({
				url: `/pages/admin/${options.second}?shopid=${options.id}&state=${options.state}`
			});
		}
		this.loadData();
	},
	//下拉刷新,不会更新底部附近的店铺
	onPullDownRefresh() {
		//this.loadData('refresh');
		console.log('刷新整页');
		uni.stopPullDownRefresh();
		this.loadData();
	},
	methods: {
		...mapMutations(['setAdminShop']),
		async loadData() {
			//优先读取缓存
			let info = uni.getStorageSync('adminShopInfo');
			if (info) {
				this.buildShopInfo(info);
			}
			shopAdmin('info', {}).then(
				res => {
					this.buildShopInfo(res);
				},
				err => {
					//获取店铺信息失败
					console.log('获取店铺信息失败');
				}
			);
		},
		buildShopInfo(data) {
			if (!this.isSetTitle && data.name) {
				uni.setNavigationBarTitle({
					title: data.name
				});
				this.isSetTitle = true;
			}
			for (let i in data) {
				this[i] = data[i];
			}
			let sum = 0;
			//1:payup已付款，2:delivered已发货，3:received已收货，4:estimated已评价，refunded退款
			let types = getOrderTypes();
			this.orderTypes = [];
			for (let k in types) {
				let number = 0;
				if (this.order[k]) {
					sum += number = this.order[k];
				}
				this.orderTypes.push({
					name: types[k],
					state: k,
					number: number
				});
			}
			this.orderTypes.unshift({
				name: '全部',
				state: 'all',
				number: sum
			});
			this.order['sum'] = sum;
			//商品类型,"online"在售,"miaosha"秒杀,"yuding"预售,"baokuan"爆款,"shouqin"即将售罄
			let goodsTypes = getGoodsTypes();
			this.goodsTypes = [];
			for (let gk in goodsTypes) {
				let number = 0;
				if (this.goods && this.goods[gk]) {
					number = this.goods[gk];
				}
				this.goodsTypes.push({
					name: goodsTypes[gk],
					state: gk,
					number: number
				});
			}
		},
		navToOrder(item) {
			let shopid = this.shopid;
			this.navTo(`/pages/admin/order/list?state=${item.state}&shopid=${shopid}`);
		},
		navToGoods(item) {
			let shopid = this.shopid;
			this.navTo(`/pages/admin/goods/list?state=${item.state}&shopid=${shopid}`);
		},
		//新增商品
		navToAddGoods() {
			uni.navigateTo({
				url: '/pages/admin/goods/add?isnew=true'
			});
		},
		navTo(url) {
			/* if (!this.hasLogin) {
				url = '/pages/public/login';
			} */
			uni.navigateTo({
				url
			});
		},
		//重新加载数据
		refreshList() {
			this.loadData();
		}
	}
};
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
.basic-section {
	height: 300upx;
	padding: 160upx 30upx 0;
	position: relative;
	// padding-top: calc(var(--status-bar-height) + 80upx);
	.bg {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		filter: blur(1px);
		opacity: 0.7;
	}
}
.user-info-box {
	display: flex;
	position: relative;
	z-index: 1;
	.portrait {
		width: 130upx;
		height: 130upx;
		border: 2upx solid #fff;
		border-radius: 4%;
		margin-right: 20upx;
	}
	.username {
		font-size: $font-lg + 6upx;
		color: $font-color-dark;
	}
	.desc {
		font-size: $font-base;
		color: $font-color-base;
	}
}
.cover-container {
	background: $page-color-base;
	margin-top: 0upx;
	padding: 20upx 30upx;
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
.order-section {
	@extend %section;
	padding: 28upx 0;
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
		margin-bottom: 18upx;
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
.m-t {
	margin-top: 20upx;
}
.header {
	margin-top: 20upx;
	font-size: $font-lg;
	display: flex;
	justify-content: space-between;
	.more {
		font-size: $font-base;
		color: $font-color-base;
	}
}
</style>
