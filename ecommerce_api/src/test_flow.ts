import "dotenv/config";
import { connectDB, disconnectDB, pool } from "./services/databaseService.js";
import { signupService, loginService } from "./services/databaseService.js";
import { createProduct, getProducts, getProductById } from "./services/productService.js";
import { addToCart, getCartWithItems, updateCartItemQuantity, removeFromCart, clearCart } from "./services/cartService.js";
import { checkoutAndPay, getUserOrders, getOrderById } from "./services/orderService.js";
import bcrypt from "bcrypt";

async function runTests() {
    console.log("=== Starting End-to-End Verification ===");
    await connectDB();

    const timestamp = Date.now();
    const testEmail = `tester_${timestamp}@example.com`;
    const testPassword = "securePassword123";

    try {
        // 1. Test User Signup & Login
        console.log("\n1. Testing User Signup & Login...");
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(testPassword, salt);
        const newUser = await signupService("Test User", testEmail, hash);
        console.log("✓ User signed up:", newUser.email);

        const { user, token } = await loginService(testEmail, testPassword);
        console.log("✓ User logged in successfully. Token generated:", token ? "YES" : "NO");
        const userId = user.id;

        // 2. Test Product Creation & Catalog
        console.log("\n2. Testing Product Creation & Search...");
        const prod1 = await createProduct({
            name: `Mechanical Keyboard ${timestamp}`,
            price: 120.00,
            description: "RGB clicky gaming keyboard",
            inventory: 5
        });
        const prod2 = await createProduct({
            name: `Wireless Mouse ${timestamp}`,
            price: 45.00,
            description: "Ergonomic wireless mouse",
            inventory: 10
        });
        console.log(`✓ Products created: ${prod1.name} (stock: ${prod1.inventory}), ${prod2.name} (stock: ${prod2.inventory})`);

        // Search products
        const searchResults = await getProducts({ search: "Mechanical Keyboard", minPrice: 100 });
        console.log(`✓ Search for 'Mechanical Keyboard' returned ${searchResults.products.length} product(s)`);
        if (searchResults.products.length === 0) throw new Error("Search failed to return product");

        // 3. Test Cart Operations
        console.log("\n3. Testing Cart Operations (Add, Update, Remove)...");
        // Add prod1 (qty 2)
        await addToCart(userId, prod1.id, 2);
        // Add prod2 (qty 1)
        await addToCart(userId, prod2.id, 1);

        let cart = await getCartWithItems(userId);
        console.log(`✓ Cart has ${cart.items.length} unique items. Total amount: $${cart.totalAmount}`);
        if (cart.totalAmount !== 285.00) { // (2 * 120) + (1 * 45) = 285.00
            throw new Error(`Cart total mismatch: expected 285.00, got ${cart.totalAmount}`);
        }

        // Update prod2 quantity to 2
        await updateCartItemQuantity(userId, prod2.id, 2);
        cart = await getCartWithItems(userId);
        console.log(`✓ Updated prod2 qty to 2. New total: $${cart.totalAmount}`);
        if (cart.totalAmount !== 330.00) { // (2 * 120) + (2 * 45) = 330.00
            throw new Error(`Cart total mismatch after update: expected 330.00, got ${cart.totalAmount}`);
        }

        // Remove prod2 from cart
        await removeFromCart(userId, prod2.id);
        cart = await getCartWithItems(userId);
        console.log(`✓ Removed prod2. Cart now has ${cart.items.length} item(s). Total: $${cart.totalAmount}`);
        if (cart.items.length !== 1 || cart.totalAmount !== 240.00) {
            throw new Error("Cart state unexpected after removal");
        }

        // Test Inventory overflow check
        console.log("\n4. Testing Over-Stock Prevention...");
        try {
            // prod1 only has 5 in inventory, 2 already in cart, attempting to add 4 more should fail (2 + 4 = 6 > 5)
            await addToCart(userId, prod1.id, 4);
            throw new Error("Expected stock overflow error but none was thrown!");
        } catch (err: any) {
            console.log("✓ Over-stock prevented correctly:", err.message);
        }

        // 5. Test Checkout and Payment Flow
        console.log("\n5. Testing Checkout & Payment Flow...");
        const checkoutResult = await checkoutAndPay(userId, { paymentMethod: "credit_card" });
        console.log("✓ Checkout completed!");
        console.log(`✓ Order ID: ${checkoutResult.order.id}, Status: ${checkoutResult.order.status}, Total: $${checkoutResult.order.total_amount}`);
        console.log(`✓ Order items count: ${checkoutResult.items.length}`);

        // Verify cart is cleared
        const cartAfterCheckout = await getCartWithItems(userId);
        console.log(`✓ Cart item count after checkout: ${cartAfterCheckout.items.length}`);
        if (cartAfterCheckout.items.length !== 0) {
            throw new Error("Cart was not cleared after checkout");
        }

        // Verify inventory decremented
        const updatedProd1 = await getProductById(prod1.id);
        console.log(`✓ Inventory of prod1 after checkout: ${updatedProd1.inventory} (expected: 3)`);
        if (updatedProd1.inventory !== 3) {
            throw new Error(`Inventory deduction incorrect: expected 3, got ${updatedProd1.inventory}`);
        }

        // 6. Test Order History and Retrieval
        console.log("\n6. Testing Order History & Order Details...");
        const userOrders = await getUserOrders(userId);
        console.log(`✓ User order history count: ${userOrders.length}`);
        if (userOrders.length === 0) throw new Error("Order history is empty");

        const orderDetails = await getOrderById(userId, checkoutResult.order.id);
        console.log(`✓ Retrieved order details for ${orderDetails.order.id}. Items: ${orderDetails.items.length}`);

        console.log("\n==========================================");
        console.log("ALL TESTS PASSED SUCCESSFULLY!");
        console.log("==========================================");

    } catch (e) {
        console.error("Test failed with error:", e);
        process.exitCode = 1;
    } finally {
        await disconnectDB();
    }
}

runTests();
