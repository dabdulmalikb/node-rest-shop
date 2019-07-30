const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const mongoose = require("mongoose");
const multer = require("multer"); // used for file / image upload

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function(req, file, cb) {
    const now = new Date().toISOString();
    const date = now.replace(/:/g, "-");
    cb(null, date + "-" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    //accepts a file. saves a file
    cb(null, true);
  } else {
    //rejects file. WIll not save file.
    cb(null, false);
  }
};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});
//1024 * 1024 * 5 = 5 MB

// router.get("/", (req, res, next) => {
//   res.status(200).json({
//     message: "Handling GET requests to /products"
//   });
// });

router.get("/", (req, res, next) => {
  Product.find()
    .select("name price _id productImage")
    .exec()
    .then(docs => {
      if (docs.length >= 0) {
        const response = {
          count: docs.length,
          products: docs.map(doc => {
            return {
              name: doc.name,
              price: doc.price,
              _id: doc._id,
              productImage: doc.productImage,
              request: {
                type: "GET",
                url: "http://localhost:3000/products/" + doc._id
              }
            };
          })
        };
        res.status(200).json(response);
      } else {
        res.status(404).json({ message: "No data found." });
      }
    })
    .catch(err => {
      console.log(err);
      req.status(500).json({ error: err });
    });
});

router.post("/", upload.single("productImage"), (req, res, next) => {
  // const product = {
  //   name: req.body.name,
  //   price: req.body.price
  // };
  console.log(req.file); // this gives ALL file info. like file name path destination
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path
  });

  //Save product to MongoDB
  product
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Created Product successfully.",
        createdProduct: {
          name: result.name,
          price: result.price,
          _id: result._id,
          request: {
            type: "GET",
            url: "http://localhost:3000/" + result._id
          }
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.get("/:productId", (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    .exec()
    .then(doc => {
      console.log("from Local DB: " + doc);
      if (doc) {
        const response = {
          product: {
            name: doc.name,
            price: doc.price,
            _id: doc._id
          }
        };
        res.status(200).json(response);
      } else {
        res.status(404).json({ message: "No Data found with Id: " + id });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.patch("/:productId", (req, res, next) => {
  const id = req.params.productId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Product.update(
    { _id: id },
    { $set: updateOps }
    // Or this { $set: { name: req.body.newName, price: req.body.newPrice } }
  )
    .exec()
    .then(result => {
      console.log("UPDATE Request. " + result);
      res.status(200).json({
        message: "Product updated successfully.",
        request: {
          type: "GET",
          url: "http://localhost:3000/products/" + id
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.delete("/:productId", (req, res, next) => {
  const id = req.params.productId;
  Product.remove({ _id: id })
    .exec()
    .then(result => {
      console.log(result);
      res.status(200).json({
        message: "Product deleted successfully."
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});
module.exports = router;
