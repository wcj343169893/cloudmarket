<template>
	<view class="container">
		<!-- <view class="list-cell b-b m-t" @click="navTo('个人资料')" hover-class="cell-hover" :hover-stay-time="50">
			<text class="cell-tit">个人资料</text>
			<text class="cell-more yticon icon-you"></text>
		</view> -->
		<!-- <view class="list-cell" @click="navTo('实名认证')" hover-class="cell-hover" :hover-stay-time="50">
			<text class="cell-tit">实名认证</text>
			<text class="cell-more yticon icon-you"></text>
		</view> -->

		<view class="list-cell m-t">
			<text class="cell-tit">消息推送</text>
			<switch checked color="#fa436a" @change="switchChange" />
		</view>
		<view class="list-cell m-t b-b" @click="cleanCache()" hover-class="cell-hover" :hover-stay-time="50">
			<text class="cell-tit">清除缓存</text>
			<text class="cell-more yticon icon-you"></text>
		</view>
		<view class="list-cell b-b" @click="about()" hover-class="cell-hover" :hover-stay-time="50">
			<text class="cell-tit">关于</text>
			<text class="cell-more yticon icon-you"></text>
		</view>
		<view class="list-cell b-b" @click="cancellation()" hover-class="cell-hover" :hover-stay-time="50">
			<text class="cell-tit">注销账号</text>
			<text class="cell-tip">注销后无法恢复</text>
			<text class="cell-more yticon icon-you"></text>
		</view>
		<!-- #ifdef APP-PLUS -->
		<view class="list-cell" @click="checkUpdate()">
			<text class="cell-tit">检查更新</text>
			<text class="cell-tip">当前版本 {{version}}</text>
			<text class="cell-more yticon icon-you"></text>
		</view>
		<!-- #endif -->
		<view class="list-cell log-out-btn" @click="toLogout"><text class="cell-tit">退出登录</text></view>
	</view>
</template>

<script>
	import {
		mapMutations
	} from 'vuex';
	import {
		checkAppUpdate,
		navToDocPageByType
	} from '@/common/functions.js';
	import {
		cloudUser
	} from '@/common/request.js';
	export default {
		data() {
			return {
				version: ''
			};
		},
		onLoad() {
			// #ifdef APP-PLUS
			this.version = plus.runtime.version;
			//#endif
		},
		methods: {
			...mapMutations(['logout']),

			navTo(url) {
				this.$api.msg(`跳转到${url}`);
			},
			cancellation() {
				uni.showModal({
					title: '温馨提示',
					content: '请确认您已经准备放弃本账户？若不满足自主注销条件请联系客服协助完成',
					success: e => {
						if (e.confirm) {
							cloudUser("info", "cancellation", {}, true).then(() => {
								this.$api.msg("注销成功")
								this.logout();
								setTimeout(() => {
									uni.navigateBack();
								}, 2000);
							}, (err) => {
								uni.showModal({
									title: "注销失败",
									content: err.message + "\n请联系客服协助处理",
									cancelText: "放弃注销",
									confirmText: "找客服",
									success: (res) => {
										if (res.confirm) {
											uni.redirectTo({
												url: "/pages/docs/qa"
											})
										}
									}
								})
							}).catch(() => {
								console.log("注销失败")
							})
						}
					}
				});
			},
			cleanCache() {
				this.$api.msg(`清理完毕`);
			},
			about() {
				navToDocPageByType("app_about")
			},
			//退出登录
			toLogout() {
				uni.showModal({
					content: '确定要退出登录么',
					success: e => {
						if (e.confirm) {
							this.logout();
							setTimeout(() => {
								uni.navigateBack();
							}, 200);
						}
					}
				});
			},
			//switch
			switchChange(e) {
				let statusTip = e.detail.value ? '打开' : '关闭';
				this.$api.msg(`${statusTip}消息推送`);
			},
			checkUpdate() {
				uni.showLoading({
					title: "检查中"
				});
				checkAppUpdate(true, this.systemInfo, msg => {
					uni.hideLoading();
					this.$api.msg(msg, 5000);
				});
			}
		}
	};
</script>

<style lang="scss">
	page {
		background: $page-color-base;
	}

	.list-cell {
		display: flex;
		align-items: baseline;
		padding: 20upx $page-row-spacing;
		line-height: 60upx;
		position: relative;
		background: #fff;
		justify-content: center;

		&.log-out-btn {
			margin-top: 40upx;

			.cell-tit {
				color: $uni-color-primary;
				text-align: center;
				margin-right: 0;
			}
		}

		&.cell-hover {
			background: #fafafa;
		}

		&.b-b:after {
			left: 30upx;
		}

		&.m-t {
			margin-top: 16upx;
		}

		.cell-more {
			align-self: baseline;
			font-size: $font-lg;
			color: $font-color-light;
			margin-left: 10upx;
		}

		.cell-tit {
			flex: 1;
			font-size: $font-base + 2upx;
			color: $font-color-dark;
			margin-right: 10upx;
		}

		.cell-tip {
			font-size: $font-base;
			color: $font-color-light;
		}

		switch {
			transform: translateX(16upx) scale(0.84);
		}
	}
</style>
