<template>
	<view class="container">
		<!-- 顶部筛选 分类栏 -->
		<view class="top">
			<!-- 排序 -->
			<view class="sort-bar row">
				<view class="sort-bar-item row center" :class="{active: item.current, last: index === sortList.length-1}" v-for="(item,index) in sortList"
				 :key="index" @click="changeSort(item)">
					<text>{{ item.name }}</text>
				</view>
			</view>
		</view>
		<empty v-if="loaded === true && dataList.length === 0"></empty>
		<view class="users-section">
			<view v-for="(item,index) in dataList" :key="index" class="item-1">
				<view class="item">
					<view class="image-content">
						<image :src="item.user.avatar" mode="aspectFill" lazy-load="true"></image>
					</view>
					<view class="content">
						<view class="flex align-center">
							<text class="price">{{item.money | toFixed}}</text>
							<text class="text-sm margin-left-sm flex-sub">{{item.message}}</text>
						</view>
						<view class="title clamp">
							<text v-if="item.user.nickname">{{ item.user.nickname }}</text>
							<text v-else>游客<text class="sub">（未修改）</text></text>
							<text v-if="item.user.wx_openid" class="yticon icon-weixin"></text>
							<text v-if="item.user.ali_openid" class="yticon icon-alipay"></text>
							<text class="sub" v-if="item.user.id">（{{item.user.id}}）</text>
						</view>
						<view class="fields">
							<view class="field-content">
								<text>余额：</text>
								<text>{{item.user.balance | toFixed}}</text>
							</view>
						</view>
						<view class="">
							<text>手机号：</text>
							<text v-if="item.user.mobile" @click="tel(item.user.mobile)">{{item.user.mobile}}</text>
							<text v-else>未绑定</text>
						</view>
						<view class="">
							<text>登录时间：</text>
							<text v-if="item.user.last_login_date > 0">{{item.user.last_login_date | dateFormat('yyyy-MM-dd hh:mm:ss')}}</text>
							<text v-else>无记录</text>
						</view>
						<view class="">
							<text>注册时间：</text>
							<text v-if="item.user.register_date > 0">{{item.user.register_date | dateFormat('yyyy-MM-dd hh:mm:ss')}}</text>
							<text v-else>无记录</text>
						</view>
						<view class="">
							<text>申请时间：</text>
							<text v-if="item.created > 0">{{item.created | dateFormat('yyyy-MM-dd hh:mm:ss')}}</text>
						</view>
					</view>
				</view>
				<view class="action-box b-t">
					<button class="action-btn" @click.stop="navTo('/pages/admin/cashout/balancelog?id='+item.user._id)">日志</button>
					<block v-if="item.state > -2 && item.state < 2">
						<button class="action-btn recom" @click.stop="pass(item,index)">通过</button>
						<button class="action-btn warning" @click.stop="refuse(item,index)">拒绝</button>
						<button class="action-btn" @click.stop="finish(item,index)">线下支付</button>
					</block>
				</view>
			</view>
		</view>
		<uni-load-more :status="loadingType"></uni-load-more>
	</view>
</template>

<script>
	import {
		cashoutAdmin,
	} from '@/common/admin_request.js';
	import {
		cashoutState,
	} from '@/common/functions.js';
	export default {
		data() {
			return {
				sortList: [{
						name: '所有',
						type: "all",
						current: true
					},
					{
						name: '申请中',
						type: "applying",
						current: false
					},
					{
						name: '通过',
						type: "passed",
						current: false
					},
					{
						name: '成功',
						type: "success",
						current: false
					},
					{
						name: '失败',
						type: "failed",
						current: false
					},
					{
						name: '拒绝',
						type: "refuse",
						current: false
					}
				],
				listType: 'column', //列表类型 column竖向列表 row 横向列表
				dataList: []
			}
		},
		//滑到底部加载更多
		onReachBottom() {
			if (this.loadingType != 'noMore') {
				this.loadData();
			}
		},
		onLoad() {
			this.loadData();
		},
		methods: {
			//排序
			changeSort(item) {
				if (item.current) {
					return;
				} else {
					this.sortList.forEach(v => v.current = false);
					item.current = true;
				}
				this.refreshList();
			},
			loadData() {
				this.loadingType = 'loading';
				this.page++;
				cashoutAdmin("list", {
					page: this.page,
					limit: this.limit,
					state: this.sortList.filter(item => item.current)[0].type,
				}, false).then(res => {
					this.loaded = true;
					res.forEach(usr => {
						cashoutState(usr);
						if (!usr.user.avatar) {
							usr.user.avatar = "/static/missing-face.png";
						}
					})
					this.dataList = this.dataList.concat(res);
					if (res.length < this.limit) {
						this.loadingType = "noMore";
					}
				}, err => {
					this.loaded = true;
					this.loadingType = "noMore";
				})
			},
			refreshList() {
				this.page = 0;
				this.dataList = [];
				this.loadData();
			},
			pass(item, index) {
				this.dataList[index].state = 1
				cashoutAdmin("save", {
					id: item._id,
					state: "pass",
				}, true).then(res => {
					this.refreshList();
				})
			},
			refuse(item, index) {
				this.dataList[index].state = -2
				cashoutAdmin("save", {
					id: item._id,
					state: "refuse",
				}, true).then(res => {
					this.refreshList();
				})
			},
			finish(item, index) {
				this.dataList[index].state = 2
				cashoutAdmin("save", {
					id: item._id,
					state: "finish",
				}, true).then(res => {
					this.refreshList();
				})
			},
		}
	}
