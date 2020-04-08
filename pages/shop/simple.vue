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
					<text>{{ item.name }}</text>
					<text class="sub_number" v-if="item.cart > 0">{{item.cart}}</text>
				</view>
				<view class="space"></view>
			</scroll-view>
			<scroll-view scroll-with-animation scroll-y class="right-aside" @scroll="asideScroll" :scroll-top="tabScrollTop">
				<view v-for="(category,cindex) in slist" :key="category.id" class="s-list" :id="'main-' + category.id">
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
									<view class="buttons">
										<view class="price">
											<text class="unit">￥</text>
											<text>{{ item.price }}</text>
											<text class="del m-l" v-if="item.originPrice > 0">￥{{ item.originPrice }}</text>
										</view>
										<view class="sku_button" v-if="item.hasSku">
											<text class="sub_number" v-if="goodsCartNumber[item.id] > 0">{{goodsCartNumber[item.id]}}</text>
											<text class="sku_btn" @click="openSkus(item,category.pid)">选规格</text>
										</view>
										<uni-number-box v-if="!item.hasSku" :min="0" :max="99" :id="category.pid+'_'+item.id" :value="item.cart" @change="bindChange"></uni-number-box>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="space"></view>
			</scroll-view>
		</view>
		<view class="cart"><text>{{sumCart}}</text> </view>
		<!-- 选规格 -->
		<uni-popup ref="showsku" :type="skuDialogType" :mask-click="true" @change="change">
			<view class="skuDialogPanel">
				<view class="title">
					<text>{{skuGoods.title}}</text>
				</view>
				<view v-for="(item,index) in skuGoods.skuNameMap" :key="index">
					<view class="skuname">
						<text>{{item.name}}</text>
					</view>
					<view class="skuoptions">
						<view v-for="(sname,index2) in item.child" :key="index2" class="skuoptions__item" 
						:class="{active:item.active== index2}" @click="selectSku(index,index2)">
							<text>{{sname}}</text>
						</view>
					</view>
				</view>
				<view class="sku_selected">
					<text>已选择规格：{{skuGoodsSelected}}</text>
				</view>
				<view class="sku_prices_buttons">
					<view class="sku_prices_buttons__price">
						<text class="unit">￥</text>
						<text>{{skuGoods.price}}</text>
						<text class="del m-l" v-if="skuGoods.originPrice > 0">￥{{ skuGoods.originPrice }}</text>
					</view>
					<view class="sku_prices_buttons__btn">
						<uni-number-box :min="0" :max="99" :id="skuGoods.catPid+'_'+skuGoods.id" :value="skuGoods.cart" @change="bindChangeSku"></uni-number-box>
					</view>
				</view>
			</view>
			<view class="uni-image-close" @click="closeSkuDialog()">
				<uni-icons type="clear" color="#fff" size="40" />
			</view>
		</uni-popup>
	</view>
</template>

