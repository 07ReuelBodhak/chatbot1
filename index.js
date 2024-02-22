const express = require("express");
const app = express();
const path = require("path");
const bcrypt = require("bcryptjs");
const {
  UserModel,
  documentModel,
  AdminModel,
  fileInfoModel,
  MessageModel,
} = require("./models/Info");
const mongoose = require("mongoose");
const crypto = require("crypto");
const session = require("express-session");
const bodyParser = require("body-parser");
const fs = require("fs");
const base64Img = require("base64-img");
const Grid = require("gridfs-stream");
const { GridFSBucket, ObjectId } = require("mongodb");
const { trainModel, processMessage, handleResponse } = require("./chatbot");
require("dotenv").config();
//------------------------------------------------------------------------

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

const secretKey = crypto.randomBytes(64).toString("hex");

var indexRouter = require("./routes/phonepe");

const atlasConnectionStr = process.env.MONGODB_CONNECT_URI;

mongoose
  .connect(atlasConnectionStr, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    key: "user__",
    secret: secretKey,
    resave: true,
    saveUninitialized: true,
    cookie: { expires: 6000000 },
  })
);

const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    res.redirect("/home");
  } else {
    next();
  }
};

//---------------------------------------------------------------------////

app.use("/pay", indexRouter);

//---------------------------------------------------------------------////

app.get("/", (req, res) => {
  res.render("login");
});

//---------------------------------------------------------------------////

app.post("/chat", async (req, res) => {
  const message = req.body.message;
  const response = await processMessage(message);
  const intent = response.intent;
  const reply = handleResponse(intent);
  res.json({ response: reply, intents: intent });
});

//---------------------------------------------------------------------////

async function downloadImage(fileId, res) {
  try {
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "fs",
    });
    const fileStream = bucket.openDownloadStream(
      new mongoose.Types.ObjectId(fileId)
    );
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).send("Internal Server Error");
  }
}

app.get("/download/:file_id", async (req, res) => {
  try {
    await downloadImage(req.params.file_id, res);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});
//----------------------------------------------------------------------///

const conn = mongoose.connection;
let gfs;

conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("fs");
});

const saveBase64Image = async (base64Data, filename) => {
  return new Promise((resolve, reject) => {
    const imagePath = path.join(__dirname, filename);
    base64Img.img(base64Data, imagePath, filename, (err, filepath) => {
      if (err) {
        console.error("Error saving base64 image:", err);
        reject(err);
      } else {
        resolve(filepath);
      }
    });
  });
};

const uploadImages = async (email, documentData, gfs, dynamicFieldName) => {
  const { documentName, date, images } = documentData;

  const imgPromises = images.map(async (image) => {
    const filename = image.filename;
    const base64Data = image.data;
    const filePath = await saveBase64Image(base64Data, filename);
    const file = fs.createReadStream(filePath);
    const writestream = gfs.createWriteStream({
      filename: filename,
    });

    file.pipe(writestream);

    return new Promise((resolve, reject) => {
      writestream.on("close", (file) => {
        resolve({ file_id: file._id, filename: filename });
      });

      writestream.on("error", (error) => {
        reject(error);
      });
    });
  });

  const uploadedImages = await Promise.all(imgPromises);

  const userCollection = mongoose.connection.collection("savedocuments");
  await userCollection.updateOne(
    { email: email },
    { $push: { [dynamicFieldName]: { $each: uploadedImages } } },
    { upsert: true }
  );

  const imageCollection = mongoose.connection.collection("documents");
  const data_dict = {
    documentName: documentName,
    date: date,
    images: uploadedImages,
    resolved: false,
  };
  await imageCollection.updateOne(
    { email: email },
    { $push: { [dynamicFieldName]: data_dict } },
    { upsert: true }
  );

  return uploadedImages;
};

