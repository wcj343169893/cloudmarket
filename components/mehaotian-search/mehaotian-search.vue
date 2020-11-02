<template>
	<view class="search" :style="{ backgroundColor: backgroundColor }">
		<view class="content" :style="{ 'border-radius': radius + 'px', border: border }">
			<view class="content-box" :class="{ center: mode === 2 }">
				<text class="taobaofont icon-search"></text>
				<input
					class="input"
					type="text"
					:class="{ center: !active && mode === 2 }"
					:focus="isFocus"
					:placeholder="placeholder"
					v-model="inputVal"
					@focus="focus"
					@blur="blur"
					@confirm="confirmSearch"
					confirm-type="search"
				/>
				<!-- <view v-if="!active && mode === 2" class="input sub" @click="getFocus">请输入搜索内容</view> -->
				<text v-if="isDelShow" class="taobaofont icon-delete" @click="clear"></text>
			</view>
			<view v-show="(active && show && button === 'inside') || (isDelShow && button === 'inside')" class="searchBtn" @click="search">搜索</view>
		</view>
		<view v-if="button === 'outside'" class="button" :class="{ active: show || active }" @click="search">
			<view class="button-item">{{ searchName }}</view>
		</view>
	</view>
</template>

<script>
export default {
	props: {
		mode: {
			type: Number,
			default: 1
		},
		button: {
			type: String,
			default: 'outside'
		},
		show: {
			type: Boolean,
			default: true
		},
		isAutoFocus: {
			type: Boolean,
			default: false
		},
		radius: {
			type: String,
			default: '60'
		},
		placeholder: {
			type: String,
			default: '请输入搜索内容'
		},
		backgroundColor: {
			type: String,
			default: '#fff'
		},
		border: { type: String, default: '1px #f5f5f5 solid' }
	},
	data() {
		return {
			active: false,
			inputVal: '',
			searchName: '取消',
			isDelShow: false,
			isFocus: false
		};
	},
	methods: {
		focus() {
			this.active = true;
		},
		blur() {
			this.isFocus = false;
			if (!this.inputVal) {
				this.active = false;
			}
		},
		clear() {
			this.inputVal = '';
			this.active = false;
			this.$emit('search', '');
		},
		getFocus() {
			this.isFocus = true;
		},
		search() {
			this.isFocus = false;
			this.active = false;
			uni.hideKeyboard();
			if (!this.isDelShow) {
				console.log('取消搜索');
				this.$emit('canceled');
				return;
			}
			let val = this.inputVal.trim();
			if (val=="") {
				uni.showToast({
					icon:"none",
					title:"关键字不能为空"
				});
				setTimeout(()=>{
					this.inputVal = "";
					this.active = true;
					this.focus();
				},1500);
				return
			};
			console.log(this.inputVal);
			this.$emit('search', val);
		},
		confirmSearch(){
			if (!this.inputVal){
				console.log("placeholder",this.placeholder);
				this.inputVal = this.placeholder.trim();
				this.isDelShow = true;
			}
			this.search();
		}
	},
	watch: {
		inputVal(newVal) {
			if (newVal) {
				this.searchName = '搜索';
				this.isDelShow = true;
			} else {
				this.searchName = '取消';
				this.isDelShow = false;
			}
		}
	},
	created() {
		this.isFocus = this.isAutoFocus;
	}
};
</script>

<style lang="scss" scoped>
.search {
	display: flex;
	width: 100%;
	border-bottom: 1px #f5f5f5 solid;
	box-sizing: border-box;
	padding: 15upx;
	font-size: $uni-font-size-base;
	background: #fff;
	.content {
		display: flex;
		align-items: center;
		width: 100%;
		height: 60upx;
		border: 1px #ccc solid;
		background: #fff;
		overflow: hidden;
		transition: all 0.2s linear;
		border-radius: 30px;

		.content-box {
			width: 100%;
			display: flex;
			align-items: center;
			&.center {
				justify-content: center;
			}
			.taobaofont {
				margin: 0 15upx;
				color: $font-color-base;
			}
			.input {
				width: 100%;
				max-width: 100%;
				//line-height: 60upx;
				height: 60upx;
				transition: all 0.2s linear;
				&.center {
					width: 200upx;
				}
				&.sub {
					// position: absolute;
					width: auto;
					color: grey;
				}
			}
		}
		.searchBtn {
			height: 100%;
			flex-shrink: 0;
			padding: 0 30upx;
			background: $uni-color-success;
			line-height: 60upx;
			color: #fff;
			border-left: 1px #ccc solid;
			transition: all 0.3s;
		}
	}

	.button {
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		flex-shrink: 0;
		width: 0;
		transition: all 0.2s linear;
		white-space: nowrap;
		overflow: hidden;
		&.active {
			padding-left: 15upx;
			width: 100upx;
		}
	}
}
</style>
