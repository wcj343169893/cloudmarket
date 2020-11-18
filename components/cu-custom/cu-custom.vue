<template>
	<view>
		<view class="cu-custom" :style="[{height:CustomBar + 'px'}]">
			<view class="cu-bar fixed" :style="style" :class="[bgImage!=''?'none-bg text-white bg-img':'',bgColor]">
				<view class="action" @tap="BackPage" v-if="isBack">
					<text class="cuIcon-back"></text>
					<slot name="backText"></slot>
				</view>
				<scroll-view scroll-x class="nav text-center" v-if="tabs && tabs.length>0" :style="[{top:StatusBar + 'px'}]">
					<view class="cu-item text-lg" :class="index==current?'text-white':'text-black'" v-for="(item,index) in tabs"
					 :key="index" @tap="tabSelect(index)">
						<text>{{item.title}}</text>
					</view>
				</scroll-view>
				<view v-else class="content" :style="[{top:StatusBar + 'px'}]">
					<slot name="content"></slot>
				</view>
				<slot name="right"></slot>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				StatusBar: this.StatusBar,
				CustomBar: this.CustomBar
			};
		},
		name: 'cu-custom',
		computed: {
			style() {
				var StatusBar = this.StatusBar;
				var CustomBar = this.CustomBar;
				var bgImage = this.bgImage;
				var style = `height:${CustomBar}px;padding-top:${StatusBar}px;`;
				if (this.bgImage) {
					style = `${style}background-image:url(${bgImage});`;
				}
				return style
			}
		},
		props: {
			bgColor: {
				type: String,
				default: ''
			},
			isBack: {
				type: [Boolean, String],
				default: false
			},
			bgImage: {
				type: String,
				default: ''
			},
			current: {
				type: Number,
				default: 0
			},
			tabs: {
				type: [Object, Array, Boolean],
				default: false
			}
		},
		methods: {
			BackPage() {
				uni.navigateBack({
					delta: 1
				});
			},
			tabSelect(index) {
				this.tabCurrent = index;
				this.$emit("tabClick", index);
			}
		}
	}
</script>

<style>

</style>
