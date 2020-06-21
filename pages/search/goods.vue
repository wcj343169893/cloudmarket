<template>
	<view class="container">
		<empty v-if="goodsList.length === 0">
			无结果
		</empty>
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
import { searchGoodsByKey } from '@/common/request.js';
import { navToGoodsItemPage, updateGoodsTags } from '@/common/functions.js';
export default {
	data() {
		return {
			goodsList: [],
			isLoaded: false,
			searchWord:"",
			page: 0,
			limit: 10
		};
	},
	computed: {
		...mapState(['shopId'])
	},
	onLoad(options) {
		this.searchWord = options.key;
		this.loadData();
		this.getDefaultSearchWord();
	},
	//滑到底部加载更多
	onReachBottom() {
		if (!this.isLoaded) {
			this.loadData();
		}
	},
	methods: {
		async loadData() {
			this.page++;
			searchGoodsByKey({
				key:this.searchWord,
				shopid: this.shopId,
				page: this.page,
				limit: this.limit
			}).then(
				res => {
					this.isLoaded = res.length < this.limit;
					res.map(item => {
						updateGoodsTags(item);
						this.goodsList.push(item);
					});
					this.getDefaultSearchWord();
				},
				err => {
					this.isLoaded = true;
				}
			);
		},
		navToGoodsPage(item) {
			navToGoodsItemPage(item);
		},
		reSearch(e){
			this.goodsList=[];
			this.searchWord = e;
			this.page = 0;
			this.loadData();
			this.getDefaultSearchWord();
		},
		getDefaultSearchWord() {
			// #ifdef APP-PLUS
			var webView = this.$mp.page.$getAppWebview();
			var tn = webView.getStyle().titleNView;
			tn.searchInput.placeholder = this.searchWord;
		
			webView.setStyle({
				titleNView: tn
			});
			// #endif
			
			//#ifdef MP
			//设置顶部标题
			uni.setNavigationBarTitle({
				title:this.searchWord
			})
			//#endif
		}
	},
	// #ifndef MP
	// 标题栏input搜索框点击
	onNavigationBarSearchInputClicked: async function(e) {
		//this.$api.msg('点击了搜索框');
		uni.navigateTo({
			url:`/pages/search/search?comefrom=searchresult&key=${this.searchWord}`
		})
	},
	// #endif
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
</style>
