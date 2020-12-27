<template>
	<view class="container-fixed">
		<radio-group name="categorys" @change="changeCategory">
			<view class="bg-white margin-top-sm padding-top-sm" v-for="(item, index) in categoriesData" :key="index">
				<view class="padding-lr">
					<label class="flex align-center">
						<radio :value="index + '_' + item.id + '_0'" :checked="item.checked" :class="{checked:item.checked}" />
						<text class="cell-tit margin-left-xs">{{ item.name }}</text>
					</label>
				</view>
				<view class="margin-left-sm flex-sub  flex flex-wrap">
					<label class="flex align-center padding-sm margin-left-sm" v-for="(child, childindex) in item.children" :key="childindex">
						<radio :value="index + '_' + item.id + '_' + child.id" :checked="child.checked" :class="{checked:child.checked}" />
						<text class="cell-tit margin-left-xs">{{ child.name }}</text>
					</label>
				</view>
			</view>
		</radio-group>
		<button class="fixed-add-btn" @click="save">确定选择</button>
	</view>
</template>

<script>
	import {
		categoryAdmin
	} from '@/common/admin_request.js';
	export default {
		data() {
			return {
				categoriesData: [],
				categoryIdTmp: [],
				categories: []
			};
		},
		onLoad() {
			this.loadCategory();
		},
		methods: {
			async loadCategory() {
				categoryAdmin('list', {}).then(
					res => {
						//处理没有children的数据
						res.forEach(ele => {
							ele.checked = this.categories.findIndex(f => f.id == ele.id) != -1;
							if (!ele.children || ele.children.length == 0) {
								ele.children = [{
									id: ele.id,
									isShow: ele.isShow,
									name: ele.name
								}];
							}
							ele.children.forEach(chi => {
								chi.checked = this.categories.findIndex(f => f.id == chi.id) != -1;
							});
						});
						this.categoriesData = res;
					},
					err => {}
				);
			}, //单项选择商品分类，如果要多选，有点麻烦
			changeCategory(e) {
				this.categoryIdTmp = [];
				let ids = e.detail.value;
				ids = ids.split('_');
				this.categoriesData.forEach(par => {
					par.checked = false;
					if (par.children) {
						par.children.forEach(chi => {
							chi.checked = false;
						})
					}
				})
				let cates = this.categoriesData[+ids[0]];
				cates.checked = true;
				this.categoryIdTmp.push({
					id: cates.id,
					pid: 0,
					isShow: cates.isShow,
					name: cates.name
				});
				cates.children.map(child => {
					if (ids[1] != ids[2] && child.id == +ids[2]) {
						child.checked = true;
						child.pid = cates.id;
						this.categoryIdTmp.push(child);
					}
				});
				console.log(this.categoryIdTmp)
			},
			save(){
				this.$api.prePage().refreshCategory(this.categoryIdTmp);
				uni.navigateBack({
					delta:1
				})
			}
		}
	}
</script>

<style lang="scss">
</style>
