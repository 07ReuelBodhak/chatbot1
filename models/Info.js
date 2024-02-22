const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  fileid : mongoose.Schema.Types.ObjectId,
  filename: String,
});

const documentSchema = new mongoose.Schema({

  documentName: {
      type: String,
      required: true,
  },
  date: {
      type: Date,
      default: Date.now,
  },
  images: [imageSchema],
  resolved: {
    type: Boolean,
    required: true
  }
});

const saveDocumentSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  document:{
    drivinglicense :[documentSchema],
    passport : [documentSchema],
    pancard : [documentSchema],
    castecertificate : [documentSchema],
    incomecertificate : [documentSchema],
    domicile : [documentSchema],
    nationality : [documentSchema],
    noncreamylayer : [documentSchema]
  }
})
const fileInfoSchema = new mongoose.Schema({
  email :{
    type : String,
    required : true
  }
});

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  dateJoining : {
    type: String,
    required:true
  },

});

const adminSchema = new mongoose.Schema({
  UserName : {
    type: String,
    required : true
  },
  password : {
    type: String,
    required : true
  }
})

const messageSchema = new mongoose.Schema({
  email : {
    type: String,
    required : true
  },
  message : {
    client :[
      {
        clmsg : String,
        date : String
      }
    ],
    admin : [
      {
        admsg : String,
        date : String
      }
    ]
  }
})

const UserModel = mongoose.model('User', UserSchema);
const documentModel = mongoose.model('saveDocument',saveDocumentSchema)
const fileInfoModel = mongoose.model('documents',fileInfoSchema)
const AdminModel = mongoose.model('admin',adminSchema);
const MessageModel = mongoose.model('message',messageSchema);

module.exports = {UserModel, documentModel, fileInfoModel, AdminModel, MessageModel};
