<template>
	<view class="container">
		<view class="user-section" v-if="isLoaded">
			<image class="bg" src="/static/user-bg2.jpg"></image>
			<view class="user-info-box">
				<view class="portrait-box" @click="previewAvatar"><image class="portrait" :src="userInfo.avatar"></image></view>
				<view class="info-box" @click="navTo('/pages/userinfo/userinfo')">
					<text class="username">{{ userInfo.nickname }}</text>
					<view class="account">
						<text>{{userInfo.id}}</text>
					</view>
				</view>
			</view>
			<!-- <view class="vip-card-box">
				<image class="card-bg" src="/static/vip-card-bg.png" mode=""></image>
				<view class="b-btn" v-if="!userInfo.vip" @click="openVip">
					<block v-if="freeVip">
						<text class="price del">{{vipPrice}}/年</text>
						<text>限时免费</text>
					</block>
					<block v-else>
						<text class="price">{{vipPrice}}/年</text>
						<text>去开通</text>
					</block>
				</view>
				<view class="tit">
					<text class="yticon icon-iLinkapp-"></text>
					<text>会员</text>
				</view>
				<text class="e-m"></text>
				<text class="m-l" v-if="userInfo.vip">卡号:{{userInfo.id}}</text>
				<text class="e-b" v-else>开通会员享受会员专属价格</text>
			</view> -->
		</view>

		<view class="cover-container"  v-if="isLoaded">
			<image class="arc" src="/static/arc.png"></image>

			<view class="tj-sction">
				<view class="tj-item">
					<text class="num">{{ userInfo.balance }}</text>
					<text>余额</text>
				</view>
				<view class="tj-item">
					<text class="num">{{ userInfo.coupons }}</text>
					<text>优惠券</text>
				</view>
				<view class="tj-item">
					<text class="num">{{ userInfo.score }}</text>
					<text>积分</text>
				</view>
			</view>
			<!-- 订单 -->
			<view class="order-section">
				<view class="order-item" @click="navTo('/pages/order/order?state=0')" hover-class="common-hover" :hover-stay-time="50">
					<text class="yticon icon-shouye"></text>
					<text>全部订单</text>
				</view>
				<view class="order-item" @click="navTo('/pages/order/order?state=1')" hover-class="common-hover" :hover-stay-time="50">
					<text class="yticon icon-daifukuan">
						<text class="sub" v-if="order.unpaid > 0">{{ order.unpaid }}</text>
					</text>
					<text>待付款</text>
				</view>
				<view class="order-item" @click="navTo('/pages/order/order?state=2')" hover-class="common-hover" :hover-stay-time="50">
					<text class="yticon icon-yishouhuo">
						<text class="sub" v-if="order.receive > 0">{{ order.receive }}</text>
					</text>
					<text>待收货</text>
				</view>
				<view class="order-item" @click="navTo('/pages/order/order?state=4')" hover-class="common-hover" :hover-stay-time="50">
					<text class="yticon icon-shouhoutuikuan">
						<text class="sub" v-if="order.refund > 0">{{ order.refund }}</text>
					</text>
					<text>退款/售后</text>
				</view>
			</view>
			<!-- 管理的店铺列表 -->
			<view class="admin-section" v-if="admin && admin.length > 0">
				<view class="title">
					<text>我的门店</text>
				</view>
				<view v-for="(item,index) in admin" :key="index" class="admin-shops b-b" @click="navToShopAdmin(item)">
					<image :src="item.src" mode="aspectFill"></image>
					<view class="right">
						<view class="content">
							<view class="title">
								<text>{{item.name}}</text>
							</view>
							<view class="orders" v-if="item.order">
								<view class="" @click.stop="navToShopOrder(item,'unpaid')">
									<text class="num">{{item.order.unpaid || 0}}</text>
									<text>待付款</text>
								</view>
								<view class="" @click.stop="navToShopOrder(item,'payup')">
									<text class="num">{{item.order.payup || 0}}</text>
									<text>待发货</text>
								</view>
								<view class="" @click.stop="navToShopOrder(item,'refunded')">
									<text class="num">{{item.order.refunded || 0}}</text>
									<text>退款/售后</text>
								</view>
							</view>
						</view>
						<text class="yticon icon-you"></text>
					</view>
				</view>
			</view>
			
			<!-- 浏览历史 -->
			<view class="history-section icon">
				<block v-if="hasVisiteGoods">
					<!-- 如果是游客，则本地缓存，否则是获取网络 -->
					<view class="sec-header">
						<text class="yticon icon-lishijilu"></text>
						<text>浏览历史</text>
					</view>
					<scroll-view scroll-x class="h-list">
						<view v-for="(item, index) in visiteGoodsList" :key="index" class="h-list-image">
							<image :src="item.src" @click="navToGoods(item)" mode="aspectFill"></image>
						</view>
					</scroll-view>
				</block>
				<!-- <mix-list-cell icon="icon-iconfontweixin" iconColor="#e07472" title="我的钱包" tips="您的会员还有3天过期"></mix-list-cell> -->
				<mix-list-cell icon="icon-dizhi" iconColor="#5fcda2" title="地址管理" @eventClick="navTo('/pages/address/address')"></mix-list-cell>
				<mix-list-cell icon="icon-share" iconColor="#9789f7" title="分享" tips="邀请好友赢10万大礼"></mix-list-cell>
				<mix-list-cell icon="icon-tuandui" iconColor="#00aa00" title="团队" :tips="teamTips"  @eventClick="joinTeam()"></mix-list-cell>
				<mix-list-cell icon="icon-shoucang_xuanzhongzhuangtai" iconColor="#54b4ef" title="我的收藏"></mix-list-cell>
				<!-- #ifndef MP -->
				<!-- 小程序不需要退出登录，更新，缓存等 -->
				<mix-list-cell icon="icon-shezhi1" iconColor="#e07472" title="设置" border="" @eventClick="navTo('/pages/set/set')"></mix-list-cell>
				<!-- #endif -->
			</view>
		</view>
		<uni-popup ref="vipPopup" type="center">
			<view class="vipPopup">
				<view class="list-cell">
					<view class="cell-tit"><input type="tel" v-model="vipnumber" placeholder="请输入邀请者会员卡号" maxlength="11" /></view>
					<view class="cell-tit-right"><button type="default" @click="checkVip">确定</button></view>
				</view>
			</view>
		</uni-popup>
		<uni-popup ref="invitePopup" type="center">
			<view class="vipPopup">
				<view class="list-cell">
					<view class="cell-tit"><input type="tel" v-model="inviteNumber" placeholder="请输入团队编号" maxlength="11" /></view>
					<view class="cell-tit-right"><button type="default" @click="addInvite()">确定</button></view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>
