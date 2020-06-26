<template>
	<view class="container">
		<view class="skus">
			<view class="items" v-for="(item, index) in specsTitlesMap" :key="index">
				<view class="header">
					<text>{{ item.name }}</text>
				</view>
				<view class="content" v-for="(it, i) in item.children" :key="i">
					<text class="name">{{ item.name }}{{ i + 1 }}</text>
					<input type="text" class="input" v-model="it.name" placeholder="输入内容后生效" />
					<text class="yticon icon-jia2" v-if="item.children.length == i + 1" @click="add(index)"></text>
					<text class="yticon icon-shanchu4" v-else @click="del(index, i)"></text>
				</view>
			</view>
		</view>
		<view class="pops">
			<view class="mix-list-cell b-b">
				<text class="cell-tit clamp">统一库存</text>
				<input type="number" class="cell-content" v-model="stock" placeholder="请输入商品库存" />
			</view>
			<view class="mix-list-cell b-b">
				<text class="cell-tit clamp">统一原价</text>
				<input type="number" class="cell-content" v-model="originPrice" placeholder="请输入商品原价" />
			</view>
			<view class="mix-list-cell">
				<text class="cell-tit clamp">统一售价</text>
				<input type="number" class="cell-content" v-model="price" placeholder="请输入商品售价" />
			</view>
		</view>
		<view class="specsTitlesBtn">
			<button class="add-btn cancel" @click="cancelSkuBuilder">取消</button>
			<button class="add-btn" @click="build">确定</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			specsTitlesMap: [],
			stock:0,
			originPrice:0,
			price:0,
			data: []
		};
	},
	onLoad() {
		this.loadData();
	},
	methods: {
		async loadData() {
			let stm = uni.getStorageSync('skuBuilder');
			if (stm) {
				this.specsTitlesMap = [];
				stm.forEach(ele => {
					ele.children = [];
					for (let i = 0; i < 3; i++) {
						ele.children.push({
							name: ''
						});
					}
				});
				this.specsTitlesMap = stm;
			}
		},
		//增加
		add(index) {
			let index2 = this.specsTitlesMap[index].children.length;
			this.specsTitlesMap[index].children.push({
				name: ''
			});
		},
		//删除,需要更新序号
		del(index, index2) {
			this.specsTitlesMap[index].children.splice(index2, 1);
		},
		cancelSkuBuilder() {
			uni.navigateBack({
				delta: 1
			});
		},
		build() {
			let isError = false;
			//组合数据
			let data = [];
			//过滤无效的数据
			this.specsTitlesMap.map(name => {
				let exits = [];
				name.children.map(val => {
					if (val.name != '' && exits.indexOf(val.name) == -1) {
						exits.push(val.name);
					}
				});
				if (exits.length == 0) {
					isError = true;
				}
				data.push(exits);
			});
			if (isError) {
				this.$api.msg('每一项必须填写一条！');
				return;
			}
			let result = [];
			let separator = '&gt;';

			switch (data.length) {
				case 1:
					//1层
					for (let s of data[0]) {
						result.push(s);
					}
					break;
				case 2:
					for (let s of data[0]) {
						for (let s1 of data[1]) {
							result.push(s + separator + s1);
						}
					}
					break;
				case 3:
					for (let s of data[0]) {
						for (let s1 of data[1]) {
							for (let s2 of data[2]) {
								result.push(s + separator + s1 + separator + s2);
							}
						}
					}
					break;
				case 4:
					for (let s of data[0]) {
						for (let s1 of data[1]) {
							for (let s2 of data[2]) {
								for (let s3 of data[3]) {
									result.push(s + separator + s1 + separator + s2 + separator + s3);
								}
							}
						}
					}
					break;
				default:
					break;
			}
			this.data = [];
			for (let s of result) {
				this.data.push({
					price: this.price,
					originPrice: this.originPrice,
					stock: this.stock,
					name: s
				});
			}
			console.log(this.data);
			//显示结果
			this.$api.prePage().refreshList(this.data);
			uni.navigateBack({
				delta:1
			})
		}
	}
};
</script>

<style lang="scss">
page {
	background-color: $background-color;
}
.container {
	font-size: $font-base;
	padding: 20upx;
}
.pops{
	margin-bottom: 20upx;
	background-color: #ffffff;
	border-radius: 20upx;
}
.items {
	margin-bottom: 20upx;
	background-color: #ffffff;
	padding: 20upx;
	border-radius: 20upx;
}
.header {
	font-size: $font-lg;
	padding-bottom: 8upx;
}
.content {
	display: flex;
	margin-bottom: 20upx;
	align-items: center;
	.name {
		margin-right: 20upx;
	}
	.input {
		flex: 1;
	}
}

.specsTitlesBtn {
	margin-top: 30upx;
	padding-bottom: 30upx;
	display: flex;
}
.add-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: $font-lg;
	color: #fff;
	background-color: $btn-color-light;
	border-radius: 10upx;
	&.cancel {
		background-color: $btn-color-spec;
	}
}
.icon .mix-list-cell.b-b:after {
	left: 90upx;
}
.mix-list-cell {
	display: flex;
	align-items: baseline;
	padding: 20upx $page-row-spacing;
	line-height: 60upx;
	position: relative;

	&.cell-hover {
		background: #fafafa;
	}
	&.b-b:after {
		left: 30upx;
	}

	.cell-icon {
		align-self: center;
		width: 56upx;
		max-height: 60upx;
		font-size: 38upx;
	}
	.cell-more {
		align-self: center;
		font-size: 30upx;
		color: $font-color-base;
		margin-left: $uni-spacing-row-sm;
	}
	.cell-tit {
		font-size: $font-base;
		color: $font-color-dark;
		margin-right: 20upx;
	}
	.cell-content {
		flex: 1;
		font-size: $font-sm + 2upx;
	}
	.cell-tip {
		flex: 1;
		font-size: $font-sm + 2upx;
		color: $font-color-light;
		text-align: right;
	}
}
</style>
