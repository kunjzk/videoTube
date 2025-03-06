import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
/*
videos [icon: video-camera, color: blue] {
  id string pk
  videoFile string
  thumbnail string
  owner ObjectID user
  title string
  description string
  duration number
  views number
  isPublished boolean
  createdAt Date
  updatedAt Date
}
*/

const videoSchema = new Schema(
  {
    videoFile: {
      type: String, // cloudinary URL
      required: true,
    },
    thumbnail: {
      type: String, // cloudinary URL
      required: true,
    },
    title: {
      type: String, // cloudinary URL
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
