'use strict';
const db = uniCloud.database()
exports.main = async (event, context) => {
	// 获取 `user` 集合的引用
	const collection = db.collection('ads');
	const data =await collection.limit(5).get();
  //event为客户端上传的参数
  console.log('event : ' + event);
  //返回数据给客户端
  return data;
};
