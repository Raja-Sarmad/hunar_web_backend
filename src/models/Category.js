import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    index: { type: Number, required: true, unique: true, min: 0, max: 5 },
    name: { type: String, required: true, trim: true },
    tone: { type: String, default: "violet" },
    icon: { type: String, default: "sparkles" },
    imageUrl: { type: String, default: "" },
  },
  { timestamps: true },
);

categorySchema.methods.toPublic = function toPublic() {
  return {
    id: this._id.toString(),
    index: this.index,
    name: this.name,
    tone: this.tone,
    icon: this.icon,
    imageUrl: this.imageUrl || "",
  };
};

export default mongoose.model("Category", categorySchema);
