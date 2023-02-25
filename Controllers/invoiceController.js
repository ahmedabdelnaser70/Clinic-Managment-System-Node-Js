const mongoose = require("mongoose");
require("../Models/invoiceModel");
const invoiceSchema = mongoose.model("invoices");
let easyinvoice = require("easyinvoice");
let fs = require("fs");

exports.getInvoiceByID = (request, response, next) => {
   invoiceSchema
      .findOne({ _id: request.params.id }, { __v: 0 })
      .then((res) => {
         if (res) {
            createPdf(res);
            response.status(200).json(res);
         } else next(new Error("invoices doesn't exist"));
      })
      .catch((error) => next(error));
};

exports.addInvoice = async (request, response, next) => {
   let data = {
      client: { company: "Client Corp", address: "Clientstreet 456", zip: "4567 CD", city: "Clientcity", country: "Clientcountry" },
      sender: { company: "Sample Corp", address: "Sample Street 123", zip: "1234 AB", city: "Sampletown", country: "Samplecountry" },
      images: { logo: "https://public.easyinvoice.cloud/img/logo_en_original.png" },
      information: {
         number: request.body.clinicId,
         "due-date": request.body.patientId,
         date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "numeric", year: "numeric" }),
      },
      products: [
         { quantity: "2", description: "Medicine1", "tax-rate": 6, price: 33.87 },
         { quantity: "4", description: "Medicine2", "tax-rate": 21, price: 10.45 },
      ],
      bottomNotice: "Kindly pay your invoice within 15 days.",
      settings: { currency: "USD" },
      translate: {},
      customize: {},
   };

   await easyinvoice.createInvoice(data, function (result) {
      fs.writeFileSync("./InvoicesPdf/invoice" + data.information.number + ".pdf", result.pdf, "base64");
   });

   let newInvoice = new invoiceSchema({
      _id: request.params.id,
      clinicId: request.body.clinicId,
      patientId: request.body.patientId,
      medicine: request.body.medicine,
      quantity: request.body.quantity,
      total: request.body.total,
   });
   await newInvoice
      .save()
      .then((result) => {
         response.status(200).json(result);
      })
      .catch((error) => next(error));
};

exports.updateInvoice = (request, response, next) => {
   invoiceSchema.findOne({ _id: request.params.id }, { _id: 1 }).then(function (data) {
      if (data != null) {
         invoiceSchema
            .updateOne(
               { _id: request.params.id },
               {
                  $set: {
                     clinicId: request.body.clinicId,
                     patientId: request.body.patientId,
                     medicine: request.body.medicine,
                     quantity: request.body.quantity,
                     total: request.body.total,
                  },
               }
            )
            .then((result) => {
               if (result.modifiedCount == 0) {
                  response.status(200).json({ Updated: true, Message: "Nothing is changed" });
               } else {
                  response.status(200).json({ Updated: true, Message: "Invoice is updated successfully" });
               }
            })
            .catch((error) => next(error));
      } else {
         next(new Error("This Invoice not found"));
      }
   });
};

exports.deleteInvoice = (request, response, next) => {
   invoiceSchema
      .deleteOne({ _id: request.params.id })
      .then((result) => {
         if (result.acknowledged && result.deletedCount == 1) {
            response.status(200).json({ Deleted: true, Message: "This Invoice is deleted successfully" });
         } else {
            response.status(200).json({ Deleted: false, Message: "This Invoice is not found" });
         }
      })
      .catch((error) => next(error));
};

function createPdf(res) {
   try {
      let clinicLogo = "./images/clinicLogo.png";
      let fileName = "./InvoicesPdf/invoice" + res.patientId + ".pdf";
      let fontNormal = "Helvetica";
      let fontBold = "Helvetica-Bold";

      let sellerInfo = {
         companyName: "ITI clinic",
         address: "Mansoura",
         city: "Mansoura",
         pincode: "400017",
         country: "Egypt",
         contactNo: "01065183989",
      };

      let customerInfo = {
         customerName: "Walid ABC",
         address: "Assiut",
         city: "Assiut",
         pincode: "400054",
         country: "Egypt",
         contactNo: "01065183989",
      };

      let orderInfo = {
         orderNo: res._id,
         invoiceNo: res._id,
         clinicId: res.clinicId,
         patientId: res.patientId,
         invoiceDate: res.date,
         invoiceTime: "10:57:00 PM",
         products: [
            {
               id: "15785",
               name: res.medicine,
               company: "Acer",
               unitPrice: res.total,
               totalPrice: res.quantity * res.total,
               qty: res.quantity,
            },
         ],
         totalValue: res.quantity,
      };

      let pdfDoc = new pdfKit();
      let stream = fs.createWriteStream(fileName);
      pdfDoc.pipe(stream);

      pdfDoc.text("Clinic", 5, 5, { align: "center", width: 600 });
      pdfDoc.image(clinicLogo, 25, 20, { width: 50, height: 50 });
      pdfDoc.font(fontBold).text("PARALLELCODES", 7, 75);
      pdfDoc.font(fontNormal).fontSize(14).text("Order Invoice/Bill Receipt", 400, 30, { width: 200 });
      pdfDoc.fontSize(10).text(res.date, 400, 46, { width: 200 });

      pdfDoc.font(fontBold).text("Sold by:", 7, 100);
      pdfDoc.font(fontNormal).text(sellerInfo.companyName, 7, 115, { width: 250 });
      pdfDoc.text(sellerInfo.address, 7, 130, { width: 250 });
      pdfDoc.text(sellerInfo.city + " " + sellerInfo.pincode, 7, 145, { width: 250 });

      pdfDoc.font(fontBold).text("Customer details:", 400, 100);
      pdfDoc.font(fontNormal).text(customerInfo.customerName, 400, 115, { width: 250 });
      pdfDoc.text(customerInfo.address, 400, 130, { width: 250 });
      pdfDoc.text(customerInfo.city + " " + customerInfo.pincode, 400, 145, { width: 250 });

      pdfDoc.text("Order No:" + orderInfo.orderNo, 7, 195, { width: 250 });
      pdfDoc.text("Invoice No:" + orderInfo.invoiceNo, 7, 210, { width: 250 });
      pdfDoc.text("Clinic No:" + orderInfo.clinicId, 7, 225, { width: 250 });
      pdfDoc.text("Patient No:" + orderInfo.patientId, 7, 240, { width: 250 });
      pdfDoc.text("Date:" + orderInfo.invoiceDate + " " + orderInfo.invoiceTime, 7, 255, { width: 250 });

      pdfDoc.rect(7, 250, 560, 20).fill("#03bde6").stroke("#FC427B");
      pdfDoc.fillColor("#fff");
      pdfDoc.text("Product", 110, 256, { width: 190 });
      pdfDoc.text("Qty", 300, 256, { width: 100 });
      pdfDoc.text("Price", 400, 256, { width: 100 });
      pdfDoc.text("Total Price", 500, 256, { width: 100 });

      let productNo = 1;
      orderInfo.products.forEach((element) => {
         console.log("adding", element.name);
         let y = 256 + productNo * 20;
         pdfDoc.fillColor("#000");
         pdfDoc.text(element.name, 110, y, { width: 190 });
         pdfDoc.text(element.qty, 300, y, { width: 100 });
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
      pdfDoc.font(fontBold).text(res.quantity * res.total, 500, 256 + productNo * 17);

      pdfDoc.end();
      console.log("pdf generate successfully");
   } catch (error) {
      console.log("Error occurred", error);
   }
}
