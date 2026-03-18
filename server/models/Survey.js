import mongoose from "mongoose";

const surveySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },
    answers: [
      {
        fieldId: String,
        label: String,
        value: mongoose.Schema.Types.Mixed
      }
    ],
    gpsLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      },
      accuracy: Number
    },
    photos: [
      {
        url: String,
        publicId: String,
        uploadedAt: Date
      }
    ],
    voiceRecording: {
      url: String,
      publicId: String,
      durationMs: Number
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    offlineReferenceId: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

surveySchema.index({ gpsLocation: "2dsphere" });
surveySchema.index({ projectId: 1, submittedAt: -1 });

export const Survey = mongoose.model("Survey", surveySchema);

