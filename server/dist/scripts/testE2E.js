"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dns_1 = __importDefault(require("dns"));
dns_1.default.setServers(["8.8.8.8", "1.1.1.1"]);
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, "../../.env") });
const BASE_URL = "http://localhost:5000";
const JWT_SECRET = process.env.JWT_SECRET || "cms_super_secret_2026";
// Known IDs from database
const ADMIN_ID = "6ac165c364ba5b73802ffe35";
const ADMIN2_ID = "6acd12f8626e254ffb4d2450";
const adminToken = jsonwebtoken_1.default.sign({ id: ADMIN_ID, role: "admin" }, JWT_SECRET, { expiresIn: "1d" });
const admin2Token = jsonwebtoken_1.default.sign({ id: ADMIN2_ID, role: "editor" }, JWT_SECRET, { expiresIn: "1d" });
async function run() {
    console.log("==================================================");
    console.log(" Starting Multi-Tenant Website Builder E2E Tests...");
    console.log("==================================================\n");
    let testCount = 0;
    let passedCount = 0;
    function assert(condition, message) {
        testCount++;
        if (condition) {
            console.log(`[PASS] ${message}`);
            passedCount++;
        }
        else {
            console.error(`[FAIL] ${message}`);
            throw new Error(`Assertion failed: ${message}`);
        }
    }
    // 1. Verify Authentication & Token validity
    console.log("1. Verifying JWT authentication with protected endpoints...");
    const dashRes = await fetch(`${BASE_URL}/api/dashboard/stats`, {
        headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dashData = (await dashRes.json());
    assert(dashRes.ok && dashData.stats, "Admin JWT verified via /api/dashboard/stats");
    // 2. Websites CRUD
    console.log("\n2. Testing Websites API under /api/websites...");
    const listRes = await fetch(`${BASE_URL}/api/websites`, {
        headers: { Authorization: `Bearer ${adminToken}` },
    });
    const listData = (await listRes.json());
    assert(listRes.ok && Array.isArray(listData.websites), "Listed websites for Admin");
    const legacySite = listData.websites.find((w) => w.slug === "default-site");
    assert(legacySite, 'Migrated "Default Website" exists in Admin website list');
    // Create new website
    const testSiteSlug = `tenant-test-${Date.now()}`;
    console.log(`Creating new website with slug: ${testSiteSlug}...`);
    const createRes = await fetch(`${BASE_URL}/api/websites`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
            name: "Tenant Test Site",
            slug: testSiteSlug,
            description: "A website for automated testing",
            status: "published",
            settings: {
                metaTitle: "Tenant Test SEO Title",
                metaDescription: "Tenant Test SEO Desc",
            },
        }),
    });
    const createData = (await createRes.json());
    assert(createRes.ok && createData.website, "Created new website successfully");
    const newSiteId = createData.website._id;
    // Duplicate slug prevention
    console.log("Testing duplicate slug prevention...");
    const dupRes = await fetch(`${BASE_URL}/api/websites`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
            name: "Another Site",
            slug: testSiteSlug,
            description: "Duplicate slug test",
        }),
    });
    assert(dupRes.status === 409, "Duplicate website slug returned 409 Conflict");
    // 3. Backend Ownership Security & Cross-Tenant Isolation
    console.log("\n3. Testing Cross-Tenant Security & Ownership...");
    // Admin2 tries to update Admin's new website
    const hackRes = await fetch(`${BASE_URL}/api/websites/${newSiteId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${admin2Token}`,
        },
        body: JSON.stringify({ name: "Hacked Name" }),
    });
    assert(hackRes.status === 403 || hackRes.status === 404, "Admin2 blocked from modifying Admin website (403/404)");
    // 4. Content Scoping and Compound Unique Slug per Website
    console.log("\n4. Testing Content Scoping & Compound Unique Index ({ website: 1, slug: 1 })...");
    const sharedSlug = `same-slug-${Date.now()}`;
    // Create page under newSiteId
    const page1Res = await fetch(`${BASE_URL}/api/content`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
            "x-website-id": newSiteId,
        },
        body: JSON.stringify({
            title: "Page in Test Site",
            slug: sharedSlug,
            type: "page",
            status: "published",
            content: JSON.stringify([{ id: "hero-1", type: "hero", title: "Test Site Page Hero" }]),
            website: newSiteId,
        }),
    });
    const page1Data = (await page1Res.json());
    assert(page1Res.ok && page1Data.content, "Created page in Test Site");
    const page1Id = page1Data.content._id;
    // Create page under legacySite with the EXACT SAME slug!
    const page2Res = await fetch(`${BASE_URL}/api/content`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
            "x-website-id": legacySite._id,
        },
        body: JSON.stringify({
            title: "Page in Legacy Site",
            slug: sharedSlug,
            type: "page",
            status: "published",
            content: JSON.stringify([{ id: "hero-2", type: "hero", title: "Legacy Site Page Hero" }]),
            website: legacySite._id,
        }),
    });
    const page2Data = (await page2Res.json());
    assert(page2Res.ok && page2Data.content, "Created page with SAME slug in Legacy Site (Compound Index works!)");
    const page2Id = page2Data.content._id;
    // Try creating duplicate slug within the SAME website
    const dupPageRes = await fetch(`${BASE_URL}/api/content`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
            "x-website-id": newSiteId,
        },
        body: JSON.stringify({
            title: "Duplicate Page",
            slug: sharedSlug,
            type: "page",
            status: "draft",
            content: "[]",
            website: newSiteId,
        }),
    });
    assert(dupPageRes.status === 409, "Duplicate slug inside same website correctly blocked with 409");
    // Query content filtered by websiteId
    const listSiteContentRes = await fetch(`${BASE_URL}/api/content?websiteId=${newSiteId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
    });
    const listSiteContentData = (await listSiteContentRes.json());
    const siteContents = listSiteContentData.contents || listSiteContentData;
    assert(siteContents.every((c) => c.website === newSiteId || c.website?._id === newSiteId), "Content list filtered by websiteId only returns items belonging to that website");
    // 5. Setting homePage and testing Public Endpoints
    console.log("\n5. Setting homePage and testing Public Endpoints...");
    const setHomeRes = await fetch(`${BASE_URL}/api/websites/${newSiteId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
            homePage: page1Id,
        }),
    });
    assert(setHomeRes.ok, "Set homePage on Test Site");
    // 6. Public Site Resolution
    console.log("Testing Public Site Home Endpoint: /api/public/content/sites/:siteSlug...");
    const pubHomeRes = await fetch(`${BASE_URL}/api/public/content/sites/${testSiteSlug}`);
    const pubHomeData = (await pubHomeRes.json());
    assert(pubHomeRes.ok && pubHomeData.website && pubHomeData.homePage, "Public site home resolved successfully with homepage");
    assert(pubHomeData.homePage._id === page1Id, "Resolved homepage matches configured homePage ID");
    // Public Specific Page Resolution
    console.log("Testing Public Page Endpoint: /api/public/content/sites/:siteSlug/pages/:pageSlug...");
    const pubPageRes = await fetch(`${BASE_URL}/api/public/content/sites/${testSiteSlug}/pages/${sharedSlug}`);
    const pubPageData = (await pubPageRes.json());
    assert(pubPageRes.ok && pubPageData.page && pubPageData.page._id === page1Id, "Public page resolved correctly by siteSlug and pageSlug");
    // Verify Draft Website Protection
    console.log("Testing Draft Website Protection...");
    await fetch(`${BASE_URL}/api/websites/${newSiteId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: "draft" }),
    });
    const draftPubRes = await fetch(`${BASE_URL}/api/public/content/sites/${testSiteSlug}`);
    assert(draftPubRes.status === 404, "Draft website correctly returns 404 on public route");
    // 7. Cleanup
    console.log("\n7. Cleaning up test website and content...");
    await fetch(`${BASE_URL}/api/content/${page2Id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
    });
    const delSiteRes = await fetch(`${BASE_URL}/api/websites/${newSiteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(delSiteRes.ok, "Deleted test website (with cascade cleanup)");
    console.log(`\n==============================================`);
    console.log(`ALL ${passedCount}/${testCount} TESTS PASSED SUCCESSFULLY!`);
    console.log(`==============================================`);
}
run().catch((err) => {
    console.error("Test Suite Failed:", err);
    process.exit(1);
});