<script>
import { getGoodsVisites, getUserStatistics,saveUserInfo, cronCancelOrders } from '@/common/request.js';
import { navToGoodsItemPage } from '@/common/functions.js';
import { mapState, mapMutations } from 'vuex';
let startY = 0,
	moveY = 0,
	pageAtTop = true;
export default {
	data() {
		return {
			isLoaded: false,
			coverTransform: 'translateY(0px)',
			coverTransition: '0s',
			vipnumber:"",
			inviteNumber:"",
			freeVip:false,
			vipPrice:88,
			hasVisiteGoods: false,
			visiteGoodsList: [],
			order: {
				unpaid: 0,
				payup: 0,
				delivered: 0,
				receive: 0,
				refund: 0
			},
			admin:[],
			teamTips:"加入团队",
			moving: false
		};
	},
	onLoad() {
		this.loadData();
	},
	//下拉刷新
	onPullDownRefresh() {
		console.log('刷新整页');
		uni.stopPullDownRefresh();
		this.loadData();
	},
	// #ifndef MP
	onNavigationBarButtonTap(e) {
		const index = e.index;
		if (index === 0) {
			this.navTo('/pages/set/set');
		} else if (index === 1) {
			// #ifdef APP-PLUS
			const pages = getCurrentPages();
			const page = pages[pages.length - 1];
			const currentWebview = page.$getAppWebview();
			currentWebview.hideTitleNViewButtonRedDot({
				index
			});
			// #endif
			uni.navigateTo({
				url: '/pages/notice/notice'
			});
		}
	},
	watch: {
		hasLogin() {
			console.log('watch 登录状态改变,刷新当前页面');
			setTimeout(() => {
				this.loadData();
			}, 100);
		}
	},
	// #endif
	computed: {
		...mapState(['hasLogin','shopId', 'userInfo'])
	},
	methods: {
		...mapMutations(['login','logout']),
		async loadData() {
			this.isLoaded = true;
			console.log("加载用户信息",this.hasLogin)
			if (this.hasLogin) {
				/* cronCancelOrders()
					.then(res => {
						console.log('清理过期订单', res);
					})
					.catch(err => {
						console.log(err);
					}); */
				//自己的信息
					//this.userInfo = res;
					//this.order = res.order;
					//this.login(res);
					getUserStatistics({}).then(res=>{
						//免费会员期限
						this.freeVip = res.lastFreeVip>res.time;
						//会员价格/年费
						this.vipPrice = res.vipPrice; 
						this.admin = res.admin;
						if (res.order) {
							//-1:canceled已取消，0:unpaid未付款，1:payup已付款，2:delivered已发货，3:received已收货，4:estimated已评价，refunded退款
							for (let t in res.order) {
								this.order[t] = res.order[t];
							}
							this.order.receive = this.order.payup + this.order.delivered;
						} else {
							for (let t in this.order) {
								this.order[t] = 0;
							}
						}
					})
					
					if(this.userInfo.invite > 0){
						this.teamTips="已加入团队:"+this.userInfo.invite;
					}
				getGoodsVisites({}).then(
					res => {
						this.hasVisiteGoods = true;
						this.visiteGoodsList = res;
					},
					err => {
						this.hasVisiteGoods = false;
						this.visiteGoodsList = [];
					}
				);
			}else{
				this.hasVisiteGoods = false;
				this.visiteGoodsList = [];
				for (let t in this.order) {
					this.order[t] = 0;
				}
				this.teamTips="加入团队";
			}
		},
		previewAvatar() {
			if (!this.hasLogin) {
				this.navTo("");
				return;
			}
			uni.previewImage({
				indicator:"none",
				urls:[
					this.userInfo.avatar
				]
			})
		},
		navToGoods(item) {
			item.id = item.goods_id;
			navToGoodsItemPage(item);
		},
		/**
		 * 统一跳转接口,拦截未登录路由
		 * navigator标签现在默认没有转场动画，所以用view
		 */
		navTo(url) {
			if (!this.hasLogin) {
				url = '/pages/public/login';
			}
			uni.navigateTo({
				url
			});
		},
		//开通会员，限时免费开通1年
		openVip(){
			if (!this.hasLogin) {
				this.navTo("");
				return;
			}
			saveUserInfo({
				channel:"free"
			},"vip").then(res=>{
				this.loadData();
				this.$api.msg("开通成功",1500,true,"success");
			},err=>{
				this.$api.msg(err.message)
			});
			//this.$refs.vipPopup.open();
		},
		//检查会员卡号是否正确,绑定邀请关系
		checkVip(){
			let n = +this.vipnumber;
			if(n>1){
				this.$refs.vipPopup.close();
				saveUserInfo({
					fuid:n
				},"vip").then(res=>{
					this.loadData();
					this.$api.msg("开通成功",1500,true,"success");
				},err=>{
					this.$api.msg(err.message)
				});
			}else{
				this.$api.msg("输入错误!")
			}
		},
		//加入团队/设置邀请者
		joinTeam(){
			if (!this.hasLogin) {
				this.navTo("");
				return;
			}
			if(this.userInfo.invite > 0){
				//跳转团队信息
				/* uni.navigateTo({
					url:"./team"
				}) */
			}else{
				this.$refs.invitePopup.open();
			}
		},
		addInvite(){
			let n = +this.inviteNumber;
			if(n>1){
				this.$refs.invitePopup.close();
				saveUserInfo({
					fuid:n
				},"invite").then(res=>{
					this.loadData();
					this.$api.msg("加入成功",1500,true,"success");
				},err=>{
					this.$api.msg(err.message)
				});
			}else{
				this.$api.msg("输入错误!")
			}
		},
		//店铺管理界面
		navToShopAdmin(item){
			let id = item.id;
			uni.setStorage({
				key:"adminShopInfo",
				data:item
			});
			uni.navigateTo({
				url:`/pages/admin/admin?shopid=${id}`
			})
		},
		//店铺订单类型页面,进入店铺之后，再跳转订单页面
		navToShopOrder(item,state){
			let id = item.id;
			uni.setStorage({
				key:"adminShopInfo",
				data:item
			});
			uni.navigateTo({
				url:`/pages/admin/admin?shopid=${id}&second=order/list&state=${state}`
			})
			
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

.user-section {
	height: 520upx;
	height: 360upx;
	padding: 100upx 30upx 0;
	position: relative;
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
	height: 180upx;
	display: flex;
	align-items: center;
	position: relative;
	z-index: 1;
	.portrait {
		width: 130upx;
		height: 130upx;
		border: 5upx solid #fff;
		border-radius: 50%;
		margin-right: 20upx;
	}
	.username {
		font-size: $font-lg + 6upx;
		color: $font-color-dark;
	}
	.account{
		font-size: $font-base;
		color: $border-color-light;
	}
}

.vip-card-box {
	display: flex;
	flex-direction: column;
	color: #f7d680;
	height: 240upx;
	background: linear-gradient(to right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8));
	border-radius: 16upx 16upx 0 0;
	overflow: hidden;
	position: relative;
	padding: 20upx 24upx;
	.card-bg {
		position: absolute;
		top: 20upx;
		right: 0;
		width: 380upx;
		height: 260upx;
	}
	.b-btn {
		position: absolute;
		right: 20upx;
		top: 16upx;
		height: 40upx;
		text-align: center;
		line-height: 40upx;
		font-size: 22upx;
		color: #36343c;
		border-radius: 20px;
		background: linear-gradient(to right, #f9e6af, #ffd465);
		z-index: 1;
		padding: 0 8upx;
		.price{
			font-size: 22upx;
		}
	}
	.tit {
		font-size: $font-base + 2upx;
		color: #f7d680;
		margin-bottom: 28upx;
		.yticon {
			color: #f6e5a3;
			margin-right: 16upx;
		}
	}
	.e-b {
		font-size: $font-sm;
		color: #d8cba9;
		margin-top: 10upx;
	}
	.m-l{
		margin-left: 20upx;
	}
}
.cover-container {
	background: $page-color-base;
	margin-top: -60upx;
	padding: 0 30upx;
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
.tj-sction {
	@extend %section;
	.tj-item {
		@extend %flex-center;
		flex-direction: column;
		height: 140upx;
		font-size: $font-sm;
		color: #75787d;
		flex: 1;
	}
	.num {
		font-size: $font-lg;
		color: $font-color-dark;
		margin-bottom: 8upx;
	}
}
.order-section {
	@extend %section;
	padding: 28upx 0;
	margin-top: 20upx;
	.order-item {
		@extend %flex-center;
		width: 120upx;
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
}
.history-section {
	padding: 30upx 0 0;
	margin-top: 20upx;
	background: #fff;
	border-radius: 10upx;
	.sec-header {
		display: flex;
		align-items: center;
		font-size: $font-base;
		color: $font-color-dark;
		line-height: 40upx;
		margin-left: 30upx;
		.yticon {
			font-size: 44upx;
			color: #5eba8f;
			margin-right: 16upx;
			line-height: 40upx;
		}
	}
	.h-list {
		white-space: nowrap;
		padding: 30upx 30upx 0;
		.h-list-image {
			display: inline-block;
			margin-right: 20upx;
			image {
				width: 160upx;
				height: 160upx;
				border-radius: 4%;
			}
		}
	}
}
.vipPopup{
	font-size: $font-base;
	background: #FFFFFF;
	width: 700upx;
	padding: 20upx;
	border-radius: 12upx;
	.list-cell{
		display: flex;
		align-items: center;
	}
	.cell-tit{
		flex: 1;
	}
}
.admin-section{
	padding: 30upx 0 0 30upx;
	margin-top: 20upx;
	background: #fff;
	border-radius: 10upx;
	font-size: $font-base;
	.admin-shops{
		display: flex;
		margin-top: 20upx;
		position: relative;
		padding-bottom: 20upx;
		//align-items: center;
		padding-right: 30upx;
		&:last-child::after{
			display: none;
		}
	}
	.right{
		display: flex;
		align-items: center;
		flex: 1;
	}
	image{
		width: 120upx;
		height: 120upx;
		border-radius: 4%;
		margin-right: 20upx;
	}
	.title{
		font-size: $font-lg;
	}
	.content{
		flex: 1;
		margin-right: 20upx;
	}
	.orders{
		display: flex;
		justify-content: space-between;
		padding-top: 12upx;
		view{
			display: flex;
			flex-direction: column;
			text-align: center;
		}
	}
	.num{
		color: $font-color-warning;
	}
}
</style>
