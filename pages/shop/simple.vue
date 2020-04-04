<template>
	<view class="container" :style="shopinfo.bannerBackground">
		<view class="space" id="headSpace"></view>
		<!-- 店铺基本信息区域 -->
		<view class="shopinfo" id="shopinfo">
			<view class="weui-flex">
				<view class="image-wrapper"><image :src="shopinfo.src" mode="aspectFill"></image></view>
				<view class="desc">
					<view class="">
						<text class="title">{{ shopinfo.name }}</text>
					</view>
					<view>
						<text class="ops">评分{{ shopinfo.score }}</text>
						<text class="ops">月售{{ shopinfo.monthSale }}</text>
					</view>
					<view class="">
						<text class="ops">起送￥{{ shopinfo.deliveryMin }}</text>
						<text class="ops">配送￥{{ shopinfo.deliveryMoney }}</text>
						<text v-if="shopinfo.deliveryMoneyBefore > 0" class="del ops">{{ shopinfo.deliveryMoneyBefore }}</text>
						<text class="ops">人均￥{{ shopinfo.perCapita }}</text>
					</view>
					<view class="youhui" v-if="shopinfo.hasManjian">
						<text class="yh" v-for="(cou, ind) in shopinfo.manjians" :key="ind">{{ cou.name }}</text>
					</view>
				</view>
			</view>
			<view class="notice" v-if="shopinfo.notice && shopinfo.notice !='' ">
				<text class="ops">温馨提示：{{ shopinfo.notice }}</text>
			</view>
		</view>
		<view class="content" :style="contentStyleHeight">
			<scroll-view scroll-y class="left-aside">
				<view
					v-for="(item, index) in categoryList"
					:key="item.id"
					class="f-item b-b"
					:class="{ active: item.id === currentId, before: item.id === currentBeforeId, after: item.id === currentAfterId }"
					@click="tabtap(item)"
				>
					{{ item.name }}
				</view>
				<view class="space"></view>
			</scroll-view>
			<scroll-view scroll-with-animation scroll-y class="right-aside" @scroll="asideScroll" :scroll-top="tabScrollTop">
				<view v-for="category in slist" :key="category.id" class="s-list" :id="'main-' + category.id">
					<text class="s-item">{{ category.name }}</text>
					<view class="t-list">
						<view v-for="(item, index) in category.goods" :key="index" class="goodsList">
							<view class="weui-flex">
								<view class="image-wrapper"><image :src="item.src" mode="aspectFill"></image></view>
								<view class="desc weui-flex__item">
									<view class="">
										<text class="title">{{ item.title }}</text>
									</view>
									<view class="">
										<text>月售{{ item.monthlySale }}</text>
										<text class="m-l">好评度{{ item.score * 100 }}%</text>
									</view>
									<view class="price">
										<text class="unit">￥</text>
										<text>{{ item.price }}</text>
										<text class="del m-l" v-if="item.originPrice > 0">￥{{ item.originPrice }}</text>
									</view>
									<view class="buttons">
										<uni-icons type="minus" size="22" color="#333333" @click="removeCart(item)"></uni-icons>
										<input class="uni-input" maxlength="10" value="1" />
										<uni-icons type="plus" size="22" color="#ef5656" @click="addCart(item)"></uni-icons>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="space"></view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
