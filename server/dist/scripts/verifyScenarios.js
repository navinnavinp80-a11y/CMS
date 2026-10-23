"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dns_1 = __importDefault(require("dns"));
dns_1.default.setServers(["8.8.8.8", "1.1.1.1"]);
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const entitlementService_1 = require("../services/entitlementService");
const templateService_1 = require("../services/templateService");
async function runTests() {
    console.log("=== RUNNING ENTITLEMENT & THEME UNLOCKING SCENARIOS ===\n");
    let passed = 0;
    let failed = 0;
    function assert(condition, desc) {
        if (condition) {
            console.log(`[PASS] ${desc}`);
            passed++;
        }
        else {
            console.error(`[FAIL] ${desc}`);
            failed++;
        }
    }
    // Define Mock Users
    const freeUser = {
        role: "editor",
        plan: "free",
        premiumExpiresAt: null,
    };
    const activePremiumUser = {
        role: "editor",
        plan: "premium",
        premiumExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
    const expiredPremiumUser = {
        role: "editor",
        plan: "premium",
        premiumExpiresAt: new Date(Date.now() - 3600 * 1000), // expired 1 hour ago
    };
    const invalidPremiumUserNoDate = {
        role: "editor",
        plan: "premium",
        premiumExpiresAt: null,
    };
    const adminUser = {
        role: "admin",
        plan: "free",
        premiumExpiresAt: null,
    };
    // Scenario 1: Free user selects a free theme — access works
    console.log("\n--- Scenario 1: Free user selects a free theme ---");
    assert((0, templateService_1.canUserAccessTemplate)(freeUser, "minimal-clean") === true, "Free user can access minimal-clean template");
    assert((0, templateService_1.canUserAccessTemplate)(freeUser, "modern-business") === true, "Free user can access modern-business template");
    assert((0, templateService_1.canUserAccessTemplate)(freeUser, "business-landing") === true, "Free user can access free template alias 'business-landing'");
    // Scenario 2: Free user selects a Premium theme — access is denied
    console.log("\n--- Scenario 2: Free user selects a Premium theme ---");
    assert((0, templateService_1.canUserAccessTemplate)(freeUser, "premium-saas") === false, "Free user is denied access to 'premium-saas'");
    assert((0, templateService_1.canUserAccessTemplate)(freeUser, "contact-page") === false, "Free user is denied access to Premium alias 'contact-page'");
    // Scenario 3: User completes a verified Premium payment — entitlement active
    console.log("\n--- Scenario 3: Verified Premium user entitlement ---");
    assert((0, entitlementService_1.isUserPremiumActive)(activePremiumUser) === true, "Active Premium user is evaluated as isUserPremiumActive = true");
    assert((0, templateService_1.canUserAccessTemplate)(activePremiumUser, "premium-saas") === true, "Active Premium user can access 'premium-saas'");
    // Scenario 4: The same user refreshes — Premium access remains available
    console.log("\n--- Scenario 4: Persisted user state evaluation ---");
    const reloadedUser = {
        ...activePremiumUser,
        premiumExpiresAt: new Date(activePremiumUser.premiumExpiresAt.toISOString()),
    };
    assert((0, entitlementService_1.isUserPremiumActive)(reloadedUser) === true, "Reloaded user state retains active Premium entitlement");
    assert((0, templateService_1.canUserAccessTemplate)(reloadedUser, "premium-saas") === true, "Reloaded user still has access to Premium themes");
    // Scenario 5: Active Premium user selects each configured Premium theme
    console.log("\n--- Scenario 5: Active Premium user selects all themes ---");
    for (const tmpl of templateService_1.TEMPLATES) {
        const hasAccess = (0, templateService_1.canUserAccessTemplate)(activePremiumUser, tmpl.id);
        assert(hasAccess === true, `Active Premium user has access to template '${tmpl.id}' (${tmpl.name})`);
        for (const alias of tmpl.aliases) {
            assert((0, templateService_1.canUserAccessTemplate)(activePremiumUser, alias) === true, `Active Premium user has access to template alias '${alias}'`);
        }
    }
    // Scenario 6: Premium expires — Premium-only access is denied again
    console.log("\n--- Scenario 6: Expired Premium user access denied ---");
    assert((0, entitlementService_1.isUserPremiumActive)(expiredPremiumUser) === false, "Expired Premium user is evaluated as isUserPremiumActive = false");
    assert((0, templateService_1.canUserAccessTemplate)(expiredPremiumUser, "premium-saas") === false, "Expired Premium user is denied access to 'premium-saas'");
    assert((0, templateService_1.canUserAccessTemplate)(expiredPremiumUser, "minimal-clean") === true, "Expired Premium user can still access free templates");
    // Scenario 7: Invalid, unverified, or no-date entitlement
    console.log("\n--- Scenario 7: Invalid or missing entitlement dates ---");
    assert((0, entitlementService_1.isUserPremiumActive)(invalidPremiumUserNoDate) === false, "User with plan='premium' but null premiumExpiresAt is denied");
    assert((0, templateService_1.canUserAccessTemplate)(invalidPremiumUserNoDate, "premium-saas") === false, "User with plan='premium' but null expiry is denied Premium themes");
    assert((0, templateService_1.canUserAccessTemplate)(adminUser, "premium-saas") === true, "Admin user retains full access to all templates");
    console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);
    if (failed > 0) {
        process.exit(1);
    }
}
runTests();
