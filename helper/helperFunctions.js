let easyinvoice = require("easyinvoice");
const pdfKit = require("pdfkit");
let fs = require("fs");

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

exports.createPdf = function(doc) {
	for(let res of doc) {
		try {
		let clinicLogo = "./logo/clinicLogo.png";
		let fileName = "./InvoicesPdf/invoice " + res._id + ".pdf";
		let fontNormal = "Helvetica";
		let fontBold = "Helvetica-Bold";
		let total = 0;
		let services = [];
		for (let i = 0; i < res.services.length; i++) {
			services.push({
				id: res._id,
				name: res.services[i].doctorId.specialty.specialty,
				company: "Acer",
				unitPrice: res.services[i].price,
				totalPrice: res.services[i].price,
			});
			total += 1 * res.services[i].price;
		}
		let sellerInfo = {
			companyName: "ITI clinic",
			city: res.clinicId.location.city,
			street: res.clinicId.location.street,
			country: "Egypt",
			contactNo: res.clinicId.mobilePhone,
		};
	
		let customerInfo = {
			customerName: res.patientId.firstName + " " + res.patientId.lastName,
			city: res.patientId.address.city,
			street: res.patientId.address.street,
			country: "Egypt",
			contactNo: res.patientId.phone,
		};
		let orderInfo = {
			orderNo: res._id,
			invoiceNo: res._id,
			clinicId: res.clinicId._id,
			patientId: res.patientId._id,
			invoiceDate: res.date,
			invoiceTime: res.time,
			products: services,
			totalValue: total,
		};
		let pdfDoc = new pdfKit();
		let stream = fs.createWriteStream(fileName);
		pdfDoc.pipe(stream);
	
		pdfDoc.text("Clinic", 5, 5, { align: "center", width: 600 });
		pdfDoc.image(clinicLogo, 25, 20, { width: 50, height: 50 });
		pdfDoc.font(fontBold).text("ITI CLINICS", 7, 75);
		pdfDoc.font(fontNormal).fontSize(14).text("Order Invoice/Bill Receipt", 400, 30, { width: 200 });
		pdfDoc.fontSize(10).text(res.date, 400, 46, { width: 200 });
	
		pdfDoc.font(fontBold).text("Clinic info:", 7, 100);
		pdfDoc.font(fontNormal).text(sellerInfo.companyName, 7, 115, { width: 250 });
		pdfDoc.text(sellerInfo.street, 7, 130, { width: 250 });
		pdfDoc.text(sellerInfo.city, 7, 145, { width: 250 });
	
		pdfDoc.font(fontBold).text("Patient details:", 400, 100);
		pdfDoc.font(fontNormal).text(customerInfo.customerName, 400, 115, { width: 250 });
		pdfDoc.text(customerInfo.street, 400, 130, { width: 250 });
		pdfDoc.text(customerInfo.city, 400, 145, { width: 250 });
	
		pdfDoc.text("Order No:" + orderInfo.orderNo, 7, 195, { width: 250 });
		pdfDoc.text("Invoice No:" + orderInfo.invoiceNo, 7, 210, { width: 250 });
		pdfDoc.text("Clinic No:" + orderInfo.clinicId, 7, 225, { width: 250 });
		pdfDoc.text("Patient No:" + orderInfo.patientId, 7, 240, { width: 250 });
		pdfDoc.text("Date:" + orderInfo.invoiceDate + " " + orderInfo.invoiceTime, 7, 255, { width: 250 });
	
		pdfDoc.rect(7, 250, 560, 20).fill("#03bde6").stroke("#FC427B");
		pdfDoc.fillColor("#fff");
		pdfDoc.text("Service", 110, 256, { width: 190 });
		pdfDoc.text("Price", 400, 256, { width: 100 });
		pdfDoc.text("Total Price", 500, 256, { width: 100 });
		let productNo = 1;
		orderInfo.products.forEach((element) => {
			console.log("adding", element.name);
			let y = 256 + productNo * 20;
			pdfDoc.fillColor("#000");
			pdfDoc.text(element.name, 110, y, { width: 190 });
			pdfDoc.text(element.unitPrice, 400, y, { width: 100 });
			pdfDoc.text(element.totalPrice, 500, y, { width: 100 });
			productNo++;
		});
	
		pdfDoc
			.rect(7, 256 + productNo * 20, 560, 0.2)
			.fillColor("#000")
			.stroke("#000");
		productNo++;
	
		pdfDoc.font(fontBold).text("Total:", 400, 256 + productNo * 17);
		pdfDoc.font(fontBold).text(total, 500, 256 + productNo * 17);
		pdfDoc.end();
		console.log("pdf generate successfully");
		} catch (error) {
			console.log("Error occurred", error);
		}
	}
}