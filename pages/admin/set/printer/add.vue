<template>
	<view class="container">
		<block v-if="loaded">
			<mix-list-select border="b-b" @eventClick="changeCategory" title="品牌" :options="categories" :defaultOption="rtDef"></mix-list-select>
			<mix-list-input :isMust="!0" title="设备号" placeholder="请输入设备号" @change="changeMachine"></mix-list-input>
			<mix-list-input :isMust="!0" title="秘钥" placeholder="请输入秘钥" @change="changeMsign"></mix-list-input>
			<view class="specsTitlesBtn submit">
				<button class="action-btn" @click="save">提交</button>
			</view>
		</block>
	</view>
</template>

<script>
	import {
		printerAdmin
	} from '@/common/admin_request.js';
	export default {
		data() {
			return {
				categories: {},
				categoryMap: {},
				rtDef: "",
				cateid: "",
				machine: "",
				msign: ""
			}
		},
		onLoad() {
			this.loadCategory();
		},
		methods: {
			async loadCategory() {
				printerAdmin("category", {}).then(res => {
					res.map(e => {
						if (this.rtDef == "") {
							this.cateid = this.rtDef = e._id;
						}
						this.categories[e._id] = e.name;
						this.categoryMap[e._id] = e;
					})
					console.log(this.categories)
					this.loaded = true;
				})
			},
			changeCategory(e) {
				console.log(e)
				this.cateid = e;
			},
			changeMachine(e) {
				this.machine = e;

			},
			changeMsign(e) {
				this.msign = e;
			},
			save() {
				let data = Object.assign({}, this.categoryMap[this.cateid], {
					machine: this.machine,
					msign: this.msign,
					online:true,
					enable:true
				})
				delete data._id;
				printerAdmin("add", data,true).then(res => {
					this.$api.success("添加成功");
					setTimeout(() => {
						//上一个页面刷新
						this.$api.prePage().refreshList(data);
						uni.navigateBack({
							delta:1
						})
					}, 2000)
				},err=>{
					this.$api.msg("添加失败");
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.specsTitlesBtn {
		position: fixed;
		bottom: 0;
		width: 100%;
		left: 0;
		display: flex;
		padding: 10upx 30upx 30upx;
		background-color: #ffffff;
		justify-content: space-between;

		.action-btn {
			flex: 1;
			margin: 0 30rpx;
			background-color: $btn-color-light;
			color: #FFFFFF;
		}
	}
</style>
