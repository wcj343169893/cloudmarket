<template>
	<view class="container">
		<!-- 顶部筛选 分类栏 -->
		<view class="top">
			<!-- 排序 -->
			<view class="sort-bar row">
				<view class="sort-bar-item row center" :class="{active: item.current, last: index === sortList.length-1}" v-for="(item,index) in sortList"
				 :key="index" @click="changeSort(item)">
					<text>{{ item.name }}</text>
					<view v-if="item.isPrice" class="icon-wrap">
						<text class="yticon icon-shang" :class="{active: item.type === 4}"></text>
						<text class="yticon icon-xia" :class="{active: item.type === 5}"></text>
					</view>
				</view>
			</view>
		</view>
		<view class="users-section">
			<view v-for="(item,index) in userList" :key="index" class="item" @click="detail(item)">
				<view class="image-content">
					<image :src="item.avatar" mode="aspectFill" lazy-load="true"></image>
				</view>
				<view class="content">
					<view class="title clamp">
						<text v-if="item.nickname">{{ item.nickname }}</text>
						<text v-else>游客<text class="sub">（未修改）</text></text>
						<text v-if="item.wx_openid" class="yticon icon-weixin"></text>
						<text v-if="item.ali_openid" class="yticon icon-alipay"></text>
						<text class="sub" v-if="item.id">（{{item.id}}）</text>
					</view>
					<view class="fields" @click.stop="recharge(item)">
						<view class="field-content">
							<text>余额：</text>
							<text>{{item.balance | toFixed}}</text>
						</view>
						<text class="button">充值</text>
					</view>
					<view class="">
						<text>手机号：</text>
						<text v-if="item.mobile" @click="tel(item.mobile)">{{item.mobile}}</text>
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
		<uni-popup ref="rechargePop" type="dialog">
			<uni-popup-dialog type="warn" title="账户充值" placeholder="请输入充值金额" mode="input" :before-close="true" @close="close"
			 @confirm="confirm"></uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script>
	import {
		usersAdmin
	} from '@/common/admin_request.js';
	import searchMixin from '../mixin/search.js'

	import uniPopupDialog from '@/components/uni-popup/uni-popup-dialog.vue'
	export default {
		mixins: [searchMixin],
		components: {
			uniPopupDialog
		},
		data() {
			return {
				limit: 20,
				sortList: [{
						name: '综合排序',
						type: 1,
						current: true
					},
					{
						name: '余额',
						type: 2,
						current: false
					},
					{
						name: '登录',
						type: 3,
						current: false
					},
					{
						name: '注册',
						type: 4,
						isPrice: true,
						current: false
					}
				],
				listType: 'column', //列表类型 column竖向列表 row 横向列表
				userList: [],
				state: "",
				rechargeItem: {}
			};
		},
		onLoad(options) {
			this.state = options.state;
			this.loadData();
			//设置标题
			this.setNavTitle();
		},
		methods: {
			async loadData() {
				this.loadingType = 'loading';
				this.page++;
				usersAdmin("list", {
					state: this.state,
					page: this.page,
					limit: this.limit,
					key: this.searchWord,
					sort: this.sortList.filter(item => item.current)[0].type,
				}, false).then(res => {
					res.forEach(usr => {
						if (!usr.balance) {
							usr.balance = 0;
						}
						if (!usr.avatar) {
							usr.avatar = "/static/missing-face.png";
						}
					})
					this.userList = this.userList.concat(res);
					if (res.length < this.limit) {
						this.loadingType = "noMore";
					}
				})
			},
			//排序
			changeSort(item) {
				if (item.current) {
					if (item.isPrice) {
						item.type = item.type === 4 ? 5 : 4;
					} else {
						return;
					}
				} else {
					this.sortList.forEach(v => v.current = false);
					item.current = true;
					if (item.type === 4 || item.type === 5) {
						item.type = 4;
					}
				}
				this.refreshList();
			},
			recharge(item) {
				this.rechargeItem = item;
				this.$refs.rechargePop.open()
			},
			refreshList() {
				this.page = 0;
				this.userList = [];
				this.loadData();
			},
			/**
			 * 点击取消按钮触发
			 * @param {Object} done
			 */
			close(done) {
				// TODO 做一些其他的事情，before-close 为true的情况下，手动执行 done 才会关闭对话框
				// ...
				done()
			},
			/**
			 * 点击确认按钮触发
			 * @param {Object} done
			 * @param {Object} value
			 */
			confirm(done, value) {
				if (this.isSubmit) {
					return false;
				}
				this.isSubmit = true;
				// 输入框的值
				console.log(value)
				let money = +value;
				if (money <= 0) {
					this.$api.msg("金额输入错误");
					return;
				}
				usersAdmin("recharge", {
					rechargeUid: this.rechargeItem._id,
					money
				}, true).then(res => {
					this.isSubmit = false;
					this.$api.success("充值成功");
					this.userList.forEach(usr => {
						if (usr._id == this.rechargeItem._id) {
							usr.balance = res
						}
					})
				}, err => {
					this.isSubmit = false;
					this.$api.msg("充值失败！")
				})
				done()
			},
			tel(phone) {
				uni.makePhoneCall({
					phoneNumber: phone
				})
			},
			detail(item) {
				console.log(item)
			},
			setNavTitle() {
				let shopInfo = uni.getStorageSync("adminShopInfo");
				let userTypes = shopInfo.userTypes.filter(e => e.state == this.state);
				uni.setNavigationBarTitle({
					title: userTypes[0].name
				});
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
</style>
