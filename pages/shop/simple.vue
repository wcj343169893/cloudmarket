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
					<view v-if="shopinfo.name !=''">
						<text class="ops">评分{{ shopinfo.score }}</text>
						<text class="ops">月售{{ shopinfo.monthSale }}</text>
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
			<scroll-view scroll-y class="left-aside" :scroll-top="leftScrollTop">
				<view
					v-for="(item, index) in categoryList"
					:key="item.id"
					class="f-item"
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
									<view class="desc2">
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
										<uni-number-box v-if="!item.hasSku" :min="0" :max="99" :disabled="!hasLogin" :keys="category.pid+'_'+item.id" :value="goodsCartNumber[item.id]" @disabledEvent="showLoginDialog" @change="bindChange"></uni-number-box>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="space"></view>
			</scroll-view>
		</view>
		<view class="cart" v-if="hasLogin && inited">
			<view class="notice" v-if="shopinfo.delivery.minPrice > cartInfo.sumPrice">
				<text>还差￥{{shopinfo.minPrice - cartInfo.sumPrice}}达到起送金额</text>
			</view>
			<view class="weui-flex">
				<view class="btn btn_tel">
					<text>联系商家</text>
				</view>
				<view class="weui-flex__item settleMoney" @click="openCartDialog()">
					<view class="weui-flex">
						<view class="img">
							<image src="../../static/cart.png" mode=""></image>
							<text class="sub_number" v-if="cartInfo.sumCart > 0">{{cartInfo.sumCart}}</text>
						</view>
						<view class="weui-flex__item">
							<view class="price">
								<text>￥{{cartInfo.sumPrice}}</text>
								<text class="del m-l" v-if="cartInfo.sumDiscount > 0">￥{{cartInfo.sumPrice + cartInfo.sumDiscount}}</text>
							</view>
							<view class="delivery" v-if="cartInfo.sumDeliveryMoney > 0">
								<text>另需配送费￥{{cartInfo.sumDeliveryMoney}}</text>
							</view>
							<view class="delivery" v-if="cartInfo.sumDeliveryMoney == 0">
								<text>免配送费</text>
							</view>
						</view>
					</view>
				</view>
				<view class="btn btn_ok">
					<text>去结算</text>
				</view>
			</view>
		</view>
		<!-- 登录提示 -->
		<uni-popup ref="showlogin" :type="skuDialogType" :mask-click="true" @change="change">
			<view class="loginDialog">
				<image :src="userInfo.portrait || '/static/missing-face.png'" mode=""></image>
				<view class="notice">
					<text>您还未登录</text>
				</view>
				<view class="weui-flex">
					<view class="weui-flex__item">
						<text class="btn btn_ok" @click="loginPage()">登录</text>
					</view>
					<view class="weui-flex__item" @click="closeLoginDialog()">
						<text class="btn">取消</text>
					</view>
				</view>
			</view>
		</uni-popup>
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
					<view class="sku_prices_buttons__price price">
						<text class="unit">￥</text>
						<text>{{skuGoods.showPrice}}</text>
						<text class="del m-l" v-if="skuGoods.showOriginPrice > 0">￥{{ skuGoods.showOriginPrice }}</text>
					</view>
					<view class="sku_prices_buttons__btn" v-if="skuCart[skuGoods.id]">
						<uni-number-box :min="0" :max="99" :keys="skuGoods.catPid+'_'+skuGoods.id" :value="skuCart[skuGoods.id][skuGoods.selectedSkuId]" @change="bindChangeSku"></uni-number-box>
					</view>
				</view>
			</view>
			<view class="uni-image-close" @click="closeSkuDialog()">
				<uni-icons type="clear" color="#fff" size="40" />
			</view>
		</uni-popup>
		<!-- 购物车详细 -->
		<uni-popup ref="showcart" :type="cartDialogType" :mask-click="true" @change="changeCartList">
			<view class="cart-list-title">
				<text class="btn btn_clearn" @click="cleanAllCart()">清空购物车</text>
			</view>
			<scroll-view scroll-y class="cart-list">
				<view v-for="(item,index) in cartInfo.dataList" :key="index" class="goodsList">
					<view class="weui-flex">
						<view class="image-wrapper"><image :src="item.src" mode="aspectFill"></image></view>
						<view class="desc weui-flex__item">
							<view class="">
								<text class="title">{{ item.title }}</text>
							</view>
							<view class="">
								<text>{{ item.subName }}</text>
							</view>
							<view class="buttons">
								<view class="price">
									<text class="unit">￥</text>
									<text>{{ item.price }}</text>
									<text class="del m-l" v-if="item.originPrice > 0">￥{{ item.originPrice }}</text>
								</view>
								<uni-number-box  :min="0" :max="99"  :keys="item.goods_id+'_'+item.sku_id" :value="item.cart"  @change="bindChangeCart"></uni-number-box>
							</view>
						</view>
					</view>
				</view>
				<view class="space"></view>
			</scroll-view>
		</uni-popup>
	</view>
