<template>
	<view class="container">
		<view class="list-cell m-t b-b" @click="changeAvatar" hover-class="cell-hover" :hover-stay-time="50">
			<text class="cell-tit">头像</text>
			<image class="portrait" :src="userInfo.avatar"></image>
		</view>
		<mix-list-input title="昵称" textAlign="content-right light" :defContent="userInfo.nickname" placeholder="请输入昵称" @blur="saveNickname"></mix-list-input>
		<mix-list-select border="b-b" @eventClick="saveSex" title="性别" :options="genders" :defaultOption="gender"></mix-list-select>
		<view class="list-cell b-b" @click="changeBirthday" hover-class="cell-hover" :hover-stay-time="50">
			<text class="cell-tit">生日</text>
			<view class="cell-more">
				<text v-if="userInfo.birthday && userInfo.birthday.length != ''">{{ userInfo.birthday }}</text>
				<text v-else>去填写</text>
				<text class="yticon icon-you"></text>
			</view>
		</view>
		<view class="list-cell b-b" @click="changeMobile" hover-class="cell-hover" :hover-stay-time="50">
			<text class="cell-tit">手机号</text>
			<view class="cell-more">
				<text>{{ userInfo.mobile }}</text>
				<text class="yticon icon-you"></text>
			</view>
		</view>
		<!-- #ifndef MP -->
		<view class="list-cell" @click="bindWx" hover-class="cell-hover" :hover-stay-time="50">
			<text class="cell-tit">绑定微信账号</text>
			<view class="cell-more">
				<text>立即绑定</text>
				<text class="yticon icon-you"></text>
			</view>
		</view>
		<!-- #endif -->

		<uni-calendar ref="calendar" :insert="false" @confirm="saveBirthday" />
		<uni-popup ref="mobilePopup" type="bottom">
			<view class="list-cell">
				<view class="cell-tit"><input type="tel" v-model="mobile" placeholder="请输入手机号码" maxlength="11" /></view>
				<view class="cell-tit-right"><button type="default" @click="saveMobile">保存</button></view>
			</view>
			<view class="temp"></view>
		</uni-popup>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex';
	import {
		saveUserInfo
	} from '@/common/request.js';
	export default {
		data() {
			return {
				nickname: '',
				mobile: '',
				gender: "0", //用户性别：0 未知 1 男性 2 女性
				genders: {
					"1": "男",
					"2": "女",
					"0": "未知",
				},
				genderName: ''
			};
		},
		computed: {
			...mapState(['userInfo'])
		},
		onLoad() {
			console.log(this.userInfo);
			this.loadData();
		},
		methods: {
			async loadData() {
				this.gender = this.userInfo.gender + "";
				this.getSexName();
			},
			changeAvatar() {
				uni.chooseImage({
					count: 1, //默认9
					sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
					sourceType: ['camera', 'album'], //从相册选择
					success: (res) =>{
						console.log(res);
						if (res.tempFilePaths.length > 0) {
							uni.setStorage({
								key: 'avatar',
								data: res.tempFilePaths[0]
							});
							uni.navigateTo({
								url: '/pages/userinfo/avatar'
							});
						}
					}
				});
			},
			refreshFile(file) {
				this.userInfo.portrait = file;
				this.saveInfo({
					avatar: file
				});
			},
			saveNickname(nickname) {
				this.saveInfo({
					nickname: nickname
				});
			},
			saveSex(e) {
				this.gender = e;
				this.getSexName();
				this.saveInfo({
					gender: this.gender
				});
			},
			changeBirthday() {
				this.$refs.calendar.open();
			},
			saveBirthday(e) {
				this.saveInfo({
					birthday: e.fulldate
				});
			},
			changeMobile() {
				this.mobile = this.userInfo.mobile;
			},
			saveMobile() {
				this.$refs.mobilePopup.close();
				/* 需要验证码，验证格式 */
				//this.userInfo.mobile = this.mobile;
			},
			bindWx() {},
			saveInfo(info) {
				Object.assign(this.userInfo, info);
				saveUserInfo(info, "save").then(res => {
					this.$api.success("修改成功");
				});
			},

			getSexName() {
				let sexArr = ['请选择', '男', '女', '未知'];
				this.sexName = sexArr[this.gender * 1];
			}
		}
	};
</script>

<style lang="scss">
	page {
		background: $page-color-base;
	}

	.input-container,
	.select-container {
		background: #FFFFFF;
	}

	.list-cell {
		display: flex;
		align-items: center;
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
			font-size: $font-base;
			color: $font-color-light;
			margin-left: 10upx;
		}

		.cell-tit {
			flex: 1;
			font-size: $font-base;
			color: $font-color-dark;
			margin-right: 10upx;
		}

		.cell-tit-right {
			font-size: $font-base;
			color: $font-color-dark;
		}

		.cell-tip {
			font-size: $font-base;
			color: $font-color-light;
		}

		switch {
			transform: translateX(16upx) scale(0.84);
		}
	}

	.portrait {
		width: 90upx;
		height: 90upx;
		border: 2upx solid #fff;
		border-radius: 50%;
	}

	.temp {
		background: #ffffff;
		padding-bottom: 40upx;
	}
</style>
