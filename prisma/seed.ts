import { db } from '@/lib/db';

const categories = [
  { name: 'Electronics', slug: 'electronics', description: 'Premium audio, watches, and smart devices' },
  { name: 'Furniture', slug: 'furniture', description: 'Modern chairs, desks, and home furnishings' },
  { name: 'Accessories', slug: 'accessories', description: 'Bags, lighting, and home decor' },
];

const products = [
  {
    name: 'Aura Pro Wireless Headphones',
    slug: 'aura-pro-headphones',
    description: 'Experience unparalleled audio clarity with the Aura Pro Wireless Headphones. Featuring active noise cancellation, 40mm custom drivers, and up to 60 hours of battery life. The premium memory foam ear cushions provide all-day comfort, while the sleek matte black finish makes a bold statement.',
    shortDesc: 'Premium ANC headphones with 60h battery',
    price: 349.99,
    comparePrice: 449.99,
    categorySlug: 'electronics',
    images: '["/images/products/headphones.png"]',
    colors: '["#1a1a1a","#c8c8c8","#8B4513","#1e3a5f"]',
    materials: '["Matte Plastic","Premium Leather","Aluminum"]',
    dimensions: '20 x 18 x 8 cm',
    weight: 0.31,
    stock: 145,
    isFeatured: true,
    isNew: true,
    rating: 4.8,
    reviewCount: 234,
    tags: '["wireless","anc","premium","audio"]',
    seoTitle: 'Aura Pro Wireless Headphones - Premium ANC Audio',
    seoDesc: 'Buy Aura Pro Wireless Headphones with active noise cancellation, 60h battery, premium comfort.',
  },
  {
    name: 'Ergonix Pro Office Chair',
    slug: 'ergonix-pro-chair',
    description: 'The Ergonix Pro combines cutting-edge ergonomics with sophisticated design. Featuring 4D adjustable armrests, breathable mesh back, synchronized tilt mechanism, and lumbar support that adapts to your posture. Built for professionals who demand the best.',
    shortDesc: 'Ergonomic mesh office chair with lumbar support',
    price: 899.99,
    comparePrice: 1099.99,
    categorySlug: 'furniture',
    images: '["/images/products/chair.png"]',
    colors: '["#2d2d2d","#4a5568","#1a365d","#744210"]',
    materials: '["Mesh","Premium Fabric","Genuine Leather"]',
    dimensions: '68 x 70 x 120 cm',
    weight: 18.5,
    stock: 42,
    isFeatured: true,
    isNew: false,
    rating: 4.9,
    reviewCount: 567,
    tags: '["ergonomic","office","mesh","premium"]',
    seoTitle: 'Ergonix Pro Office Chair - Ergonomic Excellence',
    seoDesc: 'Shop the Ergonix Pro Office Chair with 4D armrests, breathable mesh, and adaptive lumbar support.',
  },
  {
    name: 'Chronos Smart Watch',
    slug: 'chronos-smart-watch',
    description: 'The Chronos Smart Watch merges luxury craftsmanship with intelligent technology. Featuring a sapphire crystal display, health monitoring suite, GPS tracking, and 7-day battery life. The titanium case is water resistant to 100m.',
    shortDesc: 'Luxury smartwatch with sapphire crystal display',
    price: 599.99,
    comparePrice: 749.99,
    categorySlug: 'electronics',
    images: '["/images/products/watch.png"]',
    colors: '["#c0c0c0","#ffd700","#1a1a1a","#b76e79"]',
    materials: '["Titanium","Stainless Steel","Ceramic"]',
    dimensions: '4.4 x 4.4 x 1.2 cm',
    weight: 0.052,
    stock: 89,
    isFeatured: true,
    isNew: true,
    rating: 4.7,
    reviewCount: 189,
    tags: '["smartwatch","luxury","titanium","gps"]',
    seoTitle: 'Chronos Smart Watch - Luxury Meets Technology',
    seoDesc: 'Discover the Chronos Smart Watch with sapphire crystal, health suite, GPS, and 7-day battery.',
  },
  {
    name: 'Lumière Designer Lamp',
    slug: 'lumiere-designer-lamp',
    description: 'The Lumière Designer Lamp is a masterpiece of form and function. Its adjustable brass-finished arm and hand-blown glass shade create the perfect ambient lighting. Touch-sensitive dimming with 4 color temperature modes.',
    shortDesc: 'Adjustable brass desk lamp with touch dimming',
    price: 279.99,
    comparePrice: 349.99,
    categorySlug: 'accessories',
    images: '["/images/products/lamp.png"]',
    colors: '["#b8860b","#c0c0c0","#1a1a1a","#c8a2c8"]',
    materials: '["Brass","Brushed Steel","Matte Black"]',
    dimensions: '25 x 25 x 55 cm',
    weight: 2.8,
    stock: 67,
    isFeatured: false,
    isNew: true,
    rating: 4.6,
    reviewCount: 98,
    tags: '["lamp","designer","brass","lighting"]',
    seoTitle: 'Lumière Designer Lamp - Premium Ambient Lighting',
    seoDesc: 'Buy the Lumière Designer Lamp with adjustable brass arm, hand-blown glass, and touch dimming.',
  },
  {
    name: 'Nomad Leather Backpack',
    slug: 'nomad-leather-backpack',
    description: 'Crafted from full-grain vegetable-tanned leather, the Nomad Backpack develops a rich patina over time. Features a padded 15" laptop compartment, anti-theft back pocket, and water-resistant lining. Built for the modern traveler.',
    shortDesc: 'Full-grain leather backpack with laptop compartment',
    price: 449.99,
    comparePrice: 549.99,
    categorySlug: 'accessories',
    images: '["/images/products/backpack.png"]',
    colors: '["#8B4513","#2d2d2d","#556b2f","#722f37"]',
    materials: '["Full-Grain Leather","Canvas","Vegan Leather"]',
    dimensions: '32 x 18 x 45 cm',
    weight: 1.2,
    stock: 31,
    isFeatured: false,
    isNew: false,
    rating: 4.8,
    reviewCount: 312,
    tags: '["backpack","leather","travel","laptop"]',
    seoTitle: 'Nomad Leather Backpack - Handcrafted Premium Travel',
    seoDesc: 'Shop the Nomad Leather Backpack with full-grain leather, laptop compartment, and anti-theft pocket.',
  },
  {
    name: 'Echo Sphere Speaker',
    slug: 'echo-sphere-speaker',
    description: 'The Echo Sphere delivers 360-degree immersive sound with its innovative spherical design. Featuring room-calibrating AI, multi-room sync, and premium drivers. The woven fabric exterior comes in designer colors.',
    shortDesc: '360° immersive speaker with AI room calibration',
    price: 399.99,
    comparePrice: 499.99,
    categorySlug: 'electronics',
    images: '["/images/products/speaker.png"]',
    colors: '["#1a1a1a","#f5f5f5","#2d5016","#4a0e4e"]',
    materials: '["Woven Fabric","Aluminum","Matte Plastic"]',
    dimensions: '16 x 16 x 18 cm',
    weight: 1.8,
    stock: 73,
    isFeatured: true,
    isNew: false,
    rating: 4.7,
    reviewCount: 456,
    tags: '["speaker","360","ai","premium"]',
    seoTitle: 'Echo Sphere Speaker - 360° Immersive Audio',
    seoDesc: 'Experience the Echo Sphere Speaker with 360° sound, AI calibration, and multi-room sync.',
  },
  {
    name: 'Artisan Ceramic Vase Set',
    slug: 'artisan-ceramic-vase',
    description: 'This handcrafted ceramic vase set brings artisanal elegance to any space. Each piece is individually thrown and glazed by skilled craftspeople. The set includes 3 complementary sizes in a matte white finish.',
    shortDesc: 'Handcrafted ceramic vase set, 3 pieces',
    price: 189.99,
    comparePrice: 249.99,
    categorySlug: 'accessories',
    images: '["/images/products/vase.png"]',
    colors: '["#f5f5f5","#e8d5b7","#b8c5d6","#d4c5a9"]',
    materials: '["Ceramic","Porcelain","Stoneware"]',
    dimensions: '12 x 12 x 30 cm (largest)',
    weight: 3.2,
    stock: 28,
    isFeatured: false,
    isNew: true,
    rating: 4.5,
    reviewCount: 78,
    tags: '["vase","ceramic","handmade","decor"]',
    seoTitle: 'Artisan Ceramic Vase Set - Handcrafted Elegance',
    seoDesc: 'Shop the Artisan Ceramic Vase Set, handcrafted 3-piece set with matte white glaze.',
  },
  {
    name: 'Vertex Ultrabook Pro',
    slug: 'vertex-ultrabook-pro',
    description: 'The Vertex Ultrabook Pro redefines portable computing with its stunning 14" 4K OLED display, latest-gen processor, 32GB RAM, and all-day battery. The CNC-machined aluminum unibody is just 12mm thin.',
    shortDesc: '14" 4K OLED ultrabook, 32GB RAM',
    price: 1899.99,
    comparePrice: 2199.99,
    categorySlug: 'electronics',
    images: '[]',
    colors: '["#c0c0c0","#2d2d2d","#1a365d"]',
    materials: '["Aluminum","Carbon Fiber","Magnesium"]',
    dimensions: '31.2 x 22.1 x 1.2 cm',
    weight: 1.29,
    stock: 15,
    isFeatured: true,
    isNew: true,
    rating: 4.9,
    reviewCount: 145,
    tags: '["laptop","ultrabook","4k","oled"]',
    seoTitle: 'Vertex Ultrabook Pro - Premium Portable Computing',
    seoDesc: 'Buy the Vertex Ultrabook Pro with 14" 4K OLED, 32GB RAM, and all-day battery life.',
  },
];

