<template>
	<view class="input-container bg-white">
		<view class="mix-list-cell" :class="[border,type]">
			<text class="cell-tit clamp" v-if="title && title.length>0">
				<text v-if="isMust">*</text>
				{{ title }}
			</text>
			<view v-if="disabled" class="cell-content" :class="[textAlign]">
				<text v-if="content">{{content}}</text>
				<text v-else>{{placeholder}}</text>
			</view>
			<input v-else-if="type == 'text'" type="text" class="cell-content" :class="[textAlign]" @blur="blurContent" @input="changeContent"
			 v-model="content" :placeholder="placeholder" />
			<input v-else-if="type == 'digit'" type="digit" class="cell-content" :class="[textAlign]" @input="changeContent"
			 @blur="blurContent" v-model="content" :placeholder="placeholder" />
			<input v-else-if="type == 'number'" type="number" class="cell-content" :class="[textAlign]" @input="changeContent"
			 @blur="blurContent" v-model="content" :placeholder="placeholder" />
			<input v-else-if="type == 'idcard'" type="idcard" class="cell-content" :class="[textAlign]" @input="changeContent"
			 @blur="blurContent" v-model="content" :placeholder="placeholder" />
			<block v-else-if="type == 'textarea'">
				<view class="">
					<textarea maxlength="9999" v-model="content" class="cell-content" :class="[textAlign]" @input="changeContent"
					 :placeholder="placeholder" />
					<view class="desc" v-if="markdown">
						<text>支持markdown语法，最多输入9999字符</text>
					</view>
				</view>
			</block>
			<text v-if="withScan" class="cell-more yticon icon-saomiao" @click="btnScan"></text>
			<text v-else-if="withLocation" class="cell-more yticon icon-shouhuodizhi" @click="btnSelectLocation"></text>
			<slot></slot>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			content: ''
		};
	},
	props: {
		title: {
			type: String,
			default: '标题'
		},
		field: {
			type: String,
			default: ''
		},
		border: {
			type: String,
			default: 'b-b'
		},
		type: {
			type: String,
			default: 'text'
		},
		isMust: {
			type: Boolean,
			default: false
		},
		withScan: {
			type: Boolean,
			default: false
		},	
		markdown: {
			type: Boolean,
			default: false
		},	
		withLocation: {
			type: Boolean,
			default: false
		},
		disabled: {
			type: Boolean,
			default: false
		},
		placeholder: {
			type: String,
			default: '请输入'
		},
		textAlign:{
			type: String,
			default: ''
		},
		defContent: {
			type: [String , Number],
			default: ''
		}
	},
	watch: {
		defContent(val,oldVal) {
			if(val != oldVal){
				this.content = val;
			}
			//console.log(val)
		}
	},
	created() {
		if (this.defContent) {
			this.content = this.defContent;
		}
	},
	methods: {
		changeContent(e) {
			this.$emit('change', e.detail.value,this.field);
			this.$emit('input', e.detail.value,this.field);
		},
		blurContent(e){
			this.$emit('blur', e.detail.value,this.field);
		},
		btnScan() {
			// 调起条码扫描
			uni.scanCode({
				scanType: ['barCode'],
				success: (res) =>{
					console.log('条码类型：' + res.scanType);
					console.log('条码内容：' + res.result);
					this.content = res.result;
					this.$emit('change', this.content,this.field);
					this.$emit('blur', this.content,this.field);
				}
			});
		},
		btnSelectLocation(){
			uni.chooseLocation({
				success: data => {
					let noNeedName = ["我的位置","地图位置"];
					console.log(data,noNeedName.indexOf(data.name))
					if(noNeedName.indexOf(data.name) > -1){
						this.$api.msg("所选地址无效");
						console.log("地址无效")
						return;
					}
					this.$emit('change', data,this.field);
				}
			});
		}
	}
};
</script>

<style lang="scss" scoped>
.input-container {
	.mix-list-cell {
		display: flex;
		align-items: center;
		padding: 20upx $page-row-spacing;
		line-height: 60upx;
		position: relative;

		&.b-b:after {
			left: 30upx;
		}

		&.cell-hover {
			background: #fafafa;
		}
		.cell-tit {
			font-size: $font-base;
			color: $font-color-dark;
			margin-right: 20upx;
		}
		.cell-content {
			flex: 1;
			font-size: $font-sm + 2upx;
			color: $font-color-light;
			text-align: right;
			height: 60rpx;
			&.content-left {
				text-align: left;
			}
			&.normal{
				color: $font-color-dark;
			}
		}
		&.textarea {
			align-items: inherit;
			.cell-content {
				padding-top: 10rpx;
				height: 500rpx;
			}
		}
	}
}
.desc{
	font-size: $font-sm;
	color: $font-color-disabled;
}
.cell-more.yticon{
	font-size: $font-llg;
	margin-left: 16rpx;
}
</style>