app.post("/uploads", async (req, res) => {
  const conn = mongoose.connection;
  const gfs = Grid(conn.db, mongoose.mongo);

  gfs.collection("fs");
  try {
    const { email, documentData } = req.body;
    console.log("email", email);
    console.log("document data", documentData);
    console.log("gfs : ", gfs);
    const dynamicFieldName = `document.${documentData.documentName
      .replace(" ", "")
      .toLowerCase()}`;

    const uploadedImages = await uploadImages(
      email,
      documentData,
      gfs,
      dynamicFieldName
    );

    res.json({ message: "Images uploaded successfully", uploadedImages });
  } catch (error) {
    console.error("Error uploading images:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//------------------------------------------------------------------------///

app.post("/login", async (req, res) => {
  try {
    const { email, pass } = req.body;
    userEmail = await UserModel.findOne({ email });
    if (userEmail) {
      matchPassword = await bcrypt.compare(pass, userEmail.password);
      if (matchPassword) {
        req.session.user = userEmail;
        res.redirect("/home");
      } else {
        res.render("login.ejs", { invalidPass: true });
      }
    } else {
      res.render("login.ejs", { invalid: true });
    }
  } catch (err) {
    res.send("OPPSS SOMETHING WENT WRONG !!!");
  }
});

//---------------------------------------------------------------------////

app.get("/signin", (req, res) => {
  res.render("signin.ejs");
});

//---------------------------------------------------------------------////

app.post("/signin", async (req, res) => {
  try {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    };
    const currentDate = new Date();
    const formattedDateWithOptions = currentDate.toLocaleString(
      "en-US",
      options
    );
    const data = {
      name: req.body.name,
      email: req.body.email,
      password: await bcrypt.hash(req.body.pass, 10),
      dateJoining: formattedDateWithOptions,
    };

    const existingUser = await UserModel.findOne({ email: req.body.email });

    if (existingUser) {
      res.render("signin.ejs", { exist: true });
    } else {
      await UserModel.create(data);
      await documentModel.create({ email: data.email });
      await fileInfoModel.create({ email: data.email });
      await MessageModel.create({
        email: data.email,
        message: {
          admin: [
            {
              admsg:
                "Hello, your account is created successfully. If you don't make an order in 2 days, your account will be deleted automatically.",
              date: formattedDateWithOptions,
            },
          ],
        },
      });

      req.session.user = data;
      res.redirect("/home");
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

//---------------------------------------------------------------------////

app.post("/contacts", async (req, res) => {
  try {
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
    const msg = req.body.msg;
    var user = req.session.user;
    const email = user.email;

    await MessageModel.updateOne(
      { email: email },
      {
        $push: {
          "message.client": {
            $each: [
              {
                clmsg: msg,
                date: formattedDate,
              },
            ],
            $position: 0,
          },
          "message.admin": {
            $each: [
              {
                admsg:
                  "Thank you for reaching out. Your message has been received, and we'll get back to you soon.",
                date: formattedDate,
              },
            ],
            $position: 0,
          },
        },
      },
      { upsert: true }
    );

    res.redirect("profile");
  } catch (err) {
    const ErrorPicturePath = path.join(
      __dirname,
      "public",
      "assets",
      "stock-vector-broken-robot-page-not-found-error-breaking-mistake-repairs-service-cartoon-vector-flat-1860980773.jpg"
    );
    const ErrorPictureExists = fs.existsSync(ErrorPicturePath);

    res.render("error", {
      error: err,
      errorPicture: ErrorPictureExists
        ? "assets/stock-vector-broken-robot-page-not-found-error-breaking-mistake-repairs-service-cartoon-vector-flat-1860980773.jpg"
        : null,
    });
  }
});

//---------------------------------------------------------------------////

app.get("/contacts", (req, res) => {
  var name = req.session.user;
  var user = name ? (user = name.name) : (user = undefined);
  res.render("contacts.ejs", { userEmail: name, userName: user });
});

//---------------------------------------------------------------------////

app.get("/profile", async (req, res) => {
  try {
    var name = req.session.user;
    var user = name ? (user = name.name) : (user = undefined);
    const dateString = name.dateJoining;
    const parts = dateString.split(" at ");
    const extractedDate = parts[0];
    const email = name.email;

    const userData = await UserModel.findOne({ email });
    const order = userData ? userData.order : undefined;
    const messageData = await MessageModel.findOne({ email });

    const newMessageCount = messageData.message.admin.length;

    const adminMessage = messageData.message.admin;

    const documentInfo = await documentModel.findOne({ email });

    const document = documentInfo.document;
    const profilePicturePath = path.join(
      __dirname,
      "public",
      "assets",
      "user (1).png"
    );
    const profilePictureExists = fs.existsSync(profilePicturePath);
    const EmailPicturePath = path.join(
      __dirname,
      "public",
      "assets",
      "email.png"
    );
    const EmailPictureExists = fs.existsSync(EmailPicturePath);
    const DocumentPicturePath = path.join(
      __dirname,
      "public",
      "assets",
      "document.png"
    );
    const DocumentPictureExists = fs.existsSync(DocumentPicturePath);
    const DatePicturePath = path.join(
      __dirname,
      "public",
      "assets",
      "calender.png"
    );
    const DatePictureExists = fs.existsSync(DatePicturePath);
    const MessagePicturePath = path.join(
      __dirname,
      "public",
      "assets",
      "message.png"
    );
    const MessagePictureExists = fs.existsSync(MessagePicturePath);
    res.render("profile", {
      msgCount: newMessageCount,
      message: adminMessage,
      document: document,
      order: order,
      userEmail: name,
      userName: user,
      date: extractedDate,
      profilePicture: profilePictureExists ? "/assets/user (1).png" : null,
      emailPicture: EmailPictureExists ? "/assets/email.png" : null,
      documentPicture: DocumentPictureExists ? "/assets/document.png" : null,
      datePicture: DatePictureExists ? "/assets/calender.png" : null,
      messagePicture: MessagePictureExists ? "/assets/message.png" : null,
    });
  } catch (error) {
    const ErrorPicturePath = path.join(
      __dirname,
      "public",
      "assets",
      "stock-vector-broken-robot-page-not-found-error-breaking-mistake-repairs-service-cartoon-vector-flat-1860980773.jpg"
    );
    const ErrorPictureExists = fs.existsSync(ErrorPicturePath);
    console.log(error);
    res.render("error", {
      error: error,
      errorPicture: ErrorPictureExists
        ? "assets/stock-vector-broken-robot-page-not-found-error-breaking-mistake-repairs-service-cartoon-vector-flat-1860980773.jpg"
        : null,
    });
  }
});

//---------------------------------------------------------------------////

app.get("/document", (req, res) => {
  var name = req.session.user;
  var flag = name ? true : false;
  var user = name ? (user = name.name) : (user = undefined);
  res.render("documents.ejs", { flag: flag, userEmail: name, userName: user });
});

app.get("/home", (req, res) => {
  const BackgroundPicturePath = path.join(
    __dirname,
    "public",
    "assets",
    "vecteezy_abstract-gradient-pastel-blue-and-purple-background-neon_8617161.jpg"
  );
  const BackgroundPictureExists = fs.existsSync(BackgroundPicturePath);
  var name = req.session.user;
  var user = name ? (user = name.name) : (user = undefined);
  res.render("home.ejs", {
    userEmail: name,
    userName: user,
    BackgroundPicture: BackgroundPictureExists
      ? "assets/vecteezy_abstract-gradient-pastel-blue-and-purple-background-neon_8617161.jpg"
      : null,
  });
});

//---------------------------------------------------------------------////

app.post("/sendMessage", async (req, res) => {
  const msgInfo = req.body;
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
  const len = Object.keys(msgInfo).length;
  if (len === 3) {
    try {
      console.log(msgInfo);
      const { clientMessage, email, adminMessage } = msgInfo;
      await MessageModel.updateOne(
        { email: email },
        {
          $push: {
            "message.admin": {
              $each: [
                {
                  admsg: `(your message : ${clientMessage}) \n admin : ${adminMessage}`,
                  date: formattedDate,
                },
              ],
              $position: 0,
            },
          },
        },
        { upsert: true }
      );
      return res.json({ success: true });
    } catch (err) {
      console.log(err);
      return res.json({ success: false });
    }
  } else {
    try {
      const { email, adminMessage } = msgInfo;
      await MessageModel.updateOne(
        { email: email },
        {
          $push: {
            "message.admin": {
              $each: [
                {
                  admsg: `admin : ${adminMessage}`,
                  date: formattedDate,
                },
              ],
              $position: 0,
            },
          },
        },
        { upsert: true }
      );
      return res.json({ success: true });
    } catch (err) {
      console.log(err);
      return res.json({ success: false });
    }
  }
});

//---------------------------------------------------------------------////

app.post("/messageInfo", async (req, res) => {
  try {
    const { email } = req.body;
    const userEmail = req.body.email;
    const message = await MessageModel.findOne({ email });

    if (!message) {
      return res
        .status(404)
        .json({ error: "Message not found for the specified email" });
    }

    const clientMessages = message.message.client;
    return res.status(200).json({ clientMessages, userEmail });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/admin", async (req, res) => {
  try {
    const NotificationPicturePath = path.join(
      __dirname,
      "public",
      "assets",
      "bell.png"
    );
    const NotificationPictureExists = fs.existsSync(NotificationPicturePath);
    const { uname, pass } = req.body;
    const adminUser = await AdminModel.findOne({ UserName: uname });
    if (adminUser) {
      const matchPassword = await bcrypt.compare(pass, adminUser.password);

      if (matchPassword) {
        const users = await UserModel.find();
        const document = await documentModel.find();
        const message = await MessageModel.find();
        const flag = uname ? true : false;
        req.session.user = adminUser;
        res.render("adminPannel", {
          messages: message,
          flag,
          users: users && users.length > 0 ? users : undefined,
          document: document,
          notificationPicture: NotificationPictureExists
            ? "/assets/bell.png"
            : null,
        });
      } else {
        res.render("admin", { invalidPass: true });
      }
    } else {
      res.render("admin", { invalid: true });
    }
  } catch (err) {
    console.log(err);
    res.render("error");
  }
});

//---------------------------------------------------------------------////

app.delete("/deleteUser/:email", async (req, res) => {
  const email = req.params.email.trim();
  try {
    const user = await UserModel.findOne({ email });
    const documentInfo = await documentModel.findOne({ email });
    await deleteFiles(documentInfo.document);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    await deleteFiles(documentInfo.document);
    await documentModel.deleteOne({ email });
    await UserModel.deleteOne({ email });
    await fileInfoModel.deleteOne({ email });
    await MessageModel.deleteOne({ email });
    return res.json({
      success: true,
      message: "User and associated data deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
});

async function deleteFiles(document) {
  const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: "fs" });

  for (const subArray of Object.values(document)) {
    for (const item of subArray) {
      for (const image of item.images) {
        const fileId = new mongoose.Types.ObjectId(image.fileid);

        const fileExists = await bucket.find({ _id: fileId }).toArray();

        if (fileExists && fileExists.length > 0) {
          await bucket.delete(fileId);
        } else {
        }
      }
    }
  }
}

//---------------------------------------------------------------------////

app.get("/admin", async (req, res) => {
  res.render("admin");
});

//--------------------------------------------------------------------------////

app.get("/something", async (req, res) => {
  res.json({ success: "true" });
});

//---------------------------------------------------------------------////

app.get("/logout", (req, res) => {
  if (req.session.user) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        res.status(500).send("Internal Server Error");
      } else {
        res.redirect("/");
      }
    });
  } else {
    res.redirect("/");
  }
});
app.use((req, res) => {
  res.status(404).render("error");
});

const port = process.env.PORT;

app.listen(port, () => {
  console.log("Server running on http://localhost:3030");
});

//---------------------------------------------------------------------////
