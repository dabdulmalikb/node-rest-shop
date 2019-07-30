const express = require("express");
const app = express();
const morgan = require("morgan"); //morgan is used for logging ....
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const productRoutes = require("./api/routes/products");
const orderRoutes = require("./api/routes/orders");
const userRouters = require("./api/routes/user");

//The below is to connect to the ***Mongo ATLAS***
// mongoose
//   .connect(
//     "mongodb+srv://node-shop:" +
//       process.env.MONGO_ATLAS_PWD +
//       "@node-rest-shop-uorp9.mongodb.net/test?retryWrites=true",
//     { useNewUrlParser: true }
//   )
//   .then(() => {
//     console.log("DB connected successfully.");
//   })
//   .catch(err => {
//     console.log("Unable to connect to DB. : " + err);
//   });

//The Below connection is to the Local Mongo DB
mongoose
  .connect("mongodb://localhost:27017/node-shop", {
    useCreateIndex: true,
    useNewUrlParser: true
  })
  .then(() => {
    console.log("DB connected successfully.");
  })
  .catch(err => {
    console.log("Unable to connect to DB. : " + err);
  });

mongoose.Promise = global.Promise;
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads")); // this will make the 'uploads' folder publicly available.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/user", userRouters);

//The below for the initial testing the server. *** START
// app.use((req, res, next) => {
//   res.status(200.json({
//     message: "API working !"
//   });
// });

//The below for the initial testing the server. *** END

//Error handling. If the URI is incorrect
app.use((req, res, next) => {
  const error = new Error("URI NOT FOUND");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});
//Error handling END.

module.exports = app;