</script>

<style lang="scss">
	page {
		background-color: $background-color;
	}

	.container {
		font-size: $font-base;
		background-color: $background-color;
		padding: 0 20rpx 20rpx;
		position: relative;
	}

	.title {
		font-size: $font-lg;

		.sub {
			font-size: $font-sm;
			margin-left: 8rpx;
		}
	}

	.item-1 {
		background-color: #FFFFFF;
		margin-bottom: 20rpx;
		padding: 20rpx 20rpx 0rpx;
		border-radius: 10rpx;
	}

	.item {
		display: flex;
		background-color: #FFFFFF;
		padding-bottom: 10rpx;
	}

	.fields {
		display: flex;
		justify-items: center;

		.field-content {
			flex: 1;
		}
	}

	.button {
		background-color: $base-color;
		color: #FFFFFF;
		padding: 4rpx 8rpx;
		border-radius: 8rpx;
		font-size: $font-sm;
	}

	$width:140rpx;

	.image-content {
		width: $width;
		height: $width;
		margin-right: 12rpx;
		border-radius: 50%;
		overflow: hidden;

		image {
			width: $width;
			height: $width;
			border-radius: 50%;
		}
	}

	.content {
		flex: 1;
	}

	.top {
		position: fixed;
		left: 0;
		width: 100%;
		z-index: 95;
		background-color: #fff;
	}

	.sort-bar {
		justify-content: space-around;
		height: 76rpx;
		padding: 4rpx 0 4rpx 4rpx;
		/* #ifdef MP */
		padding-left: 10rpx;
		/* #endif */
		background-color: #fff;
		position: relative;
		z-index: 1;
		display: flex;
		margin: 0;

		.sort-bar-item {
			flex: 1;
			height: 100%;
			font-size: 28rpx;
			color: #333;
			position: relative;
			overflow: hidden;

			&.active {
				color: $base-color;
				font-weight: 700;

				&:after {
					position: absolute;
					left: 50%;
					bottom: 0;
					transform: translateX(-28rpx);
					content: '';
					width: 56rpx;
					height: 4rpx;
					background-color: $base-color;
					border-radius: 10px;
				}

				.mix-icon.active {
					color: $base-color;
				}
			}

			/* #ifdef MP */
			&.last:before {
				content: '';
				position: absolute;
				right: 0;
				top: 50%;
				transform: translateY(-50%);
				width: 2rpx;
				height: 40rpx;
				box-shadow: 0 0 16rpx rgba(0, 0, 0, .6);
			}

			/* #endif */
		}

		.icon-wrap {
			display: flex;
			flex-direction: column;
			padding-left: 8rpx;
		}

		.yticon {
			font-size: 14rpx;
			color: #bbb;
		}

		.btn {
			height: 68rpx;
			padding-left: 16rpx;
			padding-right: 20rpx;

			.icon-hengxiangliebiao,
			.icon-shuxiangliebiao {
				font-size: 40rpx;
				color: #333;
			}
		}
	}

	.users-section {
		padding-top: 86rpx;
	}

	.icon-wrap {
		display: flex;
		flex-direction: column;
		padding-left: 8rpx;

		.yticon {
			font-size: 14rpx;
			color: #bbb;
		}

		.active {
			color: $base-color;
		}
	}

	.icon-weixin {
		color: $base-color;
		margin-left: 8rpx;
	}

	.icon-alipay {
		color: $font-color-spec;
		margin-left: 8rpx;
	}

	.titleNview-placing {
		height: var(--status-bar-height);
		padding-top: 80rpx;
		box-sizing: content-box;
	}

	.action-box {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		height: 100upx;
		position: relative;
		padding-right: 30upx;
	}

	.action-btn {
		height: 60upx;
		margin: 0;
		padding: 0 30upx;
		margin-left: 24upx;
		text-align: center;
		line-height: 60upx;
		font-size: $font-sm + 2upx;
		color: $font-color-dark;
		background: #fff;
		border-radius: 100px;

		.time {
			width: 72upx;
			display: inline-block;
		}

		&:after {
			border-radius: 100px;
		}

		&.recom {
			background: $base-color;
			color: #fff;
		}

		&.warning {
			background: $btn-color-warning;
			color: #fff;
		}
	}

	.price {
		font-size: 60rpx;
	}
</style>