</template>

<script>
import { mapState,mapMutations } from 'vuex';
import { getShopHome,editCart,cleanCart} from '@/common/request.js';
export default {
	data() {
		return {
			shopinfo: {
				name:"",
				perCapita:0,
				score:0,
				monthSale:0,
				delivery:{				}
			},
			inited:false,//是否获得了店铺数据
			headHeight: 100,
			contentStyleHeight: 'height:500px',
			goodsList: [],
			sizeCalcState: false,
			tabScrollTop: 0,
			leftScrollTop: 0,
			currentId: 0,
			nunn:1,
			currentBeforeId: 0,
			currentAfterId: 0,
			categoryList: [],
			slist: [],
			mainCategoryMap:{},//主分类id索引
			cartNumber:{},//大分类对应商品数量
			cartInfo:{
				sumCart:0,
				sumPrice:0,
				sumDiscount:0,
				sumDeliveryMoney:0,
				dataList:[]
			},
			goodsSkusMap:{},//商品+规格map数据，用于购物车动态处理
			goodsCartNumber:{},//商品购物车总计
			skuDialogType:"center",
			cartDialogType:"bottom",
			isCartOpen:false,
			isCleanCart:false,
			skuGoods:{},
			skuGoodsSelected:"",
			skuCart:{}////多规格购物车数量统计
		};
	},
	watch: {
		hasLogin(){
			console.log("watch 登录状态改变,刷新当前页面");
			this.closeLoginDialog();
			//数据初始化,暂时只重新刷新购物车是最省资源
			setTimeout(()=>{
				this.getShopInfo();
			},100)
		}
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
		console.log("simple",this.userInfo)
		this.shopid = options.id;
		this.loadData();
	},
	computed: {
		...mapState(['hasLogin','userInfo', 'stationId'])
	},
	methods: {
		async loadData() {
			//加载店铺信息
			this.getShopInfo();
		},
		...mapMutations(["loginPage"]),
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
					this.inited = true;
					this.shopinfo = res.info;
					if (this.shopinfo.banner) {
						this.shopinfo.bannerBackground = 'background-image: url(' + this.shopinfo.banner + ');';
					}
					this.slist=[];
					this.mainCategoryMap={};
					if (res.goods_categories.length > 0) {
						//构造二级数据，如果没有，则为本身
						let cateMap = {};
						let catIndex = 0;
						res.goods_categories.forEach((ele, index) => {
							ele.cart=0;
							//主分类索引
							this.mainCategoryMap[ele.id]=index;
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
						//处理购物车信息
						let cartMap={};
						this.cartInfo.dataList=[];
						if(res.carts.length > 0){
							res.carts.forEach(ct=>{
								cartMap[ct.goods_id+"_"+ct.sku_id]=ct.amount;
							});
						}
						//需要按分类来分组联动，这里的商品,优先二级
						if (res.goods.length > 0) {
							console.log("cartMap",cartMap);
							res.goods.forEach((ele, index) => {
								//是否存在多规格
								ele["hasSku"]=ele.skus && ele.skus.length > 0;
								if(!this.skuCart[ele.id]){
									this.skuCart[ele.id]={};
								}
								//多规格
								if(ele.hasSku){
									ele["cart"] = 0;
									ele.skus.forEach(sku=>{
										let key=ele.id+"_"+sku.id;
										let cartI=0;
										//多规格购物车数量统计
										ele["cart"] += cartI = this.skuCart[ele.id][sku.id]= cartMap[key]?parseInt(cartMap[key]):0;//sku.cart?parseInt(sku.cart):0;
										this.goodsSkusMap[key]={
											goods_id:ele.id,
											sku_id:sku.id,
											src:ele.src,
											price:sku.price,
											originPrice:sku.originPrice?sku.originPrice:0,
											title:ele.title,
											subName:sku.name.replace("&gt;"," "),
											categories:ele.categories,
											cart:cartI
										}
									});
								}else{
									let key=ele.id+"_0";
									//单品购物车数量
									this.skuCart[ele.id][0] = ele["cart"] = cartMap[key]?parseInt(cartMap[key]):0;
									this.goodsSkusMap[key]={
										goods_id:ele.id,
										sku_id:0,
										src:ele.src,
										price:ele.price,
										originPrice:ele.originPrice?ele.originPrice:0,
										title:ele.title,
										subName:"",
										categories:ele.categories,
										cart:ele.cart
									}
								}
								//多分类
								if (ele.categories) {
									ele.categories.forEach((cate, cindex) => {
										//判断是否存在与二级分类中
										if (cate.id in cateMap) {
											let cmIndex = cateMap[cate.id];
											this.slist[cmIndex].goods.push(ele);
											//计算大分类上的商品数量
											if(!this.cartNumber[this.slist[cmIndex].pid]){
												this.cartNumber[this.slist[cmIndex].pid]={};
											}
											this.cartNumber[this.slist[cmIndex].pid][ele.id]=ele.cart;
										}
									});
								}
								this.goodsCartNumber[ele.id]=ele.cart;
								//console.log(this.goodsCartNumber[ele.id])
							});
							//console.log("skuCart",this.skuCart)
							//初始化购物车详细列表
							if(res.carts.length > 0){
								res.carts.forEach(ct=>{
									//加入到购物车数据列表
									this.updateCartDataList(ct.goods_id,ct.sku_id,ct.amount,true);
								});
							}
						}
						
						this.categoryList = res.goods_categories;
						//默认第一个选中
						this.currentId = this.categoryList[0].id;
						if (this.categoryList.length > 1) {
							this.currentAfterId= this.categoryList[1].id;
						}
						//统计所有主分类购物车数量
						this.getAllMainCategoryNumber();
						//计算购物车总数量
						this.getSumCartNumber();
					}
					this.$nextTick(() => {
						//延时执行，防止数据未渲染
						this.calculateContentHeight();
						//延时计算联动效果
						this.calcSize();
					})
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
		/**右侧分类滚动**/
		asideScroll(e) {
			let scrollTop = e.detail.scrollTop;
			let tabs = this.slist.filter(item => item.top <= scrollTop).reverse();
			if (tabs.length > 0) {
				this.currentId = tabs[0].pid;
				this.cateIndex(this.currentId);
			}
		},
		/**选中左侧分类**/
		cateIndex(id){
			let index = this.categoryList.findIndex(sitem => sitem.id === id);
			if (index > 0) {
				this.currentBeforeId = this.categoryList[index-1].id;
			}
			if (index < this.categoryList.length) {
				this.currentAfterId = this.categoryList[index + 1].id;
			}
			//没有作用，希望是滑动的分类小于4，能显示出来
			/* if(index < 4){
				this.leftScrollTop=1;
				console.log("leftScrollTop 0")
			} */
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
			console.log("单规格",number,id);
			let ginfo=id.split("_");
			let pid = parseInt(ginfo[0]);
			let gid = parseInt(ginfo[1]);
			let num = parseInt(number)*1;
			//调用多规格方法
			this.changeCartDataList(pid,gid,0,num);
		},
		/**多规格商品增减数量**/
		bindChangeSku(number,id){
			console.log("多规格",number,id,this.skuGoods.selectedSkuId)
			let ginfo=id.split("_");
			let pid = parseInt(ginfo[0]);
			let gid = parseInt(ginfo[1]);
			let num = parseInt(number);
			//统一处理
			this.changeCartDataList(pid,gid,this.skuGoods.selectedSkuId,num);
		},
		/**购物车商品增减数量**/
		bindChangeCart(number,id){
			console.log("购物车",number,id)
			let ginfo=id.split("_");
			//商品id
			let gid = parseInt(ginfo[0]);
			//型号id
			let sid = parseInt(ginfo[1]);
			//数量
			let num = parseInt(number);
			//找到商品对应多个主分类，最好是一个
			let goods = this.goodsSkusMap[gid+"_"+sid];
			let firstPid=0;
			goods.categories.forEach(cate=>{
				let index = this.mainCategoryMap[cate.id];
				if(index != -1){
					if(!firstPid){
						firstPid = cate.id;
						//统一处理
						this.changeCartDataList(cate.id,gid,sid,num);
					}else{
						//只更新数量
					}
				}
			})
		},
		/**统一处理修改购物车数量操作**/
		changeCartDataList(pid,gid,sid,num){
			//得到当前选中的skuid，往下传递的num，应该是所有规格的总数
			if(!this.skuCart[gid]){
				this.skuCart[gid]={};
			}
			if(this.skuCart[gid][sid] == num){
				console.log("多规格商品数量没有改变")
				return;
			}
			this.skuCart[gid][sid]=num;
			console.log(this.skuCart);
			//更新购物车数据列表
			this.updateCartDataList(gid,sid,num,false);
			//计算所有规格的总数
			let gnumber=0;
			for(let i in this.skuCart[gid]){
				gnumber+=this.skuCart[gid][i];
			}
			//商品的总数量
			this.changeGoodsCategoryCount(pid,gid,gnumber);
		},
		/**更新购物车数据列表**/
		updateCartDataList(id,sid,numb,isInit){
			if(!isInit){
				//有修改数据，更新到服务器
				this.saveCartAmount(id,sid,numb);
			}
			let key = id+"_"+sid;
			//判断是否已经存在
			let index = this.cartInfo.dataList.findIndex(sitem => sitem.key == key);
			if(index == -1){
				console.log("新增购物车data列表")
				let goods = this.goodsSkusMap[key];
				goods["key"]=key;
				goods["cart"]=numb;
				goods["cutPrice"]=0;
				this.cartInfo.dataList.push(goods);
			}else if(numb < 1){
				console.log("删除购物车data列表",index)
				//删除
				this.cartInfo.dataList.splice(index,1);
				console.log("剩余",this.cartInfo.dataList.length);
			}else{
				console.log("更新购物车data列表",index)
				this.cartInfo.dataList[index].cart=numb;
			}
		},
		/**打开sku选择弹窗**/
		openSkus(item,pid){
			if(!this.hasLogin){
				this.showLoginDialog();
				return;
			}
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
				nameMap[sku.name]=sku;
			})
			//默认第一个规格的选中次数
			item["cart"]=0;
			item["catPid"]=pid;
			item["skuNameIds"]=nameMap;
			item["skuNameMap"]=skuMap;
			this.skuGoods = item;
			//默认选中第一个
			this.selectSku(0,0);
			//延时打开
			this.$nextTick(() => {
				this.$refs['showsku'].open();
			})
		},
		/**单商品和多规格商品统一更改数量统计**/
		changeGoodsCategoryCount(pid,gid,number){
			if(!this.cartNumber[pid]){
				this.cartNumber[pid]={};
			}
			this.cartNumber[pid][gid]=number;
			this.getMainCategoryNumber(pid);
			//商品总量
			this.goodsCartNumber[gid]=number;
			console.log("goodsCartNumber",this.goodsCartNumber[gid])
			//所有分类的数量
			this.getSumCartNumber();
		},
		//更新购物车数据到服务器
		saveCartAmount(gid,sku,number){
			if(+number == 0 && this.isCleanCart){
				console.log("不请求数据")
				return;
			}
			this.isCleanCart = false;
			editCart({
				id:this.shopid,
				stationId: this.stationId,
				goods_id:gid,
				sku_id:sku,
				amount:number
			}).then(res=>{
				console.log(res)
			});
		},
		/**计算主分类总数量**/
		getMainCategoryNumber(pid){
			let sum = 0;
			//更新大分类数量
			for(let i in this.cartNumber[pid]){
				sum+=this.cartNumber[pid][i];
			}
			let index = this.mainCategoryMap[pid];
			//let index = this.categoryList.findIndex(sitem => sitem.id === pid);
			if(index < 0){
				return;
			}
			//console.log(sum)
			this.categoryList[index]["cart"]=sum;
		},
		/**计算主所有分类总数量**/
		getAllMainCategoryNumber(){
			for(let pid in this.cartNumber){
				this.getMainCategoryNumber(pid);
			}
		},
		/**计算购物车总数量**/
		getSumCartNumber(){
			let sumCount=0;
			let sumPrice=0;
			let sumDiscount=0;
			let sumDeliveryMoney=this.shopinfo.delivery.money;
			this.cartInfo.dataList.forEach(goods=>{
				//商品数量
				sumCount+=goods.cart;
				//总价=单价*数量
				sumPrice+=goods.price * goods.cart;
				//总优惠
				if(goods.originPrice && goods.originPrice > goods.price){
					sumDiscount+=(goods.originPrice - goods.price)*goods.cart;
				}
			});
			//如果店铺存在满多少免运费
			if(+this.shopinfo.deliveryFreeMoney > 0 && this.shopinfo.deliveryFreeMoney <= sumPrice){
				sumDeliveryMoney = 0;
			}
			//如果店铺存在满减运费,则减少相应的运费
			if(+this.shopinfo.deliveryMinusMoney > 0 && this.shopinfo.deliveryMinusMoney <= sumPrice){
				let money = this.shopinfo.delivery.money - this.shopinfo.deliveryMinusMoney;
				sumDeliveryMoney = money > 0 ? money:0;
			}
			this.cartInfo.sumCart = sumCount;
			this.cartInfo.sumPrice = sumPrice;
			this.cartInfo.sumDiscount = sumDiscount;
			this.cartInfo.sumDeliveryMoney = sumDeliveryMoney;
			//判断是否达到起送金额
			if(this.shopinfo.deliveryMin > this.cartInfo.sumPrice){
				
			}
		},
		/**关闭sku选择弹窗**/
		closeSkuDialog(){
			this.$refs['showsku'].close()
		},
		/**规格选择**/
		selectSku(index,index2){
			console.log("selectSku")
			this.skuGoods.skuNameMap[index].active=index2;
			//更新已选择规格
			let names=[];
			this.skuGoods.skuNameMap.forEach(skuname=>{
				names.push(skuname["child"][skuname.active]);
			});
			//匹配skuid
			let selectSku = this.skuGoods["skuNameIds"][names.join("&gt;")];
			this.skuGoods["selectedSkuId"]=selectSku.id;
			//更新商品价格
			this.skuGoods["showPrice"] = selectSku.price;
			this.skuGoods["showOriginPrice"] = selectSku.originPrice? selectSku.originPrice:0;
			//console.log(this.skuGoods)
			this.skuGoodsSelected = names.join("、");
		},
		change(e) {
			console.log('是否打开:' + e.show)
		},showLoginDialog(){
			//登录提示框
			console.log("showLoginDialog")
			this.$refs['showlogin'].open();
		},closeLoginDialog(){
			this.$refs['showlogin'].close();
		},
		/**清空购物车数据**/
		cleanAllCart(){
			cleanCart({
				id:this.shopid,
				stationId: this.stationId
			}).then(res=>{
				console.log(res)
			});
			this.isCleanCart = true;
			//清空临时数据
			this.cartInfo={
				sumCart:0,
				sumPrice:0,
				sumDiscount:0,
				sumDeliveryMoney:0,
				dataList:[]
			}
			//大分类+商品对应数量
			this.cartNumber={};
			//多规格商品统计
			//this.skuCart={};
			for (let sg in this.skuCart) {
				for(let i in this.skuCart[sg]){
					this.skuCart[sg][i]=0;
				}
			}
			//清理商品数量统计
			this.goodsCartNumber={};
			//清理主分类数量
			this.categoryList.forEach(c=>{
				c.cart=0;
			});
			//关闭列表
			this.openCartDialog();
		},
		/**打开购物车pop**/
		openCartDialog(){
			if(this.isCartOpen){
				this.$refs['showcart'].close();
			}else{
				this.$nextTick(()=>{
					this.$refs['showcart'].open();
				})
			}
		},changeCartList(e){
			setTimeout(()=>{
				this.isCartOpen = e.show;
			},200);
			console.log('是否打开cartList:' + e.show)
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
				color: $font-color-emphasis;
				border: 1px solid $font-color-emphasis;
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
		padding-top: 160upx;
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
	}
	&.before {
		border-radius: 0 0 10px 0;
	}
	&.after {
		border-radius: 0 10px 0 0;
	}
}

.right-aside ,.cart-list{
	flex: 1;
	overflow: hidden;
	padding:2upx 18upx 0;
	height: 100%;
	.space {
		padding-top: 160upx;
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
		flex-shrink: 0;
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
			font-size: $font-base;
			color: $font-color-dark;
			line-height: 1.1;
			font-weight: 400;
		}
		.desc2{
			padding: 4upx 0 0;
		}
		
		.buttons {
			margin-top: 6upx;
			display: flex;
			justify-content: space-between;
			.empty{
				flex: 1;
			}
		}
	}
}
.m-l {
	margin-left: 10upx;
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
/**选规格**/
$box-height: 60upx;
.sku_button{
	width: 80upx;
	height: $box-height;
	flex: 1;
	text-align: right;
	position: relative;
	.sku_btn{
		background: $btn-color-light;
		color: $font-color-dark;
		padding: 12upx 16upx 12upx;
		border-radius: 30upx;
		display: inline-block;
		font-size: $font-ssm;
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
	padding: 30upx 20upx;
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
		margin: 20upx -20upx;
		padding: 12upx 20upx;
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
.loginDialog{
	background: #ffffff;
	width: 520upx;
	border-radius: 20upx;
	padding: 30upx 20upx;
	font-size: $font-base;
	text-align: center;
	image{
		width: 200upx;
		height: 200upx;
	}
	.notice{
		padding: 20upx 0 40upx;
	}
	.btn{
		padding: 10upx 30upx;
		background: #ffffff;
		border-radius: 20upx;
	}
	.btn_ok{
		background: $btn-color-light;
	}
}
.cart{
	$bg-color:#1c1819;
	position: fixed;
	left: 25upx;
	bottom: 60upx;
	background: none;
	z-index: 100;
	font-size: $font-sm;
	width: 700upx;
	border-radius: 60upx;
	color: #fff;
	height: 90upx;
	.weui-flex{
		align-items: stretch;
	}
	.settleMoney{
		background: $bg-color;
		.weui-flex{
			align-items: center;
		}
		.img{
			position: relative;
			margin-right: 16upx;
		}
		image{
			width: 80upx;
			height: 80upx;
		}
	}
	.price{
		color: #ffffff;
		line-height: 1.2;
	}
	.delivery{
		line-height: 1.2;
	}
	.sub_number{
		top: 18upx;
		right: 18upx;
		background:none;
	}
	.btn{
		padding:0 24upx;
		align-items: center;
		display: flex;
		background: $bg-color;
		border-radius: 60upx 0 0 60upx;
	}
	.btn_tel{
		margin-right: 4upx;
	}
	.btn_ok{
		background: $btn-color-light;
		border-radius: 0 60upx 60upx 0;
		color: $font-color-dark;
	}
	.notice{
		text-align: center;
		background: #fffbf2;
		width: 432upx;
		margin: 0 auto;
		color: #333;
		padding: 4upx;
		position: absolute;
		top: -40upx;
		left: 142upx;
	}
}
.cart-list-title{
	background: #fff;
	display: flex;
	justify-content:flex-end;
	padding: 20upx 40upx;
	font-size: $font-ssm;
}
.cart-list{
	height: 670upx;
	background: #fff;
	padding: 6upx;
}
</style>
