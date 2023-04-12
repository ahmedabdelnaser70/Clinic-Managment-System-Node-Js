const express = require("express");
const app = express();
const mongoose = require("mongoose");
const doctorRouter = require("./Routes/doctorRoute");
const patientRouter = require("./Routes/patientRoutes");
const clinicRouter = require("./Routes/clinicRoutes");
const appointmentRouter = require("./Routes/appointmentRoute");
const  medicineRoutes = require('./Routes/MedicineRoute');
const employeeRouter = require("./Routes/employeeRouter");
const loginRouter = require('./Routes/loginRoute');
const paymentRouter = require('./Routes/payment');
const authenticatioMW = require('./Middlewares/authentication');
const presciptionRouter = require("./Routes/prescriptionRoutes");
const reportRouter = require("./Routes/reportRoute");
const invoiceRouter = require("./Routes/invoiceRouter");
const publicRouter = require("./Routes/publicRoutes");
const userRouter = require("./Routes/userRouters");
const specailtyRouter = require("./Routes/specialtyRoute");
const cors = require("cors");
const morgan = require("morgan");

require("dotenv").config();
let port = process.env.PORT || 8080;
mongoose.set("strictQuery", true);
mongoose
   .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
   })
   .then(function () {
      //4
      console.log("DB is connected");
      app.listen(port, () => {
         // to start Node server after DB connection start
         console.log("Listening", port);
      });
   })
   .catch(function (error) {
      //5
      console.log("DB Problem" + error);
   });

app.use(express.json());

const fs = require('fs');
app.use(
	morgan("tiny", {
		stream: fs.createWriteStream("./access.log", {
			flags: "a",
		}),
	})
);

app.use(cors());
app.use("/uploads/images", express.static("uploads/images"));

//register route
app.use(publicRouter);

//login layer
app.use(loginRouter);

//check if request contains a token
app.use(authenticatioMW.authentication);

//Second Middleware
app.use(userRouter);
app.use(clinicRouter);
app.use(doctorRouter);
app.use(patientRouter);
app.use(appointmentRouter);
app.use(medicineRoutes);
app.use(employeeRouter);
app.use(presciptionRouter);
app.use(reportRouter);
app.use(paymentRouter);
app.use(invoiceRouter);
app.use(specailtyRouter);


//Third Middleware
app.use((request, response, next) => {
   response.status(404).json({Data: "Not Found"});
});

// Error MiddleWare
app.use((error, response) => {
   const status = error.status || 500
   response.status(500).json({message: "tarek"});
});