import { mapState } from 'vuex';
import { getShopHome, getGoodsByCid } from '@/common/request.js';
import { uniIcons } from '@dcloudio/uni-ui';
export default {
	components: {
		uniIcons
	},
	data() {
		return {
			shopinfo: {
				name:" ",
				perCapita:0,
				score:0,
				monthSale:0,
				deliveryMoney:0,
				deliveryMin:0
			},
			headHeight: 100,
			contentStyleHeight: 'height:500px',
			goodsList: [],
			sizeCalcState: false,
			tabScrollTop: 0,
			currentId: 0,
			currentBeforeId: 0,
			currentAfterId: 0,
			categoryList: [],
			slist: [],
			tlist: []
		};
	},
	onLoad(options) {
		console.log(options);
		if (!options.id) {
			this.$api.msg('店铺不存在');
			setTimeout(function() {
				uni.navigateBack({
					delta: 1
				});
			}, 3000);
			return;
		}
		this.shopid = options.id;
		this.loadData();
	},
	computed: {
		...mapState(['userInfo', 'stationId'])
	},
	methods: {
		async loadData() {
			//加载店铺信息
			this.getShopInfo();
		},
		getShopInfo() {
			//一并查询所有商品
			getShopHome({
				id: this.shopid,
				stationId: this.stationId,
				withGoods: 1,
				withSubCategory: 1
			}).then(
				res => {
					console.log(res);
					if (!res.id) {
						return;
					}
					this.shopinfo = res;
					if (this.shopinfo.banner) {
						this.shopinfo.bannerBackground = 'background-image: url(' + this.shopinfo.banner + ');';
					}
					if (res.goods_categories.length > 0) {
						this.categoryList = res.goods_categories;
						//默认第一个选中
						this.currentId = this.categoryList[0].id;
						if (this.categoryList.length > 1) {
							this.currentAfterId= this.categoryList[1].id;
						}
						//构造二级数据，如果没有，则为本身
						let cateMap = {};
						let catIndex = 0;
						res.goods_categories.forEach((ele, index) => {
							if (ele.children && ele.children.length > 0) {
								ele.children.forEach((ele2, ind2) => {
									ele2.pid = ele.id;
									ele2.goods = [];
									this.slist.push(ele2);
									cateMap[ele2.id] = catIndex;
									catIndex++;
								});
								//去掉子集，节省内存
								ele.children=[];
							} else {
								ele.pid = ele.id;
								ele.goods = [];
								this.slist.push(ele);
								cateMap[ele.id] = catIndex;
								catIndex++;
							}
						});
						//需要按分类来分组联动，这里的商品,优先二级
						if (res.goods.length > 0) {
							res.goods.forEach((ele, index) => {
								if (ele.categories) {
									ele.categories.forEach((cate, cindex) => {
										//判断是否存在与二级分类中
										if (cate.id in cateMap) {
											let cmIndex = cateMap[cate.id];
											this.slist[cmIndex].goods.push(ele);
										}
									});
								}
							});
						}
					}
					setTimeout(()=>{
						//延时执行，防止数据未渲染
						this.calculateContentHeight();
						//延时计算联动效果
						this.calcSize();
					},100);
					//this.goodsList = res.goods;
					//计算高度
					//this.calculate();
					//this.changeCategory(0);
				},
				err => {
					console.log('店铺不存在');
					this.$api.msg('店铺不存在');
				}
			);
		},
		//计算分类和商品列表高度
		calculateContentHeight() {
			//窗口高度-顶部高度
			const { windowWidth, windowHeight } = uni.getSystemInfoSync();
			let info = uni.createSelectorQuery().select('#shopinfo');
			info.boundingClientRect(data => {
				console.log(data)
				this.headHeight = data.height + data.top;
				let height = windowHeight - this.headHeight;
				this.contentStyleHeight = 'height:' + height + 'px';
			}).exec();
		},
		//一级分类点击
		tabtap(item) {
			console.log(item)
			if (!this.sizeCalcState) {
				this.calcSize();
			}
			this.currentId = item.id;
			let index = this.slist.findIndex(sitem => sitem.pid === item.id);
			this.tabScrollTop = this.slist[index].top+4;
			this.cateIndex(this.currentId);
			console.log("clicked")
		},
		//右侧栏滚动
		asideScroll(e) {
			if (!this.sizeCalcState) {
				this.calcSize();
			}
			let scrollTop = e.detail.scrollTop;
			let tabs = this.slist.filter(item => item.top <= scrollTop).reverse();
			if (tabs.length > 0) {
				this.currentId = tabs[0].pid;
				this.cateIndex(this.currentId);
			}
		},
		cateIndex(id){
			let index = this.categoryList.findIndex(sitem => sitem.id === id);
			if (index > 0) {
				this.currentBeforeId = this.categoryList[index-1].id;
			}
			if (index < this.categoryList.length) {
				this.currentAfterId = this.categoryList[index + 1].id;
			}
		},
		//计算右侧栏每个tab的高度等信息
		calcSize() {
			let h = 0;
			this.slist.forEach(item => {
				let view = uni.createSelectorQuery().select('#main-' + item.id);
				view.fields(
					{
						size: true
					},
					data => {
						item.top = h;
						h += data.height;
						item.bottom = h;
					}
				).exec();
			});
			this.sizeCalcState = true;
		}
	}
};
</script>

