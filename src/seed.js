import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";
import Listing from "./models/Listing.js";
import Booking from "./models/Booking.js";
import Category from "./models/Category.js";

const CATEGORIES = [
  { index: 0, name: "Stitching & Tailoring", tone: "violet", icon: "scissors" },
  { index: 1, name: "Home Cooking", tone: "peach", icon: "cooking-pot" },
  { index: 2, name: "Baking", tone: "pink", icon: "cake-slice" },
  { index: 3, name: "Tutoring", tone: "mint", icon: "book-open" },
  { index: 4, name: "Arts & Crafts", tone: "yellow", icon: "palette" },
  { index: 5, name: "Beauty & Care", tone: "blue", icon: "sparkles" },
];

const SERVICES = [
  {
    title: "Hand-embroidered suits",
    city: "Lahore",
    cat: 0,
    price: 2500,
    image: 0,
    desc: "Personalised floral embroidery and custom stitching for everyday wear and special occasions. Discuss your design and fabric before the work begins.",
  },
  {
    title: "Homestyle chicken biryani",
    city: "Karachi",
    cat: 1,
    price: 650,
    image: 1,
    desc: "A freshly prepared family recipe with fragrant basmati rice, tender chicken and whole spices. Ask about portion sizes and food allergies before booking.",
  },
  {
    title: "Custom celebration cakes",
    city: "Islamabad",
    cat: 2,
    price: 2200,
    image: 2,
    desc: "Small-batch buttercream cakes for birthdays and intimate celebrations. Choose a flavour, colour palette and personal message.",
  },
  {
    title: "One-to-one maths tutoring",
    city: "Lahore",
    cat: 3,
    price: 800,
    image: 3,
    desc: "Patient, individual maths tuition with practice exercises tailored to your school year and learning goals.",
  },
  {
    title: "Personalised embroidery hoops",
    city: "Rawalpindi",
    cat: 4,
    price: 1400,
    image: 0,
    desc: "A personalised floral hoop, hand-embroidered for your home or as a thoughtful gift.",
  },
  {
    title: "Occasion henna designs",
    city: "Faisalabad",
    cat: 5,
    price: 1000,
    image: 5,
    desc: "Intricate traditional henna patterns for celebrations. Discuss design and ingredient sensitivities in advance.",
  },
];

async function upsertUser(data) {
  let user = await User.findOne({ email: data.email });
  if (!user) {
    user = await User.create(data);
  } else {
    user.name = data.name;
    user.phone = data.phone || user.phone;
    user.role = data.role;
    user.password = data.password;
    await user.save();
  }
  return user;
}

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI missing in hunar_web-backend/.env");
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected.");

  for (const cat of CATEGORIES) {
    const existing = await Category.findOne({ index: cat.index });
    if (!existing) {
      await Category.create(cat);
    } else {
      existing.name = cat.name;
      existing.tone = cat.tone;
      existing.icon = cat.icon;
      await existing.save();
    }
  }

  const admin = await upsertUser({
    name: "HUNAR Admin",
    email: process.env.ADMIN_EMAIL || "admin@hunar.pk",
    phone: "03000000000",
    password: process.env.ADMIN_PASSWORD || "admin123",
    role: "admin",
  });

  const provider = await upsertUser({
    name: "Ayesha Khan",
    email: "ayesha@example.com",
    phone: "03007654321",
    password: "demo123",
    role: "provider",
  });

  const customer = await upsertUser({
    name: "Fatima Raza",
    email: "fatima@example.com",
    phone: "03001234567",
    password: "demo123",
    role: "user",
  });

  const cooks = await upsertUser({
    name: "Sana Ahmed",
    email: "sana@example.com",
    phone: "03001112222",
    password: "demo123",
    role: "provider",
  });

  const bakers = await upsertUser({
    name: "Hira Malik",
    email: "hira@example.com",
    phone: "03003334444",
    password: "demo123",
    role: "provider",
  });

  const tutor = await upsertUser({
    name: "Maryam Ali",
    email: "maryam@example.com",
    phone: "03005556666",
    password: "demo123",
    role: "provider",
  });

  const craft = await upsertUser({
    name: "Zoya Noor",
    email: "zoya@example.com",
    phone: "03007778888",
    password: "demo123",
    role: "provider",
  });

  const beauty = await upsertUser({
    name: "Amna Iqbal",
    email: "amna@example.com",
    phone: "03009990000",
    password: "demo123",
    role: "provider",
  });

  const providers = [provider, cooks, bakers, tutor, craft, beauty];

  await Listing.deleteMany({});
  await Booking.deleteMany({});

  const listings = [];
  for (let i = 0; i < SERVICES.length; i += 1) {
    const s = SERVICES[i];
    const p = providers[i];
    listings.push(
      await Listing.create({
        ...s,
        phone: p.phone,
        provider: p._id,
        providerName: p.name,
        status: "approved",
        rating: "New",
      }),
    );
  }

  // One pending listing for admin to review
  await Listing.create({
    title: "Weekend baking box",
    desc: "Fresh cookies and brownies for weekend gatherings.",
    city: "Lahore",
    cat: 2,
    price: 1800,
    image: 2,
    phone: provider.phone,
    provider: provider._id,
    providerName: provider.name,
    status: "pending",
  });

  await Booking.create({
    listing: listings[0]._id,
    serviceTitle: listings[0].title,
    provider: provider._id,
    providerName: provider.name,
    customer: customer._id,
    customerName: customer.name,
    customerPhone: customer.phone,
    customerEmail: customer.email,
    date: "2026-12-05",
    note: "Need embroidery on two lawn suits for Eid.",
    status: "requested",
  });

  console.log("Seed complete.");
  console.log("Admin:", admin.email, process.env.ADMIN_PASSWORD || "admin123");
  console.log("Customer: fatima@example.com / demo123");
  console.log("Provider: ayesha@example.com / demo123");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
