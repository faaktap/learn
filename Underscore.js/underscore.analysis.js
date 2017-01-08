// Underscore.js 1.8.3
// http://underscorejs.org
// (c) 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
// Underscore may be freely distributed under the MIT license.

(function () {
	// 基础定义

	// 由于underscore即支持浏览器端运行,又支持服务端运行,所以,需要判定根节点是'window'对象还是'global'对象

	// 值得注意的是, 如果当前系统中存在了self对象,且满足一定条件,那么他表示的就是浏览器端的根对象(全局对象)

	var root = typeof self == 'object' && self.self === self && self || typeof global == 'object' && global.global === global && global || this
	console.log(root)

	// 如果之前系统存在了_, 那么保存, 而不是粗暴的替换
	var previousUnderscore = root._
	console.log(previousUnderscore)

	// 保存常用原型的引用, 避免对象属性的查找开销
	var ArrayProto = Array.prototype,
		ObjProto = Object.prototype
	var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null

	// 保存常用方法的引用, 避免属性查找的性能开销
	var push = ArrayProto.push,
		slice = ArrayProto.slice,
		toString = ObjProto.toString,
		hasOwnPrototype = ObjProto.hasOwnPrototype

	// 保存一些ES5常用的原生方法引用
	var nativeIsArray = Array.isArray,
		nativeKeys = Object.keys,
		nativeCreate = Object.create

	// Ctor: 亦即constructor的缩写，这个空的构造函数将在之后广泛用于对象创建
	var Ctor = function () {}

	// 创建一个underscore的对象引用, 保证不重复创建
	var _ = function (obj) {
		// 本来就是_直接返回
		if (obj instanceof _) return obj

		// 绑定的this不是_，返回 new _(obj)
		if (!(this instanceof _)) {
			return new _(obj)
		}

		this._wrapper = obj
	}

	// var a = (new _({
	// 	a: 1
	// }))
	// console.log(a instanceof _) => true
	// ======>
	// _{
	// 	_wrapper:{
	// 		a:1
	// 	}
	// }

	// 将underscore对象挂载到合适的位置
	if (typeof exports != 'undefined' && !exports.nodeType) {
		if (typeof module != 'undefined' && !module.nodeType && module.exports) {
			exports = module.exports = _
		}
		exports._ = _
	} else {
		root._ = _
	}

	// Current version.
	_.VERSION = '1.8.3';

	// Internal function that returns an efficient (for current engines) version of the passed-in callback, to be repeatedly applied in other Underscore functions.
	/** 优化回调（特指函数中传入的回调）
	 * @param func 待优化的回调函数
	 * @param context 执行的上下文
	 * @param argCount 参数个数
	 * @returns {*}
	 */

	var optimizeCb = function (func, context, argCount) {
		// void 0 返回纯正的undefined，避免undefined已经被污染
		// 一定要保证回调的执行上下文存在

		if (context === void 0) {
			return func
		}


		switch (argCount == null ? 3 : argCount) {
			// 回调参数1个的时候，迭代过程中我们只需要值
		case 1:
			return function (value) {
				return func.call(context, value)
			}

			// 两个的情况基本不存在
			// 三个（值，索引，被迭代集合对象）
		case 3:
			return function (value, index, collection) {
				return func.call(context, value, index, collection)
			}

			// 四个参数（比如reducer需要），值，索引，被迭代的集合对象

		case 4:
			return function (accumulator, value, index, collection) {
				return func.call(context, accumulator, value, index, collection)
			}
		}

		return function () {
			return func.apply(context, arguments)
		}
	}

	// var test = optimizeCb(function(value) {
	// 	console.log(value)
	// }, this, 1)

	// test(1)

	var builtinIteratee

	// An internal function to generate callbacks that can be applied to each element in a collection, returning the desired result — either `identity`, an arbitrary callback, a property matcher, or a property accessor.

	// 为迭代过程中的元素生产一个回调函数，该回调函数能够应用到集合中的每个元素
	// @param value
	// @param context
	// @param argCount
	// @example
	// 在 _.map 函数中
	// _.map = .collect = function(obj, iteratee, context) {
	// 	iteratee = cb(iteratee, context)
	// 		// 同样，根据obj是对象还是数组分别考虑

	// 	var keys = !isArrayLike(obj) && _.keys(obj),
	// 		length = (keys || obj).length,
	// 		results = Array(length)

	// 	for (var index = 0; index < length; index++) {
	// 		var currentKey = keys ? keys[index] : index;
	// 		results[index] = iteratee(obj[currentKey], currentKey, obj)
	// 		return results
	// 	}
	// }

	var cb = function (value, context, argCount) {
		// 是否用默认的迭代器
		if (_.iteratee !== builtinIteratee) {
			return _.iteratee(value, context)
		}

		// 如果value不存在，回调只是一个返回自身的函数
		if (value == null) {
			return _.identity
		}

		// 如果value是一个回调函数，需要优化
		// var even = _.find([1,2,3,4,5,6],function(){return num % 2 = 0})

		if (_.isFunction(value)) {
			return optimizeCb(value, context, argCount)
		}

		// 如果value是一个对象，需要返回一个matcher进行对象匹配
		// _find(obj,{x:2})
		if (_.isObject(value)) {
			return _.matcher(value)
		}

		// 否则，如果value只是一个字面值，把value看作是属性名称，返回一个对应的属性获取函数
		return _.property(value)
	}

	// External wrapper for our callback generator. Users may customize `_.iteratee` if they want additional predicate/iteratee shorthand styles.This abstraction hides the internal-only argCount argument.
	// 内置的迭代回调
	// @param value
	// @param context

	_.iteratee = builtinIteratee = function (value, context) {
		return cb(value, context, Infinity)
	}

	// 类似 ES6 rest 参数的实现，使某个函数具备rest参数的能力
	// @param func 需要rest参数的函数
	// @param startIndex 从哪里开始标志rest参数，如果不传递，默认最后一个参数为rest
	// @returns {Function} 返回一个具有rest参数的函数

	var restArgs = function (func, startIndex) {
		// rest参数从哪里开始，如果没有，默认函数最后一个参数为rest参数
		// 注意，函数对象的length属性，节食了函数的参数个数
		// ex:
		// function add(a,b){return a+b;}
		// console.log(add.length) //2

		startIndex = startIndex == null ? func.length - 1 : +startIndex

		// 返回一个支持rest参数的函数
		return function () {
			// 矫正参数，以免出现负值的情况
			var length = Math.max(arguments.length - startIndex, 0)

			var rest = Array(length)

			// 假设参数从2开始，func(a,b,*rest)
			// 调用: func(1,2,3,4,5)
			// 实际调用的是 func.call(this,1,2,[3,4,5])

			for (var index = 0; index < length; index++) {
				rest[index] = arguments[index + startIndex]
			}

			switch (startIndex) {
			case 0:
				// call的参数一个个传
				return func.call(this, rest)
			case 1:
				return func.call(this, arguments[0], rest)
			case 2:
				return func.call(this, arguments[0], arguments[1], rest)
			}

			// 如果上面三个都不是
			var args = Array(startIndex + 1)

			// 先拿到前面的参数 
			for (index = 0; index < startIndex; index++) {
				args[index] = arguments[index]
			}

			// 拼接剩余的参数
			args[startIndex] = rest
			return func.apply(this, args)
		}
	}

	// 加法运算，最少两个参数
	// var add = restArgs(function (a, b, c) {
	// 	// console.log(a, b, c)
	// 	return a + b + c.reduce(function (result, cur) {
	// 		return result + cur
	// 	}, 0)
	// }, 2)

	// console.log(add(1, 2, 3, 4, 5, 6, 7))

	// 创建一个对象，该对象继承自prototype
	// 保证该对象的原型上挂载属性不会影响所继承的prototype
	// @param {object} prototype

	var baseCreate = function (prototype) {
		if (!_.isObject(prototype)) {
			return {}
		}
		// 存在原生的方法， Object.create，用原生的创建
		if (nativeCreate) {
			return nativeCreate(prototype)
		}

		// 利用Ctor这个空函数，临时设置对象原型
		Ctor.prototype = prototype

		var result = new Ctor

		Ctor.prototype = null

		return result
	}

	// property('name')(Tiger) 获取对象属性
	// 体现了函数式编程的灵活
	// var nameProperty = property('name')

	var property = function (key) {
		return function (obj) {
			return obj == null ? void 0 : obj[key]
		}
	}

	var test = {
			name: 'cody'
		}
		// var getName = property('name')
		// console.log(getName(test))

	// 最大的数组长度，扁面ios 8出现的bug
	var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1

	// console.log(MAX_ARRAY_INDEX)

	// 对象有长度吗0.0
	// 设置一个常用方法，获取对象长度
	// 如果在oo开发中，获取对象长度属性obj.length
	// 而在FP中，对象只是数据的一个表现方式，只是倍函数所加工:getLength(obj)

	var getLength = property('length')

	// console.log(getLength(test))

	// 判断集合是否近似数组，方便集合迭代过程中的循环判断
	// 

})()

console.dir(_)
