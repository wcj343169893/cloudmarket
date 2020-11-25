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
		 placeholder="请输入家庭地址,精确到门牌号" :withLocation="!disable" @blurContent="changeAddress" @change="changeAddress"></mix-list-input>
		<button v-if="!disable" class="fixed-add-btn" @click="save">提交申请</button>
		<button v-else-if="editVipCard" class="fixed-add-btn" @click="save">修改</button>
	</view>
</template>

<script>
	import {
		cloudUser
	} from '@/common/request.js';
	import {
		mapState
	} from 'vuex';
	export default {
		data() {
			return {
				disable: false,
				name: '',
				idcard: '',
				mobile: '',
				address: ''
			};
		},
		computed: {
			...mapState(['userInfo']),
			editVipCard() {
				if (!this.$config.vipCard) {
					return false;
				}
				return this.$config.vipCard.edit;
			}
		},
		watch: {
			userInfo() {
				console.log('watch this.userInfo');
				this.loadData();
			}
		},
		onLoad() {
			this.loadData();
		},
		methods: {
			async loadData() {
				//this.getItemData(true);
				if (this.userInfo.member) {
					for (let key in this.userInfo.member) {
						this[key] = this.userInfo.member[key];
					}
					this.disable = !!this.userInfo._id;
				}
			},
			changeField(e, field) {
				this[field] = e;
			},
			//地图选择地址
			changeAddress(e, field) {
				this.address = e.address || e;
			},
			save() {
				let data = {
					name: this.name,
					idcard: this.idcard,
					mobile: this.mobile,
					address: this.address
				};
				let fields = {
					name: '真实姓名',
					idcard: '身份证',
					mobile: '手机号',
					address: '地址'
				};
				if (!this.checkFields(data, fields)) {
					return false;
				}
				let content = [];
				for (let fi in fields) {
					content.push([fields[fi], ':', this[fi]].join(''));
				}
				//核对信息
				uni.showModal({
					title: '请仔细核对信息',
					content: content.join('\n'),
					success: e => {
						if (e.confirm) {
							this.$submitData(() => {
								cloudUser('info', 'member', data, true).then(
									res => {
										this.$api.success('会员申请成功');
										setTimeout(() => {
											this.$store.dispatch('getUserInfo');
											uni.switchTab({
												url: '/pages/user/user'
											});
										}, 1500);
									},
									err => {
										this.$finishSubmit();
									}
								);
								return true;
							});
						}
					}
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
