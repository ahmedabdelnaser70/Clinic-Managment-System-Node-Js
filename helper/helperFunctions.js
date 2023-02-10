exports.intoNumber = function(...arr) {
	let result = [];
	for(let el of arr) {
		result.push(+el);
	}
	return result;
}
