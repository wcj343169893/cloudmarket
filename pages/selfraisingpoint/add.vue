<template>
	<view class="container bg-white">
		<mix-list-avatar title="头像" field="src" :defContent="src"></mix-list-avatar>
		<mix-list-input title="名称" :defContent="name" field="name" placeholder="请输入名称" @change="changeField"></mix-list-input>
		<mix-list-input title="电话" type="number" :defContent="mobile" field="mobile" placeholder="请输入电话" @blur="changeField"></mix-list-input>
		<mix-list-input title="地址" type="text" textAlign="content-right light" field="address" :defContent="address"
		 placeholder="选择详细地址" :disabled="!0" :withLocation="!0" @change="changeAddress"></mix-list-input>
		<mix-list-avatar title="门头照" :needCut="false" field="head" size="lg" :defContent="head" @change="changeField"></mix-list-avatar>
		<mix-list-avatar title="内部照" :needCut="false" field="inside" size="lg" :defContent="inside" @change="changeField"></mix-list-avatar>
		<button class="fixed-add-btn" @click="save">提交申请</button>
	</view>
</template>

<script>
	import {
		cloudMall
	} from '@/common/request.js';
	export default {
		data() {
			return {
				_id: false,
				address: "",
				latitude: 0,
				longitude: 0,
				mobile: "",
				name: "",
				src: "",
				head: "",
				inside: "",
			};
		},
		onLoad(options) {
			if (options.id) {
				this.getItemData(true);
			}
		},
		methods: {
			//地图选择地址
			changeAddress(e, field) {
				this.address = e.name || e.address;
				this.latitude = e.latitude;
				this.longitude = e.longitude;
			},
			refreshFile(file, field) {
				this[field] = file;
			},
			save() {
				let data = {
					_id: this._id,
					address: this.address,
					latitude: this.latitude,
					longitude: this.longitude,
					mobile: this.mobile,
					name: this.name,
					src: this.src,
					head: this.head,
					inside: this.inside,
				}
				if (!this.checkFields(data, {
						src: "头像",
						name: "名称",
						mobile: "电话",
						address: "地址",
					})) {
					return;
				}
				uni.showModal({
					title: "确认信息",
					content: "请确定提交的信息准确无误",
					success: (res) => {
						if (res.confirm) {
							cloudMall("selfraising", "applys",
								data, true).then(res => {
								this.$api.success("提交成功");
								this.navTimeBack();
							}, err => {
								this.$api.msg("申请失败");
							})
						}
					}
				})
			},
		}
	}
</script>

<style lang="scss">

</style>
