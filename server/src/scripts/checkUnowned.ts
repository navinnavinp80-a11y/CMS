import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI as string);

  const unownedWebsites = await mongoose.connection.collection("websites").find({
    $or: [{ owner: { $exists: false } }, { owner: null }],
  }).toArray();
  console.log("Unowned Websites:", unownedWebsites.length);

  const unownedContent = await mongoose.connection.collection("contents").find({
    $or: [{ author: { $exists: false } }, { author: null }],
  }).toArray();
  console.log("Unowned Content:", unownedContent.length);

  const unownedMedia = await mongoose.connection.collection("media").find({
    $or: [{ uploadedBy: { $exists: false } }, { uploadedBy: null }],
  }).toArray();
  console.log("Unowned Media:", unownedMedia.length);

  const unownedStores = await mongoose.connection.collection("storeconfigs").find({
    $or: [{ owner: { $exists: false } }, { owner: null }],
  }).toArray();
  console.log("Unowned Stores:", unownedStores.length);

  await mongoose.disconnect();
}

check();
