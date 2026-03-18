import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    description: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["draft", "active", "completed"],
      default: "draft"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    assignedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    formDefinition: [
      {
        fieldId: {
          type: String,
          required: true
        },
        label: {
          type: String,
          required: true
        },
        type: {
          type: String,
          enum: [
            "text",
            "textarea",
            "number",
            "radio",
            "select",
            "checkbox",
            "date"
          ],
          required: true
        },
        required: {
          type: Boolean,
          default: false
        },
        options: [
          {
            label: String,
            value: String
          }
        ],
        placeholder: String
      }
    ]
  },
  {
    timestamps: true
  }
);

export const Project = mongoose.model("Project", projectSchema);

