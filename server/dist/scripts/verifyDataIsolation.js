"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dns_1 = __importDefault(require("dns"));
dns_1.default.setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const Website_1 = __importDefault(require("../models/Website"));
const Content_1 = __importDefault(require("../models/Content"));
const Media_1 = __importDefault(require("../models/Media"));
const StoreConfig_1 = __importDefault(require("../models/StoreConfig"));
const BASE_URL = "http://localhost:5000/api";
const results = [];
function recordTest(result) {
    results.push(result);
    const statusStr = result.passed ? "✓ PASS" : "✗ FAIL";
    console.log(`[${statusStr}] [${result.suite}] ${result.test}`);
    if (!result.passed) {
        console.error(`       Expected: ${result.expectedStatus}, Got: ${result.actualStatus}`);
        if (result.details)
            console.error(`       Details: ${result.details}`);
    }
}
async function request(endpoint, method = "GET", token, body) {
    const headers = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    if (body) {
        headers["Content-Type"] = "application/json";
    }
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
}
async function runIsolationAudit() {
    console.log("================================================================================");
    console.log("        MULTI-USER DATA ISOLATION AND AUTHORIZATION VERIFICATION SUITE         ");
    console.log("================================================================================\n");
    await mongoose_1.default.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB successfully.\n");
    const jwtSecret = process.env.JWT_SECRET;
    // 1. Prepare User A (editor), User B (editor), and Admin
    const emailA = "test_user_a_isolation@test.com";
    const emailB = "test_user_b_isolation@test.com";
    const emailAdmin = "test_admin_isolation@test.com";
    let userA = await User_1.default.findOne({ email: emailA });
    if (!userA) {
        userA = await User_1.default.create({
            name: "User A (Test)",
            email: emailA,
            password: "hashedpassword123",
            role: "editor",
            plan: "free",
        });
    }
    let userB = await User_1.default.findOne({ email: emailB });
    if (!userB) {
        userB = await User_1.default.create({
            name: "User B (Test)",
            email: emailB,
            password: "hashedpassword123",
            role: "editor",
            plan: "free",
        });
    }
    let adminUser = await User_1.default.findOne({ email: emailAdmin });
    if (!adminUser) {
        adminUser = await User_1.default.create({
            name: "Admin User (Test)",
            email: emailAdmin,
            password: "hashedpassword123",
            role: "admin",
            plan: "free",
        });
    }
    const tokenA = jsonwebtoken_1.default.sign({ id: userA._id.toString(), role: "editor" }, jwtSecret, { expiresIn: "1h" });
    const tokenB = jsonwebtoken_1.default.sign({ id: userB._id.toString(), role: "editor" }, jwtSecret, { expiresIn: "1h" });
    const tokenAdmin = jsonwebtoken_1.default.sign({ id: adminUser._id.toString(), role: "admin" }, jwtSecret, { expiresIn: "1h" });
    console.log(`User A ID: ${userA._id}`);
    console.log(`User B ID: ${userB._id}`);
    console.log(`Admin ID:  ${adminUser._id}\n`);
    // Clean any previous test resources for these test accounts
    await Website_1.default.deleteMany({ owner: { $in: [userA._id, userB._id] } });
    await Content_1.default.deleteMany({ author: { $in: [userA._id, userB._id] } });
    await Media_1.default.deleteMany({ uploadedBy: { $in: [userA._id, userB._id] } });
    await StoreConfig_1.default.deleteMany({ owner: { $in: [userA._id, userB._id] } });
    // ==========================================================================
    // STEP 1: User A creates resources
    // ==========================================================================
    console.log("--- STEP 1: User A Creates Resources ---");
    // Create Website A
    const createSiteRes = await request("/websites", "POST", tokenA, {
        name: "Website A",
        slug: `website-a-${Date.now()}`,
        description: "User A's private website",
    });
    const websiteA = createSiteRes.data.website;
    recordTest({
        suite: "Setup",
        test: "User A creates Website A",
        passed: createSiteRes.status === 201 && Boolean(websiteA?._id),
        expectedStatus: 201,
        actualStatus: createSiteRes.status,
    });
    // Create Content A (attached to Website A)
    const createContentRes = await request("/content", "POST", tokenA, {
        title: "Content A (Post)",
        slug: `content-a-${Date.now()}`,
        content: "Private article authored by User A",
        type: "post",
        website: websiteA?._id,
    });
    const contentA = createContentRes.data.content;
    recordTest({
        suite: "Setup",
        test: "User A creates Content A attached to Website A",
        passed: createContentRes.status === 201 && Boolean(contentA?._id),
        expectedStatus: 201,
        actualStatus: createContentRes.status,
    });
    // Create Media A directly in DB for testing
    const mediaA = await Media_1.default.create({
        filename: `media_a_${Date.now()}.png`,
        originalName: "media_a.png",
        url: "/uploads/media_a.png",
        type: "image",
        uploadedBy: userA._id,
        website: websiteA?._id,
    });
    recordTest({
        suite: "Setup",
        test: "User A creates Media A",
        passed: Boolean(mediaA?._id),
        expectedStatus: 201,
        actualStatus: 201,
    });
    // Create Store A
    const createStoreRes = await request("/store", "POST", tokenA, {
        storeName: "Store A",
        slug: `store-a-${Date.now()}`,
    });
    const storeA = createStoreRes.data.store;
    recordTest({
        suite: "Setup",
        test: "User A creates Store A",
        passed: createStoreRes.status === 201 && Boolean(storeA?._id),
        expectedStatus: 201,
        actualStatus: createStoreRes.status,
    });
    console.log("");
    // ==========================================================================
    // STEP 2: Multi-User List Isolation (User B should see 0 of User A's data)
    // ==========================================================================
    console.log("--- STEP 2: Multi-User List Isolation ---");
    // Website List Isolation
    const listWebsitesB = await request("/websites", "GET", tokenB);
    const foundSiteA = (listWebsitesB.data.websites || []).some((w) => w._id === websiteA?._id);
    recordTest({
        suite: "List Isolation",
        test: "User B GET /api/websites does NOT contain Website A",
        passed: listWebsitesB.status === 200 && !foundSiteA,
        expectedStatus: 200,
        actualStatus: listWebsitesB.status,
        details: foundSiteA ? "Website A leaked to User B in websites list" : undefined,
    });
    // Content List Isolation
    const listContentB = await request("/content", "GET", tokenB);
    const foundContentA = (listContentB.data.contents || []).some((c) => c._id === contentA?._id);
    recordTest({
        suite: "List Isolation",
        test: "User B GET /api/content does NOT contain Content A",
        passed: listContentB.status === 200 && !foundContentA,
        expectedStatus: 200,
        actualStatus: listContentB.status,
        details: foundContentA ? "Content A leaked to User B in content list" : undefined,
    });
    // Media List Isolation
    const listMediaB = await request("/media", "GET", tokenB);
    const foundMediaA = (listMediaB.data.media || []).some((m) => m._id === mediaA?._id.toString());
    recordTest({
        suite: "List Isolation",
        test: "User B GET /api/media does NOT contain Media A",
        passed: listMediaB.status === 200 && !foundMediaA,
        expectedStatus: 200,
        actualStatus: listMediaB.status,
        details: foundMediaA ? "Media A leaked to User B in media list" : undefined,
    });
    // Store List Isolation
    const listStoresB = await request("/store", "GET", tokenB);
    const foundStoreA = (listStoresB.data.stores || []).some((s) => s._id === storeA?._id);
    recordTest({
        suite: "List Isolation",
        test: "User B GET /api/store does NOT contain Store A",
        passed: listStoresB.status === 200 && !foundStoreA,
        expectedStatus: 200,
        actualStatus: listStoresB.status,
        details: foundStoreA ? "Store A leaked to User B in store list" : undefined,
    });
    // Dashboard Stats Isolation
    const dashStatsB = await request("/dashboard/stats", "GET", tokenB);
    const statsPosts = dashStatsB.data.stats?.totalPosts;
    recordTest({
        suite: "List Isolation",
        test: "User B GET /api/dashboard/stats reports 0 user-owned posts",
        passed: dashStatsB.status === 200 && statsPosts === 0,
        expectedStatus: 200,
        actualStatus: dashStatsB.status,
        details: statsPosts > 0 ? `Leaked post count in dashboard stats: ${statsPosts}` : undefined,
    });
    console.log("");
    // ==========================================================================
    // STEP 3: Direct Resource Access by ID (User B attempting to read User A's ID)
    // ==========================================================================
    console.log("--- STEP 3: Direct Resource Access by ID (Horizontal Escalation) ---");
    // Website by ID
    const getSiteRes = await request(`/websites/${websiteA._id}`, "GET", tokenB);
    recordTest({
        suite: "Get-By-ID Access Control",
        test: "User B GET /api/websites/:id for User A's website returns 403 Forbidden",
        passed: getSiteRes.status === 403,
        expectedStatus: 403,
        actualStatus: getSiteRes.status,
    });
    // Website Pages by ID
    const getSitePagesRes = await request(`/websites/${websiteA._id}/pages`, "GET", tokenB);
    recordTest({
        suite: "Get-By-ID Access Control",
        test: "User B GET /api/websites/:id/pages for User A's website returns 403 Forbidden",
        passed: getSitePagesRes.status === 403,
        expectedStatus: 403,
        actualStatus: getSitePagesRes.status,
    });
    // Content by ID
    const getContentRes = await request(`/content/${contentA._id}`, "GET", tokenB);
    recordTest({
        suite: "Get-By-ID Access Control",
        test: "User B GET /api/content/:id for User A's content returns 403 Forbidden",
        passed: getContentRes.status === 403,
        expectedStatus: 403,
        actualStatus: getContentRes.status,
    });
    // Media by ID
    const getMediaRes = await request(`/media/${mediaA._id}`, "GET", tokenB);
    recordTest({
        suite: "Get-By-ID Access Control",
        test: "User B GET /api/media/:id for User A's media returns 403 Forbidden",
        passed: getMediaRes.status === 403,
        expectedStatus: 403,
        actualStatus: getMediaRes.status,
    });
    // Store by ID
    const getStoreRes = await request(`/store/${storeA._id}`, "GET", tokenB);
    recordTest({
        suite: "Get-By-ID Access Control",
        test: "User B GET /api/store/:id for User A's store returns 403 Forbidden",
        passed: getStoreRes.status === 403,
        expectedStatus: 403,
        actualStatus: getStoreRes.status,
    });
    console.log("");
    // ==========================================================================
    // STEP 4: Modification and Deletion Protection
    // ==========================================================================
    console.log("--- STEP 4: Unauthorized Modification and Deletion Enforcement ---");
    // Attempt to modify User A's Website
    const updateSiteRes = await request(`/websites/${websiteA._id}`, "PUT", tokenB, {
        name: "HACKED WEBSITE A",
    });
    recordTest({
        suite: "Modification Enforcement",
        test: "User B PUT /api/websites/:id on User A's website returns 403 Forbidden",
        passed: updateSiteRes.status === 403,
        expectedStatus: 403,
        actualStatus: updateSiteRes.status,
    });
    // Verify Website A was not modified
    const verifySiteA = await Website_1.default.findById(websiteA._id);
    recordTest({
        suite: "Modification Enforcement",
        test: "Website A name was preserved without modification",
        passed: verifySiteA?.name === "Website A",
        expectedStatus: 200,
        actualStatus: 200,
    });
    // Attempt to delete User A's Website
    const deleteSiteRes = await request(`/websites/${websiteA._id}`, "DELETE", tokenB);
    recordTest({
        suite: "Deletion Enforcement",
        test: "User B DELETE /api/websites/:id on User A's website returns 403 Forbidden",
        passed: deleteSiteRes.status === 403,
        expectedStatus: 403,
        actualStatus: deleteSiteRes.status,
    });
    // Attempt to modify User A's Content
    const updateContentRes = await request(`/content/${contentA._id}`, "PUT", tokenB, {
        title: "HACKED CONTENT A",
    });
    recordTest({
        suite: "Modification Enforcement",
        test: "User B PUT /api/content/:id on User A's content returns 403 Forbidden",
        passed: updateContentRes.status === 403,
        expectedStatus: 403,
        actualStatus: updateContentRes.status,
    });
    // Attempt to delete User A's Content
    const deleteContentRes = await request(`/content/${contentA._id}`, "DELETE", tokenB);
    recordTest({
        suite: "Deletion Enforcement",
        test: "User B DELETE /api/content/:id on User A's content returns 403 Forbidden",
        passed: deleteContentRes.status === 403,
        expectedStatus: 403,
        actualStatus: deleteContentRes.status,
    });
    // Attempt to delete User A's Media
    const deleteMediaRes = await request(`/media/${mediaA._id}`, "DELETE", tokenB);
    recordTest({
        suite: "Deletion Enforcement",
        test: "User B DELETE /api/media/:id on User A's media returns 403 Forbidden",
        passed: deleteMediaRes.status === 403,
        expectedStatus: 403,
        actualStatus: deleteMediaRes.status,
    });
    // Attempt to modify User A's Store
    const updateStoreRes = await request(`/store/${storeA._id}`, "PUT", tokenB, {
        storeName: "HACKED STORE A",
    });
    recordTest({
        suite: "Modification Enforcement",
        test: "User B PUT /api/store/:id on User A's store returns 403 Forbidden",
        passed: updateStoreRes.status === 403,
        expectedStatus: 403,
        actualStatus: updateStoreRes.status,
    });
    // Attempt to delete User A's Store
    const deleteStoreRes = await request(`/store/${storeA._id}`, "DELETE", tokenB);
    recordTest({
        suite: "Deletion Enforcement",
        test: "User B DELETE /api/store/:id on User A's store returns 403 Forbidden",
        passed: deleteStoreRes.status === 403,
        expectedStatus: 403,
        actualStatus: deleteStoreRes.status,
    });
    // Attempt to publish User A's Store
    const publishStoreRes = await request(`/store/${storeA._id}/publish`, "POST", tokenB);
    recordTest({
        suite: "Modification Enforcement",
        test: "User B POST /api/store/:id/publish on User A's store returns 403 Forbidden",
        passed: publishStoreRes.status === 403,
        expectedStatus: 403,
        actualStatus: publishStoreRes.status,
    });
    console.log("");
    // ==========================================================================
    // STEP 5: Cross-Resource Attachment Prevention
    // ==========================================================================
    console.log("--- STEP 5: Cross-Resource Attachment Prevention ---");
    // User B tries to attach their new content to User A's Website
    const attachContentRes = await request("/content", "POST", tokenB, {
        title: "Malicious Content",
        slug: `malicious-content-${Date.now()}`,
        content: "Trying to inject into User A website",
        type: "post",
        website: websiteA._id,
    });
    recordTest({
        suite: "Cross-Resource Attachment",
        test: "User B attaching new content to User A's website returns 403 Forbidden",
        passed: attachContentRes.status === 403,
        expectedStatus: 403,
        actualStatus: attachContentRes.status,
    });
    // User B creates their own Website B
    const createSiteBRes = await request("/websites", "POST", tokenB, {
        name: "Website B",
        slug: `website-b-${Date.now()}`,
    });
    const websiteB = createSiteBRes.data.website;
    // User B tries to set User A's content as homePage for Website B
    const attachHomeRes = await request(`/websites/${websiteB._id}`, "PUT", tokenB, {
        homePage: contentA._id,
    });
    recordTest({
        suite: "Cross-Resource Attachment",
        test: "User B setting User A's content as homePage on Website B returns 403 Forbidden",
        passed: attachHomeRes.status === 403,
        expectedStatus: 403,
        actualStatus: attachHomeRes.status,
    });
    // User B tries to query content filtering by User A's website
    const filterBySiteARes = await request(`/content?website=${websiteA._id}`, "GET", tokenB);
    recordTest({
        suite: "Cross-Resource Attachment",
        test: "User B GET /api/content?website=UserA_Site returns 403 Forbidden",
        passed: filterBySiteARes.status === 403,
        expectedStatus: 403,
        actualStatus: filterBySiteARes.status,
    });
    // User B tries to query media filtering by User A's website
    const filterMediaBySiteARes = await request(`/media?website=${websiteA._id}`, "GET", tokenB);
    recordTest({
        suite: "Cross-Resource Attachment",
        test: "User B GET /api/media?website=UserA_Site returns 403 Forbidden",
        passed: filterMediaBySiteARes.status === 403,
        expectedStatus: 403,
        actualStatus: filterMediaBySiteARes.status,
    });
    console.log("");
    // ==========================================================================
    // STEP 6: User B Legitimate Resource Management (Verify Self-Management Works)
    // ==========================================================================
    console.log("--- STEP 6: Legitimate Resource Management for User B ---");
    // User B creates Content B
    const createContentBRes = await request("/content", "POST", tokenB, {
        title: "Content B",
        slug: `content-b-${Date.now()}`,
        content: "User B valid content",
        type: "post",
        website: websiteB._id,
    });
    const contentB = createContentBRes.data.content;
    recordTest({
        suite: "Legitimate Operations",
        test: "User B can create Content B attached to Website B",
        passed: createContentBRes.status === 201 && Boolean(contentB?._id),
        expectedStatus: 201,
        actualStatus: createContentBRes.status,
    });
    // User B can get Content B by ID
    const getContentBRes = await request(`/content/${contentB._id}`, "GET", tokenB);
    recordTest({
        suite: "Legitimate Operations",
        test: "User B can GET /api/content/:id for their own content",
        passed: getContentBRes.status === 200,
        expectedStatus: 200,
        actualStatus: getContentBRes.status,
    });
    // User B can update Content B
    const updateContentBRes = await request(`/content/${contentB._id}`, "PUT", tokenB, {
        title: "Content B (Updated)",
    });
    recordTest({
        suite: "Legitimate Operations",
        test: "User B can PUT /api/content/:id for their own content",
        passed: updateContentBRes.status === 200,
        expectedStatus: 200,
        actualStatus: updateContentBRes.status,
    });
    // User B can delete Content B
    const deleteContentBRes = await request(`/content/${contentB._id}`, "DELETE", tokenB);
    recordTest({
        suite: "Legitimate Operations",
        test: "User B can DELETE /api/content/:id for their own content",
        passed: deleteContentBRes.status === 200,
        expectedStatus: 200,
        actualStatus: deleteContentBRes.status,
    });
    console.log("");
    // ==========================================================================
    // STEP 7: Admin Access Preservation
    // ==========================================================================
    console.log("--- STEP 7: Admin Role Permissions Preservation ---");
    // Admin GET Website A
    const adminGetSite = await request(`/websites/${websiteA._id}`, "GET", tokenAdmin);
    recordTest({
        suite: "Admin Permissions",
        test: "Admin user can GET Website A by ID",
        passed: adminGetSite.status === 200,
        expectedStatus: 200,
        actualStatus: adminGetSite.status,
    });
    // Admin GET Content A
    const adminGetContent = await request(`/content/${contentA._id}`, "GET", tokenAdmin);
    recordTest({
        suite: "Admin Permissions",
        test: "Admin user can GET Content A by ID",
        passed: adminGetContent.status === 200,
        expectedStatus: 200,
        actualStatus: adminGetContent.status,
    });
    // Admin GET Media A
    const adminGetMedia = await request(`/media/${mediaA._id}`, "GET", tokenAdmin);
    recordTest({
        suite: "Admin Permissions",
        test: "Admin user can GET Media A by ID",
        passed: adminGetMedia.status === 200,
        expectedStatus: 200,
        actualStatus: adminGetMedia.status,
    });
    // Admin GET Store A
    const adminGetStore = await request(`/store/${storeA._id}`, "GET", tokenAdmin);
    recordTest({
        suite: "Admin Permissions",
        test: "Admin user can GET Store A by ID",
        passed: adminGetStore.status === 200,
        expectedStatus: 200,
        actualStatus: adminGetStore.status,
    });
    console.log("");
    // ==========================================================================
    // Summary & Cleanup
    // ==========================================================================
    // Clean up test documents
    await Website_1.default.deleteMany({ owner: { $in: [userA._id, userB._id] } });
    await Content_1.default.deleteMany({ author: { $in: [userA._id, userB._id] } });
    await Media_1.default.deleteMany({ uploadedBy: { $in: [userA._id, userB._id] } });
    await StoreConfig_1.default.deleteMany({ owner: { $in: [userA._id, userB._id] } });
    await User_1.default.deleteMany({ _id: { $in: [userA._id, userB._id, adminUser._id] } });
    await mongoose_1.default.disconnect();
    const total = results.length;
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;
    console.log("================================================================================");
    console.log(`TOTAL AUDIT TESTS: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log("================================================================================\n");
    if (failed > 0) {
        process.exit(1);
    }
    else {
        process.exit(0);
    }
}
runIsolationAudit().catch((err) => {
    console.error("Test execution fatal error:", err);
    process.exit(1);
});
