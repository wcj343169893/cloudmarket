<template>
	<view class="container">
		<block v-if="loaded">
			<mix-list-select border="b-b" @eventClick="changeRedirectType" title="品牌" :options="categories" :defaultOption="rtDef"></mix-list-select>
			<mix-list-input :isMust="!0" title="设备号" placeholder="请输入设备号" @change="changeMachine"></mix-list-input>
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
				rtDef: "",
				machine: ""
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
							this.rtDef = e._id;
						}
						this.categories[e._id] = e.name;
					})
					console.log(this.categories)
					this.loaded = true;
				})
			},
			changeMachine(e) {

			}
		}
	}
</script>

<style>

</style>
