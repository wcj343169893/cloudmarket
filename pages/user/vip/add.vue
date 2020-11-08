<template>
	<view class="container">
		<view class="description"><text>成为会员，享受更好的服务体验！</text></view>
		<mix-list-input title="真实姓名" textAlign="content-right light" field="name" :defContent="name" placeholder="请输入真实姓名"
		 @blur="changeField"></mix-list-input>
		<mix-list-input title="身份证" type="idcard" textAlign="content-right light" field="idcard" :defContent="idcard"
		 placeholder="请输入身份证号码" @blur="changeField"></mix-list-input>
		<mix-list-input title="手机号" type="number" textAlign="content-right light" field="mobile" :defContent="mobile"
		 placeholder="请输入手机号" @blur="changeField"></mix-list-input>
		<mix-list-input title="家庭地址" type="text" textAlign="content-right light" field="address" :defContent="address"
		 placeholder="请输入家庭地址" :withLocation="!0" @change="changeAddress"></mix-list-input>

		<button v-if="!uid" class="fixed-add-btn" @click="save">提交申请</button>
		<button v-else class="fixed-add-btn" @click="save">修改</button>
	</view>
</template>

<script>
	import {
		cloudUser
	} from '@/common/request.js';
	export default {
		data() {
			return {
				uid: false,
				name: '',
				idcard: '',
				mobile: '',
				address: ''
			};
		},
		onLoad() {
			this.loadData();
		},
		methods: {
			async loadData() {
				this.getItemData(true);
			},
			changeField(e, field) {
				this[field] = e;
			},
			//地图选择地址
			changeAddress(e, field) {
				this.address = e.address;
			},
			save() {
				let data = {
					name: this.name,
					idcard: this.idcard,
					mobile: this.mobile,
					address: this.address
				};
				if (
					!this.checkFields(data, {
						name: '真实姓名',
						idcard: '身份证',
						mobile: '手机号',
						address: '地址'
					})
				) {
					return false;
				}
				this.$submitData(() => {
					cloudUser('info', 'member', data, true).then(res => {
						this.$api.success("申请成功")
						this.navTimeBack();
					});
					return true;
				});
			}
		}
	};
</script>

<style lang="scss">
	.description {
		text-align: center;
		color: $font-color-light;
		padding: 40rpx 20rpx;
		font-size: $font-sm;
	}
</style>
