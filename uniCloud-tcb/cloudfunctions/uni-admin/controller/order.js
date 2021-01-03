const {
	Controller
} = require('uni-cloud-router')
const uniID = require('uni-id');
module.exports = class OrderController extends Controller {
	async selftake() {
		const {
			id
		} = this.ctx.data;
		return this.service.order.updateSelfTakeOrderByRid(id);
	}
}
