<template>
	<view class="container">
		<block v-if="goodsList.length > 0">
			<view class="seckill-section">
				<view v-for="(item, index) in goodsList" :key="index" class="floor-item" @click="navToGoodsPage(item)">
					<image :src="item.src" mode="aspectFill"></image>
					<view class="content">
						<view class="title clamp">
							<text>{{ item.title }}</text>
						</view>
						<view class="tags">
							<text v-for="(tag,tagIndex) in item.tags" :key="tagIndex" class="tag" :class="[tag.type]">{{tag.text}}</text>
						</view>
						<view class="">
							<text class="price">{{ item.price }}</text>
							<text class="price del" v-if="item.originPrice > 0">{{ item.originPrice }}</text>
							<text class="sku_btn yticon icon-gouwuche_" @click.stop="saveCartAmount(item,item.miaosha.sku_id)"></text>
						</view>
					</view>
				</view>
			</view>
		</block>
		<view class="bottom" v-show="isLoaded"><text>以下没数据了</text></view>
	</view>
</template>

<script>
import { mapState } from 'vuex';
import { getMiaosha,editCart } from '@/common/request.js';
import { navToGoodsItemPage, updateGoodsTags, incrCartNumber, updateCartNumber,showLoginDialog } from '@/common/functions.js';
export default {
	data() {
		return {
			goodsList: [],
			isLoaded: false,
			page: 1,
			limit: 10
		};
	},
	computed: {
		...mapState(['hasLogin',  'stationId', 'shopId'])
	},
	onLoad() {
		this.loadCache();
		//this.loadData();
	},
	//滑到底部加载更多
	onReachBottom() {
		if (!this.isLoaded) {
			this.page += 1;
			this.loadData();
		}
	},
	methods: {
		async loadCache() {
			uni.getStorage({
				key: 'secKillGoodsList',
				success: res => {
					this.goodsList = res.data;
				}
			});
		},
		async loadData() {
			getMiaosha({
				shopid: this.shopId,
				page: this.page,
				limit: this.limit
			}).then(
				res => {
					if (this.page == 1) {
						this.goodsList = [];
					}
					this.isLoaded = res.length < this.limit;
					res.map(item => {
						updateGoodsTags(item);
						this.goodsList.push(item);
					});
				},
				err => {
					this.isLoaded = true;
				}
			);
		},
		//更新购物车数据到服务器
		saveCartAmount(item,sku_id) {
			let number = 1;
			if(!this.hasLogin){
				showLoginDialog();
				return;
			}
			console.log(item)
			editCart({
				id: this.shopId,
				stationId: this.stationId,
				goods_id: item.id,
				sku_id: +sku_id,
				price: item.price,
				title: item.title,
				appends:1,
				subTitle: item.subName,
				src: item.src,
				checked: 1,
				amount: number
			}).then(res => {
				console.log(res);
				this.$api.msg("加入成功",2000,true,"success")
			},err=>{
				this.$api.msg(err.message);
			});
		},
		navToGoodsPage(item) {
			navToGoodsItemPage(item);
		}
	}
};
</script>

<style lang="scss">
page {
	background-color: $background-color;
}
.seckill-section {
	display: flex;
	flex-wrap: wrap;
	font-size: $font-base;
	padding-top: 20upx;
	.floor-item {
		background: #ffffff;
		width: 344upx;
		margin-left: 20upx;
		padding: 0 0 20upx;
		margin-bottom: 20upx;
		border-radius: 4%;
		overflow: hidden;
		.content {
			padding: 0 16upx;
		}
		image {
			width: 344upx;
			height: 344upx;
		}
	}
}
.bottom {
	text-align: center;
	font-size: $font-sm;
	color: $font-color-disabled;
	padding: 20upx;
}
.sku_btn {
	color: $btn-color-light;
	font-size: $font-lg;
	line-height: 40rpx;
	float: right;
}
</style>
