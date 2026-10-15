"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigration = runMigration;
const dns_1 = __importDefault(require("dns"));
dns_1.default.setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, "../../.env") });
const User_1 = __importDefault(require("../models/User"));
const Website_1 = __importDefault(require("../models/Website"));
const Content_1 = __importDefault(require("../models/Content"));
const Media_1 = __importDefault(require("../models/Media"));
const LEGACY_OWNER_EMAIL = "admin@gmail.com";
const DEFAULT_SITE_NAME = "Default Website";
const DEFAULT_SITE_SLUG = "default-site";
async function runMigration() {
    console.log("==================================================");
    console.log(" Starting Safe Legacy Data Migration...");
    console.log("==================================================");
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error("MONGODB_URI is not set in environment");
    }
    await mongoose_1.default.connect(mongoUri);
    console.log(`Connected to database: ${mongoose_1.default.connection.name}`);
    // 1. Locate Legacy Owner
    console.log(`\n1. Locating legacy owner (${LEGACY_OWNER_EMAIL})...`);
    const owner = await User_1.default.findOne({ email: LEGACY_OWNER_EMAIL });
    if (!owner) {
        throw new Error(`Cannot proceed: User with email '${LEGACY_OWNER_EMAIL}' was not found. Please create the user or verify email.`);
    }
    console.log(`   Found owner: ${owner.name} (${owner.email}) [ID: ${owner._id}]`);
    // 2. Find or Create Default Website
    console.log(`\n2. Checking default website ('${DEFAULT_SITE_SLUG}')...`);
    let defaultSite = await Website_1.default.findOne({ slug: DEFAULT_SITE_SLUG });
    if (!defaultSite) {
        console.log(`   Creating default website '${DEFAULT_SITE_NAME}'...`);
        defaultSite = await Website_1.default.create({
            name: DEFAULT_SITE_NAME,
            slug: DEFAULT_SITE_SLUG,
            description: "Default website for migrated legacy content and pages",
            owner: owner._id,
            status: "published",
            settings: {
                metaTitle: DEFAULT_SITE_NAME,
                metaDescription: "Default website migrated from legacy CMS",
            },
        });
        console.log(`   Created website: ${defaultSite.name} [ID: ${defaultSite._id}]`);
    }
    else {
        console.log(`   Default website already exists: ${defaultSite.name} [ID: ${defaultSite._id}]`);
    }
    // 3. Migrate Content without Website
    console.log("\n3. Migrating legacy contents...");
    const unassignedContents = await Content_1.default.find({
        $or: [{ website: null }, { website: { $exists: false } }],
    });
    console.log(`   Found ${unassignedContents.length} unassigned content item(s).`);
    if (unassignedContents.length > 0) {
        // Validate for duplicate slugs among unassigned contents
        const slugMap = new Map();
        for (const item of unassignedContents) {
            if (slugMap.has(item.slug)) {
                throw new Error(`Conflict detected: Duplicate slug '${item.slug}' found between item ${item._id} and ${slugMap.get(item.slug)}.`);
            }
            slugMap.set(item.slug, String(item._id));
        }
        // Check if any item collides with existing items already in defaultSite
        for (const item of unassignedContents) {
            const collision = await Content_1.default.findOne({
                website: defaultSite._id,
                slug: item.slug,
                _id: { $ne: item._id },
            });
            if (collision) {
                throw new Error(`Conflict detected: Slug '${item.slug}' already exists in website '${defaultSite.name}' [ID: ${collision._id}].`);
            }
        }
        // Safe assignment
        for (const item of unassignedContents) {
            item.website = defaultSite._id;
            await item.save();
            console.log(`   -> Assigned '${item.title}' (${item.slug}) to website '${defaultSite.name}'`);
        }
        console.log(`   Successfully migrated ${unassignedContents.length} content item(s).`);
    }
    else {
        console.log("   All contents already have an assigned website.");
    }
    // 4. Migrate Media
    console.log("\n4. Migrating legacy media...");
    const unassignedMedia = await Media_1.default.find({
        $or: [{ website: null }, { website: { $exists: false } }],
        uploadedBy: owner._id,
    });
    console.log(`   Found ${unassignedMedia.length} unassigned media item(s) uploaded by ${owner.email}.`);
    for (const media of unassignedMedia) {
        media.website = defaultSite._id;
        await media.save();
        console.log(`   -> Assigned media '${media.originalName}' to website '${defaultSite.name}'`);
    }
    const remainingUnassigned = await Media_1.default.countDocuments({
        $or: [{ website: null }, { website: { $exists: false } }],
    });
    console.log(`   Preserved ${remainingUnassigned} unassigned media item(s) belonging to other or unknown users.`);
    // 5. Safely Migrate Indexes on `contents` collection
    console.log("\n5. Validating & Migrating Database Indexes on 'contents'...");
    const contentsColl = mongoose_1.default.connection.collection("contents");
    const existingIndexes = await contentsColl.indexes();
    console.log("   Current indexes:", existingIndexes.map((idx) => idx.name).join(", "));
    // Ensure all contents have website populated
    const missingWebsiteCount = await Content_1.default.countDocuments({
        $or: [{ website: null }, { website: { $exists: false } }],
    });
    if (missingWebsiteCount > 0) {
        throw new Error(`Index migration aborted: ${missingWebsiteCount} content items still lack a website.`);
    }
    // Drop old global unique index if present
    const hasGlobalSlugIndex = existingIndexes.some((idx) => idx.name === "slug_1" && idx.unique);
    if (hasGlobalSlugIndex) {
        console.log("   Dropping legacy global unique index 'slug_1'...");
        await contentsColl.dropIndex("slug_1");
        console.log("   Legacy global unique index 'slug_1' successfully dropped.");
    }
    else {
        console.log("   Legacy global unique index 'slug_1' was already dropped or non-unique.");
    }
    // Create compound unique index { website: 1, slug: 1 }
    console.log("   Ensuring compound unique index { website: 1, slug: 1 }...");
    await contentsColl.createIndex({ website: 1, slug: 1 }, { unique: true });
    console.log("   Compound unique index { website: 1, slug: 1 } is active.");
    // 6. Link homePage if not set
    if (!defaultSite.homePage) {
        const publishedPage = await Content_1.default.findOne({
            website: defaultSite._id,
            type: "page",
            status: "published",
        });
        if (publishedPage) {
            defaultSite.homePage = publishedPage._id;
            await defaultSite.save();
            console.log(`\n6. Linked default website homePage to '${publishedPage.title}' (${publishedPage.slug}).`);
        }
    }
    console.log("\n==================================================");
    console.log(" Migration Complete! All data migrated safely.");
    console.log("==================================================");
}
if (require.main === module) {
    runMigration()
        .then(async () => {
        await mongoose_1.default.disconnect();
        process.exit(0);
    })
        .catch(async (err) => {
        console.error("\n[MIGRATION ERROR]", err);
        await mongoose_1.default.disconnect();
        process.exit(1);
    });
}
