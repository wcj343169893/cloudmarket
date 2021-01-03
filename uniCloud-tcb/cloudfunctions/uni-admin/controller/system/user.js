const {
	Controller
} = require('uni-cloud-router')
const uniID = require('uni-id')
module.exports = class UserController extends Controller {
	async addUser() {
		const {
			username,
			password,
			role,
			mobile,
			email,
			status
		} = this.ctx.data

		const result = await uniID.register({
			username,
			password,
			role,
			mobile,
			email,
			status
		})
		delete result.token
		delete result.tokenExpired

		return result
	}
}
