const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

// const Url = global.API.MONGO_URL;
const Url = "mongodb://root:%4091wealTH1314!@127.0.0.1:9117";
// const Url = "mongodb%3A%2F%2Froot%3A%4091wealTH1314!%40127.0.0.1%3A9117";
// const Url = "mongodb://root:@91wealTH1314!@127.0.0.1:9117";
const DbName = "smxsdezx";

function Dao () {
	this.MongoClient = MongoClient;
	this.Url = Url;
	this.DbName = DbName;
}

/** mongoDB 链接 */
Dao.prototype.connect = function () {
	return this.MongoClient.connect(this.Url, { useNewUrlParser: true, useUnifiedTopology: true});
}

Dao.prototype.getTotal = function (collectionName) {
	return this.connect().then(
		(client) => {
			const db = client.db(this.DbName);
			const len = db.collection(collectionName).countDocuments();
			client.close();
			return Promise.resolve(len);
		},
		(err) => {
			console.log("db connection error");
			return Promise.reject("数据库连接失败");
		}
	)
};

/** mongoDB 插入 */
Dao.prototype.insertOne = function (collectionName, insertStr) {
	return this.connect().then((client) => {
		const db = client.db(this.DbName);
		return db.collection(collectionName).insertOne(insertStr).then((res) => {
			client.close();
			return Promise.resolve(res.result);	
		}).catch((err) => {
			client.close();
			return Promise.reject("插入失败");
		});
	});
} 

/** mongoDB 更新 */
Dao.prototype.updateOne = function (collectionName, whereStr, updateStr) {
	return this.connect().then((client) => {
		const db = client.db(this.DbName);
		return db.collection(collectionName).updateOne(whereStr, updateStr).then((res) => {
			client.close();
			return Promise.resolve(res);
		}).catch((err) => {
			client.close();
			return Promise.reject("更新失败")
		});
	});
}

/** mongoDB 分页查 */
Dao.prototype.findByPage = function (collectionName, findStr, limitStr, sortStr, pageNo, pageSize) {
	return this.connect().then((client) => {
		const db = client.db(this.DbName);
		return db.collection(collectionName).find(findStr).project(limitStr).skip((pageNo - 1) * pageSize).collation({"locale": "zh", numericOrdering:true}).sort(sortStr).limit(pageSize).toArray().then((data) => {
			client.close();
			return Promise.resolve(data);
		}).catch((err) => {
			client.close();
			return Promise.reject("查询失败");
		});
	});
}

/** mongoDB 查找 */
Dao.prototype.find = function (collectionName, findStr) {
	return this.connect().then((client) => {
		const db = client.db(this.DbName);
		return db.collection(collectionName).find(findStr).toArray().then((data) => {
			client.close();
			return Promise.resolve(data);
		}).catch((err) => {
			client.close();
			return Promise.reject("查询失败");
		});
	});
}

/** [mongoDB 删除] */
Dao.prototype.deleteOne = function (collectionName, delStr) {
	return this.connect().then((client) => {
		const db = client.db(this.DbName);
		return db.collection(collectionName).deleteOne(delStr).then((res) => {
			client.close();
			return Promise.resolve(res);
		}).catch((err) => {
			client.close();
			return Promise.reject("删除失败");
		});
	});
}

/** mongoDB 某个字段自增n */
Dao.prototype.addViews = function (collectionName, findStr) {
	return this.connect().then((client) => {
		const db = client.db(this.DbName);
		return db.collection(collectionName).find(findStr).forEach((item) => {
			db.collection(collectionName).updateOne(findStr, {"$set":{ views: parseInt(item.views) + 1 }});
		}).then((res) => {
			client.close();
			return Promise.resolve(res);
		}).catch((err) => {
			client.close();
			return Promise.reject("阅读数增加失败");
		});
	});
}


module.exports = Dao;