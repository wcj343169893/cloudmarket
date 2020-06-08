<template>
	<view class="container">
		<view class="list-cell m-t b-b" @click="changeAvatar" hover-class="cell-hover" :hover-stay-time="50">
			<text class="cell-tit">头像</text>
			<image class="portrait" :src="userInfo.portrait"></image>
		</view>
		<view class="list-cell b-b" @click="changeNickname" hover-class="cell-hover" :hover-stay-time="50">
			<text class="cell-tit">昵称</text>
			<view class="cell-more">
				<text>{{ userInfo.nickname }}</text>
				<text class="yticon icon-you"></text>
			</view>
		</view>
		<view class="list-cell b-b" @click="changeSex" hover-class="cell-hover" :hover-stay-time="50">
			<text class="cell-tit">性别</text>
			<view class="cell-more">
				<text>{{ sexName }}</text>
				<text class="yticon icon-you"></text>
			</view>
		</view>
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
		<view class="list-cell" @click="bindWx" hover-class="cell-hover" :hover-stay-time="50">
			<text class="cell-tit">绑定微信账号</text>
			<view class="cell-more">
				<text>立即绑定</text>
				<text class="yticon icon-you"></text>
			</view>
		</view>

		<uni-popup ref="nicknamePopup" type="bottom">
			<view class="list-cell">
				<view class="cell-tit"><input type="text" v-model="nickname" placeholder="请输入昵称" maxlength="20" /></view>
				<view class="cell-tit-right"><button type="default" @click="saveNickname">保存</button></view>
			</view>
			<view class="temp"></view>
		</uni-popup>
		<uni-popup ref="sexPopup" type="bottom">
			<radio-group @change="saveSex">
				<label class="list-cell b-b">
					<text class="cell-tit">男</text>
					<view class="cell-more"><radio value="1" :checked="sex === 1" /></view>
				</label>
				<label class="list-cell">
					<text class="cell-tit">女</text>
					<view class="cell-more"><radio value="2" :checked="sex === 2" /></view>
				</label>
			</radio-group>
			<view class="temp"></view>
		</uni-popup>
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
import { mapState, mapMutations } from 'vuex';
import { saveUserInfo } from '@/common/request.js';
export default {
	data() {
		return {
			nickname: '',
			mobile: '',
			sex: 0,
			sexName: ''
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
			this.sex = this.userInfo.sex || 0;
			this.getSexName();
		},
		changeAvatar() {
			uni.chooseImage({
				count: 1, //默认9
				sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
				sourceType: ['camera', 'album'], //从相册选择
				success: function(res) {
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
				portrait: file
			});
		},
		changeNickname() {
			this.nickname = this.userInfo.nickname;
			this.$refs.nicknamePopup.open();
		},
		saveNickname() {
			this.$refs.nicknamePopup.close();
			this.saveInfo({
				nickname: this.nickname
			});
		},
		changeSex() {
			this.$refs.sexPopup.open();
		},
		saveSex(e) {
			console.log(e);
			this.sex = e.detail.value * 1;
			this.$refs.sexPopup.close();
			this.getSexName();
			this.saveInfo({
				sex: this.sex
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
			//this.$refs.mobilePopup.open();
		},
		saveMobile() {
			this.$refs.mobilePopup.close();
			/* 需要验证码，验证格式 */
			//this.userInfo.mobile = this.mobile;
		},
		bindWx() {},
		saveInfo(info) {
			Object.assign(this.userInfo, info);
			saveUserInfo(info);
		},

		getSexName() {
			let sexArr = ['请选择', '男', '女', '未知'];
			this.sexName = sexArr[this.sex * 1];
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
	.cell-tit-right {
		font-size: $font-base + 2upx;
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
