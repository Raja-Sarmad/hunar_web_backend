import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    serviceTitle: { type: String, required: true },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    providerName: { type: String, required: true },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String, default: "" },
    date: { type: String, required: true },
    note: { type: String, required: true },
    status: {
      type: String,
      enum: ["requested", "confirmed", "completed", "cancelled"],
      default: "requested",
    },
  },
  { timestamps: true },
);

bookingSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id.toString(),
    listingId: this.listing?.toString?.() || String(this.listing),
    serviceTitle: this.serviceTitle,
    providerId: this.provider?.toString?.() || String(this.provider),
    providerName: this.providerName,
    customerId: this.customer ? this.customer.toString() : null,
    customerName: this.customerName,
    customerPhone: this.customerPhone,
    customerEmail: this.customerEmail,
    date: this.date,
    note: this.note,
    status: this.status,
    createdAt: this.createdAt,
  };
};

export default mongoose.model("Booking", bookingSchema);