<script>
import { mapState } from 'vuex';
import { getShopHome, getGoodsByCid } from '@/common/request.js';
import {uniFab,uniPopup,uniIcons  } from "@dcloudio/uni-ui"
import uniNumberBox from '@/components/uni-number-box/uni-number-box.vue';
export default {
	components: {
		uniNumberBox,
		uniFab,
		uniPopup,
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
			nunn:1,
			currentBeforeId: 0,
			currentAfterId: 0,
			categoryList: [],
			slist: [],
			tlist: [],
			cartNumber:{},
			sumCart:0,
			goodsCartNumber:{},
			skuDialogType:"center",
			skuGoods:{},
			skuGoodsSelected:""
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
						//构造二级数据，如果没有，则为本身
						let cateMap = {};
						let catIndex = 0;
						res.goods_categories.forEach((ele, index) => {
							ele.cart=0;
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
						this.categoryList = res.goods_categories;
						//默认第一个选中
						this.currentId = this.categoryList[0].id;
						if (this.categoryList.length > 1) {
							this.currentAfterId= this.categoryList[1].id;
						}
						//需要按分类来分组联动，这里的商品,优先二级
						if (res.goods.length > 0) {
							res.goods.forEach((ele, index) => {
								//强转加入购物车数量
								ele["cart"] = ele.cart?parseInt(ele.cart):0;
								this.goodsCartNumber[ele.id]=ele["cart"];
								//是否存在多规格
								ele["hasSku"]=ele.skus && ele.skus.length > 0;
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
				if(!data){
					return;
				}
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
						if(data){
							item.top = h;
							h += data.height;
							item.bottom = h;
						}
					}
				).exec();
			});
			this.sizeCalcState = true;
		},
		/**单商品增减数量**/
		bindChange(number,id){
			console.log(number,id)
			let ginfo=id.split("_");
			let pid = parseInt(ginfo[0]);
			let gid = parseInt(ginfo[1]);
			let num = parseInt(number);
			this.changeGoodsCategoryCount(pid,gid,num);
		},
		/**多规格商品增减数量**/
		bindChangeSku(number,id){
			console.log("多规格",number,id,this.skuGoods.selectedSkuId)
			let ginfo=id.split("_");
			let pid = parseInt(ginfo[0]);
			let gid = parseInt(ginfo[1]);
			let num = parseInt(number);
			//得到当前选中的skuid
			
		},
		/**打开sku选择弹窗**/
		openSkus(item,pid){
			//规格弹窗点了加入购物车，再调用
			/* this.goodsCartNumber[item.id]++;
			this.changeGoodsCategoryCount(pid,item.id,this.goodsCartNumber[item.id]); */
			//处理规格结构
			let skus = item.skus;
			let skuMap=[];
			for(let n in item.skuname){
				skuMap.push({
					name:item.skuname[n],
					active:0,
					child:[]
				});
			}
			console.log(skuMap);
			let nameMap={};
			skus.forEach(sku=>{
				let names = sku.name.split("&gt;");
				names.forEach((n,i)=>{
					if(skuMap[i]["child"].indexOf(n) == -1){
						skuMap[i]["child"].push(n)
					}
				});
				nameMap[sku.name]=sku.id;
			})
			//默认第一个规格的选中次数
			item["cart"]=0;
			item["catPid"]=pid;
			item["skuNameIds"]=nameMap;
			item["skuNameMap"]=skuMap;
			this.skuGoods = item;
			//延时打开
			this.$nextTick(() => {
				this.$refs['showsku'].open();
				//默认选中第一个
				this.selectSku(0,0);
			})
		},
		/**单商品和多规格商品统一更改数量统计**/
		changeGoodsCategoryCount(pid,gid,number){
			if(!this.cartNumber[pid]){
				this.cartNumber[pid]={};
			}
			this.cartNumber[pid][gid]=number;
			let sum = 0;
			//更新大分类数量
			for(let i in this.cartNumber[pid]){
				sum+=this.cartNumber[pid][i];
			}
			let index = this.categoryList.findIndex(sitem => sitem.id === pid);
			if(index <0){
				return;
			}
			console.log(sum)
			this.categoryList[index]["cart"]=sum;
			
			//所有分类的数量
			this.getSumCartNumber();
		},
		/**计算购物车总数量**/
		getSumCartNumber(){
			let allSum=0;
			for(let b in this.cartNumber){
				for(let c in this.cartNumber[b]){
					allSum+=this.cartNumber[b][c];
				}
			}
			this.sumCart = allSum;
		},
		/**关闭sku选择弹窗**/
		closeSkuDialog(){
			this.$refs['showsku'].close()
		},
		/**规格选择**/
		selectSku(index,index2){
			this.skuGoods.skuNameMap[index].active=index2;
			//更新已选择规格
			let names=[];
			this.skuGoods.skuNameMap.forEach(skuname=>{
				names.push(skuname["child"][skuname.active]);
			});
			this.skuGoodsSelected = names.join("、");
			//匹配skuid
			this.skuGoods["selectedSkuId"]=this.skuGoods["skuNameIds"][names.join("&gt;")];
		},
		change(e) {
			console.log('是否打开:' + e.show)
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
	width: 160upx;
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
	.sub_number{
		top: 6upx;
	}
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
	padding:2upx 18upx 0;
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
			margin-left: 16upx;
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
			margin-top: 6upx;
			display: flex;
			.empty{
				flex: 1;
			}
		}
	}
}
/**选规格**/
$box-height: 60upx;
.sku_button{
	width: 80upx;
	height: $box-height;
	line-height: 80upx;
	flex: 1;
	text-align: right;
	position: relative;
	.sku_btn{
		background: #f5c454;
		color: $font-color-dark;
		padding: 12upx 16upx 12upx;
		border-radius: 30upx;
	}
}
.sub_number{
	position: absolute;
	right: 6upx;
	top: -14upx;
	background: $base-color;
	line-height: 1;
	font-size: $font-sm;
	color: #ffffff;
	padding: 4upx;
	border-radius: 32upx;
	width: 32upx;
	text-align: center;
	z-index: 10;
}
.skuDialogPanel{
	background: #ffffff;
	width: 670upx;
	border-radius: 20upx;
	padding: 20upx 40upx;
	font-size: $font-base;
	.title{
		font-size: $font-lg;
		color: $font-color-dark;
	}
	.skuname{
		margin: 8upx 0;
		color: $font-color-light;
	}
	.skuoptions{
		flex-wrap: wrap;
		text-align: center;
		display: flex;
	}
	$yellow-color:#f8d889;
	.skuoptions__item{
		width: 200upx;
		border: 1px solid $yellow-color;
		border-radius: 8upx;
		padding: 8upx;
		margin-right: 20upx;
		margin-bottom: 20upx;
		&.active{
			color: #f1a63b;
			background: #fefbf2;
		}
	}
	.sku_selected{
		background: #fafafa;
		margin: 20upx -40upx;
		padding: 12upx 40upx;
		border: 2upx solid #f3f3f3;
		border-left: none;
		border-right: none;
	}
	.sku_prices_buttons{
		display: flex;
	}
	.sku_prices_buttons__price{
		flex: 1;
	}
	.sku_prices_buttons__btn{
	}
}
.uni-image-close {
	margin-top: 20upx;
	text-align: center;
}
.cart{
	position: fixed;
	left: 40upx;
	bottom: 60upx;
	background: #fff;
	z-index: 100;
}
</style>
