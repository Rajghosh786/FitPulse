const mongoose = require('mongoose');

const messageSchema = new Schema({
    sender: {type: Schema.Types.ObjectId,ref: 'User',required: true},
    receiver: {type: Schema.Types.ObjectId,ref: 'User',required: true},
    messageContent: {type: String,required: true},
    timestamp: {type: Date,default: Date.now},
    status: {type: String,enum: ['sent', 'read'],default: 'sent'}
  }, { timestamps: true });
  
  const messageModel = mongoose.model('Message', messageSchema);
  module.exports = {messageModel}
  