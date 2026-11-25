import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    desc: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    cat: { type: Number, required: true, min: 0, max: 5 },
    price: { type: Number, required: true, min: 1 },
    image: { type: Number, default: 0, min: 0, max: 5 },
    imageUrl: { type: String, default: "" },
    rating: { type: String, default: "New" },
    phone: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    providerName: { type: String, required: true },
  },
  { timestamps: true },
);

listingSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id.toString(),
    title: this.title,
    name: this.providerName,
    city: this.city,
    cat: this.cat,
    price: this.price,
    image: this.image,
    imageUrl: this.imageUrl || "",
    desc: this.desc,
    rating: this.rating,
    phone: this.phone,
    status: this.status,
    providerId: this.provider?.toString?.() || String(this.provider),
    createdAt: this.createdAt,
  };
};

export default mongoose.model("Listing", listingSchema);