const badges = [
  { name: 'First Purchase', description: 'Made your first purchase', icon: '🛍️', requirement: 1 },
  { name: 'Review Writer', description: 'Wrote 5 product reviews', icon: '✍️', requirement: 5 },
  { name: 'Loyal Customer', description: 'Made 10 purchases', icon: '⭐', requirement: 10 },
  { name: 'Big Spender', description: 'Spent over $1000 total', icon: '💰', requirement: 1000 },
  { name: 'Trendsetter', description: 'Reviewed a new product', icon: '🔥', requirement: 0 },
  { name: 'VIP Member', description: 'Earned 5000 points', icon: '👑', requirement: 5000 },
];

async function seed() {
  console.log('🌱 Seeding database...');

  // Create categories
  for (const cat of categories) {
    await db.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`✅ Created ${categories.length} categories`);

  // Create products
  for (const prod of products) {
    const category = await db.category.findUnique({ where: { slug: prod.categorySlug } });
    if (!category) continue;
    const { categorySlug, ...data } = prod;
    await db.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: { ...data, categoryId: category.id },
    });
  }
  console.log(`✅ Created ${products.length} products`);

  // Create badges
  for (const badge of badges) {
    await db.badge.upsert({
      where: { id: badge.name.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: { id: badge.name.toLowerCase().replace(/\s+/g, '-'), ...badge },
    });
  }
  console.log(`✅ Created ${badges.length} badges`);

  // Create demo admin user
  await db.user.upsert({
    where: { email: 'admin@luxe.com' },
    update: {},
    create: {
      email: 'admin@luxe.com',
      name: 'Admin User',
      role: 'admin',
      points: 2500,
      level: 5,
    },
  });
  console.log('✅ Created admin user');

  console.log('🎉 Seed complete!');
}

seed()
  .catch(console.error)
  .finally(() => process.exit(0));
