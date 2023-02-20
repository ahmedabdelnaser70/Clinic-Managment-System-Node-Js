exports.intoNumber = function(...arr) {
	let result = [];
	for(let el of arr) {
		result.push(+el);
	}
	return result;
}

exports.sortAndFiltering = function(request) {
	let reqQuery = JSON.stringify(request.query);
	reqQuery = reqQuery.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
	reqQuery = JSON.parse(reqQuery);
	let selectedFields = {};
	let sortedFields = {};
	if(reqQuery.select) {
		for(let field of reqQuery.select.split(',')) {
			selectedFields[field.trim()] = 1;
		}
		if(reqQuery.select.split(',').indexOf('clinic') == -1) {
			selectedFields["clinic"] = 0;
		}
	}
	if(reqQuery.sort) {
		for(let field of reqQuery.sort.split(',')) {
			if(field.trim().startsWith("-")) {
				sortedFields[field.trim().split("-").join("")] = -1;
			}
			else {
				sortedFields[field.trim()] = 1;
			}
		}
	}

	return {reqQuery, selectedFields, sortedFields}
}