import "dotenv/config";
import { pool, connectDB, disconnectDB } from "./services/databaseService.js";

// List of realistic product name parts by category to generate 1000+ unique, realistic products
const categories = [
    {
        name: "Electronics",
        adjectives: ["Wireless", "Ultra-HD", "Pro", "Smart", "Portable", "Noise-Canceling", "Ergonomic", "Fast-Charging"],
        items: ["Earbuds", "Mechanical Keyboard", "Monitor", "Power Bank", "Bluetooth Speaker", "Webcam", "USB-C Hub", "Smartwatch"],
        minPrice: 19.99,
        maxPrice: 499.99
    },
    {
        name: "Fashion & Apparel",
        adjectives: ["Classic", "Vintage", " Slim-Fit", "Waterproof", "Organic Cotton", "Thermal", "Casual", "Premium"],
        items: ["Denim Jacket", "Sneakers", "Running Shoes", "Hoodie", "Leather Belt", "Sunglasses", "Backpack", "Polo Shirt"],
        minPrice: 14.99,
        maxPrice: 189.99
    },
    {
        name: "Home & Kitchen",
        adjectives: ["Stainless Steel", "Non-Stick", "Compact", "Automatic", "Eco-Friendly", "Deluxe", "Multifunctional"],
        items: ["Coffee Maker", "Air Fryer", "Chef Knife Set", "Blender", "Vacuum Cleaner", "Electric Kettle", "Food Processor"],
        minPrice: 24.99,
        maxPrice: 299.99
    },
    {
        name: "Sports & Outdoors",
        adjectives: ["Durable", "Lightweight", "Heavy-Duty", "Insulated", "Adjustable", "All-Weather", "Breathable"],
        items: ["Yoga Mat", "Dumbbell Set", "Water Bottle", "Camping Tent", "Fitness Tracker", "Resistance Bands", "Hiking Boots"],
        minPrice: 9.99,
        maxPrice: 249.99
    },
    {
        name: "Beauty & Personal Care",
        adjectives: ["Hydrating", "Organic", "Gentle", "Revitalizing", "Nourishing", "Deep-Cleansing", "SPF 50+"],
        items: ["Face Serum", "Moisturizer", "Electric Toothbrush", "Hair Dryer", "Sunscreen", "Exfoliating Scrub", "Perfume"],
        minPrice: 7.99,
        maxPrice: 129.99
    }
];

const brandPrefixes = ["Apex", "Nova", "Zenith", "Pulse", "Vortex", "Aura", "Echo", "Titan", "Summit", "Lumina"];

function generateProducts(count: number) {
    const products: { name: string; price: number; description: string; inventory: number }[] = [];

    for (let i = 1; i <= count; i++) {
        const cat = categories[i % categories.length]!;
        const brand = brandPrefixes[(i * 7) % brandPrefixes.length]!;
        const adj = cat.adjectives[(i * 3) % cat.adjectives.length]!;
        const item = cat.items[(i * 5) % cat.items.length]!;

        // Ensure name fits within 50 characters (since schema uses VARCHAR(50))
        let rawName = `${brand} ${adj} ${item}`;
        if (rawName.length > 50) {
            rawName = rawName.substring(0, 47) + "...";
        }

        // Calculate a realistic price with two decimals
        const basePrice = cat.minPrice + (Math.random() * (cat.maxPrice - cat.minPrice));
        const price = parseFloat(basePrice.toFixed(2));

        const inventory = Math.floor(Math.random() * 200) + 10;
        const description = `High quality ${rawName} from ${brand}. Category: ${cat.name}. Ideal for daily use with premium build quality and high performance.`;

        products.push({
            name: rawName,
            price,
            description,
            inventory
        });
    }

    return products;
}

async function seedDatabase(targetCount = 1000) {
    console.log(`Starting database seed procedure for ${targetCount} products...`);
    await connectDB();

    try {
        const products = generateProducts(targetCount);
        const batchSize = 100;
        let insertedCount = 0;

        for (let i = 0; i < products.length; i += batchSize) {
            const batch = products.slice(i, i + batchSize);
            const valueStrings: string[] = [];
            const queryParams: (string | number)[] = [];

            batch.forEach((product, index) => {
                const offset = index * 4;
                valueStrings.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`);
                queryParams.push(product.name, product.price, product.description, product.inventory);
            });

            const query = `
                INSERT INTO products (name, price, description, inventory)
                VALUES ${valueStrings.join(", ")}
            `;

            await pool.query(query, queryParams);
            insertedCount += batch.length;
            console.log(`Progress: ${insertedCount}/${targetCount} products seeded...`);
        }

        const countResult = await pool.query("SELECT COUNT(*) FROM products");
        console.log(`✅ Success! Database populated with products. Total products in database: ${countResult.rows[0].count}`);

    } catch (err) {
        console.error("❌ Error seeding database:", err);
    } finally {
        await disconnectDB();
        process.exit(0);
    }
}

seedDatabase(1000);
