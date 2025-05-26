const mongoose = require('mongoose');

const notificationSchema = new Schema({
    user: {type: Schema.Types.ObjectId,ref: 'User',required: true},
    message: {type: String,required: true},
    notificationType: {type: String,enum: ['reminder', 'progress update'],required: true},
    readStatus: {type: Boolean,default: false},
    createdAt: {type: Date,default: Date.now},
    scheduledFor: {type: Date,required: true}
  }, { timestamps: true });
  
  const notificationModel = mongoose.model('Notification', notificationSchema);
  
  module.exports = {notificationModel}
  