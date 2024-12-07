const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CryptoIdentity',
      required: true,
    },
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    logo: {
      type: String,
    },
    website: [{ type: String }],
    twitter: [{ type: String }],
    messageBoard: [{ type: String }],
    chat: [{ type: String }],
    facebook: [{ type: String }],
    explorer: [{ type: String }],
    reddit: [{ type: String }],
    technicalDoc: [{ type: String }],
    sourceCode: [{ type: String }],
    announcement: [{ type: String }],
    dateLaunched: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const ProjectDetails = mongoose.model('ProjectDetails', projectSchema);

module.exports = ProjectDetails;
