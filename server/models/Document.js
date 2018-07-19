import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const DocumentSchema = new Schema({
  content: {
    type: Array,
    default: [],
  },
  owner: {
    type: Schema.ObjectId,
    required: true,
    ref: 'users',
  },
  collaboratorList: {
    type: [{
      type: Schema.ObjectId,
      ref: 'users',
    }],
    default: [],
  },
  title: {
    type: String,
    default: 'Untitled',
  },
  password: {
    type: String,
  },
  createdTime: {
    type: Date,
  },
  lastEditTime: {
    type: Date,
  },
});

module.exports = mongoose.model('Document', DocumentSchema);