<style lang="scss">
.container {
	padding-top: var(--status-bar-height);
	background-size: 100%;
	background-repeat: no-repeat;
	height: 100%;
	overflow: hidden;
}
.space {
	padding: 20upx 0 0;
}
.weui-flex {
	display: flex;
	align-items: center;
}
.weui-flex__item {
	flex: 1;
}
$border-color: #f5f5f5;
.shopinfo {
	margin: 0 40upx 0;
	padding: 20upx;
	background-color: #ffffff;
	border-radius: 20upx 20upx 0 0;
	.weui-flex{
		align-items: flex-start;
	}
	.image-wrapper {
		width: 120upx;
		height: 120upx;
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
			line-height:1;
			font-weight: 400;
			padding-bottom: 8upx;
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
	.notice{
		font-size: $font-sm;
		color: $font-color-light;
		padding-top: 6upx;
	}
}
.content {
	display: flex;
	background-color: #f8f8f8;
}
.left-aside {
	flex-shrink: 0;
	width: 200upx;
	height: 100%;
	.space {
		padding-top: 80upx;
	}
}
.f-item {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100upx;
	font-size: 28upx;
	color: $font-color-base;
	position: relative;
	background: #fff;
	&.active {
		color: $base-color;
		background: #f8f8f8;
		&:before {
			content: '';
			position: absolute;
			left: 0;
			top: 50%;
			transform: translateY(-50%);
			height: 36upx;
			width: 8upx;
			background-color: $base-color;
			border-radius: 0 4px 4px 0;
			opacity: 0.8;
		}
		&::after{
			display: none;
		}
	}
	&.before {
		border-radius: 0 0 10px 0;
		&::after{
			display: none;
		}
	}
	&.after {
		border-radius: 0 10px 0 0;
	}
}

.right-aside {
	flex: 1;
	overflow: hidden;
	padding:2upx 20upx 0;
	height: 100%;
	.space {
		padding-top: 120upx;
	}
	.s-item{
		display: flex;
		align-items: center;
		height: 70upx;
		font-size: 28upx;
		color: $font-color-dark;
	}
	.goodsList {
		background: #ffffff;
		padding: 20upx;
		border-radius: 12upx;
		margin-bottom: 8upx;
		.weui-flex {
			align-items: flex-start;
		}
		.sub-catename {
			padding-bottom: 10upx;
		}
	}
	.image-wrapper {
		width: 120upx;
		height: 120upx;
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
			line-height: 1.1;
			font-weight: 400;
		}
		.m-l {
			margin-left: 20upx;
		}
		.price {
			color: $base-color;
			font-size: 1.4em;
			.unit {
				font-size: 0.8em;
			}
			.del {
				font-size: 0.8em;
				color: $font-color-light;
				text-decoration: line-through;
			}
		}
		.buttons {
			display: flex;
			text-align: center;
			width: 180upx;
			float: right;
			margin-right: 20upx;
			.uni-input {
				border: 1px solid $border-color;
				border-radius: 6upx;
			}
		}
	}
}
</style>
