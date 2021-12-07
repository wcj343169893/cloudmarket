const uniID = require('uni-id')
module.exports = (options) => {
	// 返回中间件函数
	return async function auth(ctx, next) {
		ctx.uniID = uniID.createInstance({ // 自行创建uni-id实例，传入context，后续均使用此uniID调用相关接口
			context: ctx.context
		})
		await next() // 执行后续中间件
	}
}
