var express = require("express");
var router = express.Router();

var store = require("store");
var axios = require("axios");
var sha256 = require("sha256");
var uniqid = require("uniqid");
const { UserModel, MessageModel } = require("../models/Info");
const multer = require("multer");

let inMemoryDatabase = [];
let sessionInfo = {};
let documentInfo = {};
let order;

const storage = multer.memoryStorage();
const update = multer({ storage: storage });

router.post("/", update.array("image"), async (req, res) => {
  documentInfo = {};
  sessionInfo = {};
  order = undefined;

  try {
    if (req.files) {
      inMemoryDatabase = [];
      const fileDetails = req.files.map((file) => ({
        filename: file.originalname,
        contentType: file.mimetype,
        data: file.buffer.toString("base64"),
      }));
      inMemoryDatabase.push(...fileDetails);
    }

    if (req.session.user) {
      const user = req.session.user;
      sessionInfo = { user };
      const userName = user.name;
      const userEmail = user.email;
      const documentName = req.body.documentName;
      const price = req.body.documentPrice;
      order = user.order;
      documentInfo = {
        documentName: documentName,
        price: price,
      };
      const info = {
        documentName: documentName,
        price: price,
        name: userName,
        email: userEmail,
      };
      res.render("payOrder", {
        info: info,
        res: "please proceed for payment",
        flag: undefined,
      });
    } else {
      res.render("error", { error: "need to login first" });
    }
  } catch (error) {
    res.render("error", { error: error });
  }
});

router.post("/payment", async (req, res, next) => {
  try {
    const price = documentInfo.price;
    let tx_uuid = uniqid();
    store.set("uuid", { tx: tx_uuid });
    let normalPayLoad = {
      merchantId: "PGTESTPAYUAT",
      merchantTransactionId: tx_uuid,
      merchantUserId: "MUID123",
      amount: price * 100,
      redirectUrl: "http://localhost:3030/pay/pay-return-url/",
      redirectMode: "POST",
      callbackUrl: "http://localhost:3030/pay/pay-return-url/",
      mobileNumber: "9999999999",
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };
    let saltKey = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
    let saltIndex = 1;

    let bufferObj = Buffer.from(JSON.stringify(normalPayLoad), "utf8");
    let base64String = bufferObj.toString("base64");

    let string = base64String + "/pg/v1/pay" + saltKey;

    let sha256_val = sha256(string);
    let checksum = sha256_val + "###" + saltIndex;

    const response = await axios.post(
      "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay",
      {
        request: base64String,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          accept: "application/json",
        },
      }
    );
    console.log(response.data.data.instrumentResponse.redirectInfo.url);
    res.redirect(response.data.data.instrumentResponse.redirectInfo.url);
  } catch (error) {
    console.log(error);
    res.render("error2");
  }
});

router.all("/pay-return-url", async (req, res, next) => {
  try {
    req.session.user = sessionInfo.user;

    if (req.session.user) {
      const user = req.session.user;
      const userName = user.name;
      const userEmail = user.email;
      const documentName = documentInfo.documentName;
      const price = documentInfo.price;
      const info = {
        documentName: documentName,
        price: price,
        name: userName,
        email: userEmail,
      };

      if (
        req.body.code == "PAYMENT_SUCCESS" &&
        req.body.merchantId &&
        req.body.transactionId &&
        req.body.providerReferenceId
      ) {
        let saltKey = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
        let saltIndex = 1;

        let surl =
          "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/PGTESTPAYUAT/" +
          req.body.transactionId;

        let string =
          "/pg/v1/status/PGTESTPAYUAT/" + req.body.transactionId + saltKey;

        let sha256_val = sha256(string);
        let checksum = sha256_val + "###" + saltIndex;

        try {
          const response = await axios.get(surl, {
            headers: {
              "Content-Type": "application/json",
              "X-VERIFY": checksum,
              "X-MERCHANT-ID": req.body.transactionId,
              accept: "application/json",
            },
          });

          const data = response.data;
          const success_flag = data.success;

          if (success_flag) {
            const documentData = {
              documentName: documentName,
              date: new Date(),
              images: inMemoryDatabase,
            };

            const requestBody = {
              email: userEmail,
              documentData: documentData,
            };

            const formattedDate = new Date().toLocaleString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              timeZoneName: "short",
            });

            await UserModel.updateOne(
              { email: userEmail },
              { $set: { order: order + 1 } },
              { upsert: true }
            );

            await MessageModel.updateOne(
              { email: userEmail },
              {
                $push: {
                  "message.admin": {
                    $each: [
                      {
                        admsg: `you have successfully applied for ${documentName}`,
                        date: formattedDate,
                      },
                    ],
                    $position: 0,
                  },
                },
              },
              { upsert: true }
            );

            fetch("https://test-api-a9wn.onrender.com/uploads", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(requestBody),
            })
              .then((response) => {
                if (response.ok) {
                  return response.json();
                } else {
                  throw new Error(
                    `Error: ${response.status} - ${response.statusText}`
                  );
                }
              })
              .then((result) => {
                console.log(result.message);
              })
              .catch((error) => {
                console.log(error);
              });

            const success_message = data.message;
            return res.render("payOrder", {
              info: info,
              res: JSON.stringify(success_message),
              flag: success_flag,
            });
          } else {
            return res.render("error", { error: "Payment not successful" });
          }
        } catch (error) {
          console.error("Error during payment status check:", error);
          return res.render("error", { error: error });
        }
      } else {
        return res.render("error", { error: "Oops, payment not successful" });
      }
    } else {
      return res.render("error", { error: "You have been logged out" });
    }
  } catch (error) {
    return res.render("error", { error: error });
  }
});

module.exports = router;
