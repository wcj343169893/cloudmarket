'use strict';
const printers = require('printers');
exports.main = async (event, context) => {
	/* const res =await printers.getPrintStatus({
		module:"feieyun",
			clientId:"183740601@qq.com",
			clientSecret:"UeCQX3s5AXAbhark",
			machine:"217513770"
	}); */
	/* const res = await printers.addPrinter({
		module: "feieyun",
		clientId: "183740601@qq.com",
		clientSecret: "UeCQX3s5AXAbhark",
		machine: "217513770",
		msign:"123456"
	}); */
	const res = await printers.println({},{
		module: "feieyun",
		clientId: "183740601@qq.com",
		clientSecret: "UeCQX3s5AXAbhark",
		machine: "217513770"
	});
	return res
};
