<template>
	<view class="container">
		<!-- 顶部筛选 分类栏 -->
		<view class="top">
			<!-- 排序 -->
			<view class="sort-bar row">
				<view class="item row center" :class="{active: item.current, last: index === sortList.length-1}" v-for="(item,index) in sortList"
				 :key="index" @click="changeSort(item)">
					<text>{{ item.name }}</text>
					<view v-if="item.isPrice" class="icon-wrap">
						<text class="yticon icon-shang" :class="{active: item.type === 3}"></text>
						<text class="yticon icon-xia" :class="{active: item.type === 4}"></text>
					</view>
				</view>
			</view>
		</view>
		<view class="users-section">
			<view v-for="(item,index) in userList" :key="index" class="item">
				<view class="image-content">
					<image :src="item.avatar" mode="aspectFill" lazy-load="true"></image>
				</view>
				<view class="content">
					<view class="title clamp">
						<text v-if="item.nickname">{{ item.nickname }}</text>
						<text v-else>游客<text class="sub">(未修改)</text></text>
						<text v-if="item.wx_openid" class="sub">微信登录</text>
					</view>
					<view class="fields" @click="recharge(item)">
						<view class="field-content">
							<text>余额：</text>
							<text>{{item.balance | toFixed}}</text>
						</view>
						<text class="button">充值</text>
					</view>
					<view class="">
						<text>手机号：</text>
						<text v-if="item.mobile">{{item.mobile}}</text>
						<text v-else>未绑定</text>
					</view>
					<view class="">
						<text>邀请码：</text>
						<text v-if="item.my_invite_code">{{item.my_invite_code}}</text>
						<text v-else>无</text>
					</view>
					<view class="">
						<text>登录时间：</text>
						<text v-if="item.last_login_date > 0">{{item.last_login_date | dateFormat('yyyy-MM-dd hh:mm:ss')}}</text>
						<text v-else>无记录</text>
					</view>
					<view class="">
						<text>注册时间：</text>
						<text v-if="item.register_date > 0">{{item.register_date | dateFormat('yyyy-MM-dd hh:mm:ss')}}</text>
						<text v-else>无记录</text>
					</view>
				</view>
			</view>
		</view>
		<uni-load-more :status="loadingType"></uni-load-more>
	</view>
</template>

<script>
	import {
		usersAdmin
	} from '@/common/admin_request.js';
	export default {
		data() {
			return {
				sortList: [{
						name: '综合排序',
						type: 1,
						current: true
					},
					{
						name: '余额',
						type: 3,
						isPrice: true,
						current: false
					},
					{
						name: '登录',
						type: 2,
						current: false
					},
					{
						name: '注册',
						type: 5,
						current: false
					}
				],
				listType: 'column', //列表类型 column竖向列表 row 横向列表
				userList: []
			};
		},
		onLoad() {
			this.loadData()
		},
		//滑到底部加载更多
		onReachBottom() {
			if (this.loadingType != 'noMore') {
				this.loadData();
			}
		},
		methods: {
			async loadData() {
				this.loadingType = 'loading';
				this.page++;
				usersAdmin("list", {
					page: this.page,
					limit: this.limit,
					sort: this.sortList.filter(item => item.current)[0].type,
				}).then(res => {
					this.userList = this.userList.concat(res)
				})
			},
			// #ifndef MP
			//点击导航栏 buttons 时触发
			onNavigationBarButtonTap(e) {
				const index = e.index;
				if (index === 0) {
				}
			},
			// #endif
			//排序
			changeSort(item) {
				if (item.current) {
					if (item.isPrice) {
						item.type = item.type === 3 ? 4 : 3;
					} else {
						return;
					}
				} else {
					this.sortList.forEach(v => v.current = false);
					item.current = true;
					if (item.type === 3 || item.type === 4) {
						item.type = 3;
					}
				}
				this.refreshList();
			},
			recharge(item) {

			},
			refreshList() {
				this.page = 0;
				this.userList=[];
				this.loadData();
			}
		}
	}
</script>

<style lang="scss">
	.container {
		font-size: $font-base;
		background-color: $background-color;
		padding: 0 20rpx 20rpx;
		position: relative;
	}

	.title {
		font-size: $font-lg;
		.sub{
			font-size: $font-sm;
			margin-left: 8rpx;
		}
	}

	.item {
		display: flex;
		padding: 20rpx;
		margin-bottom: 20rpx;
		background-color: #FFFFFF;
		border-radius: 20rpx;
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
		border-radius: 20rpx;
		overflow: hidden;

		image {
			width: $width;
			height: $width;
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

		.item {
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

		.mix-icon {
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
	
	.icon-wrap{
		display: flex;
		flex-direction: column;
		padding-left: 8rpx;
		.yticon{
			font-size: 14rpx;
			color: #bbb;
		}
		.active{
			color: $base-color;
		}
	}
</style>
