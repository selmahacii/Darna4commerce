import bcrypt from 'bcryptjs';
import db from '../src/config/database.js';

async function seed() {
  console.log('🌱 Seeding Darna Algerian artisan database...');

  // Reset database
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.cartItem.deleteMany();
  await db.review.deleteMany();
  await db.userBadge.deleteMany();
  await db.pointHistory.deleteMany();
  await db.analyticsEvent.deleteMany();
  await db.product.deleteMany();
  await db.badge.deleteMany();
  await db.category.deleteMany();
  await db.user.deleteMany();

  // Categories
  const categories = await Promise.all([
    db.category.create({ data: { name: 'Leather & Artisan', slug: 'leather-artisan', description: "Cuirs artisans, babouches, sacs" } }),
    db.category.create({ data: { name: 'Luminaires', slug: 'luminaires', description: "Lanternes, bougies, éclairage traditionnel" } }),
    db.category.create({ data: { name: 'Textiles', slug: 'textiles', description: "Couvertures berbères, tapis, coussins" } }),
    db.category.create({ data: { name: 'Cuisine', slug: 'cuisine', description: "Tagines, huile d'olive, épices" } }),
    db.category.create({ data: { name: 'Bijoux', slug: 'bijoux', description: "Bijoux amazighs, argent, fibule kabyle" } }),
  ]);
  console.log(`✅ Created ${categories.length} categories`);

  // Products with DZD pricing
  const products = [
    {
      name: 'Babouches Artisanales en Cuir',
      slug: 'babouches-cuir-artisanal',
      description: "Confectionnées à la main par nos artisans de la Casbah d'Alger, ces babouches en cuir pleine fleur allient tradition et élégance. Le cuir est tanné naturellement, sans produits chimiques, et cousu avec le fil doré traditionnel. Chaque paire est unique — légèrement différente de sa voisine, comme tout ce qui est fait avec le cœur.",
      shortDesc: 'Babouches en cuir véritable, cousues main à Alger',
      price: 8500,
      comparePrice: 12000,
      categoryId: categories[0].id,
      images: '["/images/products/babouches.png"]',
      colors: '["#8B4513","#2d2d2d","#C4A35A","#722F37"]',
      materials: '["Cuir pleine fleur","Cuir d\'agneau","Cuir de chèvre"]',
      dimensions: 'Variable (S, M, L, XL)',
      weight: 0.35,
      stock: 48,
      isFeatured: true,
      isNew: true,
      rating: 4.9,
      reviewCount: 312,
      tags: '["babouches","cuir","artisanal","alger","tradition"]',
    },
    {
      name: 'Lanterne en Laiton Forgé',
      slug: 'lanterne-laiton-forge',
      description: "Cette lanterne en laiton massif est réalisée par les maîtres forgerons de Tlemcen. Chaque ouverture est découpée à la main selon les motifs géométriques ancestraux de la région. Quand la bougie brille à l'intérieur, les ombres dansent sur vos murs comme à la veille d'une fête de mariage.",
      shortDesc: 'Lanterne en laiton, motifs géométriques de Tlemcen',
      price: 12500,
      comparePrice: 16000,
      categoryId: categories[1].id,
      images: '["/images/products/lantern.png"]',
      colors: '["#B8860B","#C0C0C0","#1a1a1a"]',
      materials: '["Laiton massif","Cuivre","Bronze"]',
      dimensions: '28 x 28 x 45 cm',
      weight: 2.1,
      stock: 24,
      isFeatured: true,
      isNew: false,
      rating: 4.8,
      reviewCount: 189,
      tags: '["lanterne","laiton","tlemcen","artisan","luminaires"]',
    },
    {
      name: 'Couverture Berbère Tissage Main',
      slug: 'couverture-berbere-tissage',
      description: "Tissée sur un métier traditionnel par les femmes de la Kabylie, cette couverture en laine mérinos raconte les symboles de notre héritage amazigh — le triangle de la fertilité, les lignes ondulées des rivières de Djurdjura. Chaque couverture demande près de trois semaines de travail patient.",
      shortDesc: 'Couverture en laine berbère, tissée main en Kabylie',
      price: 18000,
      comparePrice: 24000,
      categoryId: categories[2].id,
      images: '["/images/products/blanket.png"]',
      colors: '["#F5F0E1","#C4A35A","#556B2F","#8B4513"]',
      materials: '["Laine mérinos","Coton bio","Laine recyclée"]',
      dimensions: '180 x 240 cm',
      weight: 2.8,
      stock: 15,
      isFeatured: true,
      isNew: true,
      rating: 4.9,
      reviewCount: 267,
      tags: '["couverture","berbere","kabylie","laine","tissage","amazigh"]',
    },
    {
      name: 'Tagine en Céramique Peinte Main',
      slug: 'tagine-ceramique-peinte',
      description: "Notre tagine en céramique est décoré à la main avec les motifs floraux de Constantine. Le couvercle conique permet une cuisson lente et uniforme, comme le font nos grands-mères depuis des générations.",
      shortDesc: 'Tagine en céramique, motifs floraux de Constantine',
      price: 6500,
      comparePrice: 8500,
      categoryId: categories[3].id,
      images: '["/images/products/tagine.png"]',
      colors: '["#C4A35A","#E8D5B7","#1a1a1a","#4A0E4E"]',
      materials: '["Céramique","Terre cuite","Grès"]',
      dimensions: '32 cm de diamètre',
      weight: 3.5,
      stock: 32,
      isFeatured: false,
      isNew: true,
      rating: 4.7,
      reviewCount: 156,
      tags: '["tagine","céramique","constantine","cuisine","tradition"]',
    },
    {
      name: "Huile d'Olive Extra Vierge Bio",
      slug: 'huile-olive-bio-kabylie',
      description: "Récoltée à la main dans les oliveraies centenaires de la Kabylie, cette huile d'olive extra vierge est pressée à froid dans les 24 heures. Un goût fruité et légèrement poivré qui vous transporte directement dans nos montagnes.",
      shortDesc: "Huile d'olive pressée à froid, oliveraies de Kabylie",
      price: 4200,
      comparePrice: 5500,
      categoryId: categories[3].id,
      images: '["/images/products/olive-oil.png"]',
      colors: '["#556B2F","#C4A35A"]',
      materials: '["Première pression à froid","Bio certifié"]',
      dimensions: '75 cl',
      weight: 1.2,
      stock: 120,
      isFeatured: true,
      isNew: false,
      rating: 4.8,
      reviewCount: 445,
      tags: '["huile","olive","bio","kabylie","première pression"]',
    },
    {
      name: 'Collier Fibule Kabyle en Argent',
      slug: 'collier-fibule-kabyle-argent',
      description: "La fibule kabyle est bien plus qu'un bijou — c'est un symbole de l'identité amazigh, porté par les femmes de nos montagnes depuis des millénaires. Chaque pièce est ciselée à la main par nos orfèvres de Tizi Ouzou.",
      shortDesc: 'Fibule kabyle en argent 925, ciselée main',
      price: 28000,
      comparePrice: 35000,
      categoryId: categories[4].id,
      images: '["/images/products/jewelry.png"]',
      colors: '["#C0C0C0","#FFD700"]',
      materials: '["Argent 925","Or 18K","Verre émaillé"]',
      dimensions: '6 cm de diamètre',
      weight: 0.085,
      stock: 12,
      isFeatured: true,
      isNew: true,
      rating: 5.0,
      reviewCount: 98,
      tags: '["fibule","kabyle","argent","amazigh","bijoux","tifinagh"]',
    },
    {
      name: "Panier en Alfa Tressé Main",
      slug: 'panier-alfa-tresse',
      description: "Tressé à partir de fibres d'alfa sauvage récoltées dans les Hauts Plateaux, ce panier est le fruit de semaines de travail patient. Les femmes du M'zab perpétuent ce savoir-faire millénaire avec une précision qui force le respect.",
      shortDesc: "Panier en alfa, tressé main par les femmes du M'zab",
      price: 3800,
      comparePrice: 5000,
      categoryId: categories[0].id,
      images: '["/images/products/basket.png"]',
      colors: '["#C8A96E","#8B7355","#D4C5A9"]',
      materials: "['Fibre d\\'alfa','Jonc naturel','Rotin']",
      dimensions: '30 x 20 x 15 cm',
      weight: 0.4,
      stock: 35,
      isFeatured: false,
      isNew: false,
      rating: 4.6,
      reviewCount: 134,
      tags: '["panier","alfa","mzab","tressé","artisan","naturel"]',
    },
    {
      name: "Brûle-Encens Bokhour en Cuivre",
      slug: 'bokhour-encens-cuivre',
      description: "Le bokhour fait partie de notre héritage les plus intimes — chaque foyer algérien garde précieusement son mélange d'encens. Ce brûle-parfum en cuivre gravé de motifs tlemceniens est conçu pour réchauffer votre espace.",
      shortDesc: 'Brûle-encens bokhour en cuivre gravé, tradition algérienne',
      price: 9200,
      comparePrice: 11500,
      categoryId: categories[1].id,
      images: '["/images/products/bokhour.png"]',
      colors: '["#B87333","#C0C0C0","#1a1a1a"]',
      materials: '["Cuivre","Laiton","Bronze"]',
      dimensions: '15 x 15 x 12 cm',
      weight: 0.9,
      stock: 28,
      isFeatured: false,
      isNew: true,
      rating: 4.7,
      reviewCount: 87,
      tags: '["bokhour","encens","cuivre","tlemcen","tradition"]',
    },
  ];

  const createdProducts = [];
  for (const prod of products) {
    const created = await db.product.create({ data: prod });
    createdProducts.push(created);
  }
  console.log(`✅ Created ${createdProducts.length} products`);

  // Badges
  const badges = [
    { id: 'premier-achat', name: 'Premier Achat', description: 'Votre premier achat sur Darna', icon: '🛍️', requirement: 1 },
    { id: 'artisan-connaisseur', name: 'Artisan Connaisseur', description: 'Avez noté 5 produits', icon: '✍️', requirement: 5 },
    { id: 'fidèle', name: 'Client Fidèle', description: '10 achats effectués', icon: '⭐', requirement: 10 },
    { id: 'grand-acheteur', name: 'Membre Premium', description: 'Dépensé plus de 50 000 DA', icon: '💎', requirement: 50000 },
    { id: 'ambassadeur', name: 'Ambassadeur', description: 'Avez partagé 3 produits', icon: '📢', requirement: 3 },
    { id: 'darna-elite', name: 'Darna Élite', description: 'Gagné 25 000 points', icon: '👑', requirement: 25000 },
  ];

  for (const badge of badges) {
    await db.badge.create({ data: badge });
  }
  console.log(`✅ Created ${badges.length} badges`);

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const customerPassword = await bcrypt.hash('amina123', 10);

  // Admin user
  await db.user.create({
    data: {
      email: 'admin@darna.dz',
      name: 'Mehdi Admin',
      role: 'admin',
      password: adminPassword,
      points: 15000,
      level: 8,
    },
  });
  console.log('✅ Created admin user (admin@darna.dz / admin123)');

  // Demo customer
  await db.user.create({
    data: {
      email: 'amina@email.com',
      name: 'Amina Benali',
      role: 'customer',
      password: customerPassword,
      points: 3200,
      level: 4,
    },
  });
  console.log('✅ Created demo customer (amina@email.com / amina123)');

  // Sample reviews
  const sampleReviews = [
    { productId: createdProducts[0].id, rating: 5, title: 'Magnifique!', comment: 'Qualité exceptionnelle, cousues avec amour.' },
    { productId: createdProducts[1].id, rating: 5, title: 'Un chef-d\'œuvre', comment: 'La lanterne est encore plus belle en vrai.' },
    { productId: createdProducts[5].id, rating: 5, title: 'Bijou sublime', comment: 'Ma femme l\'adore! Qualité argent 925 impeccable.' },
  ];

  const customer = await db.user.findFirst({ where: { role: 'customer' } });
  for (const review of sampleReviews) {
    if (customer) {
      await db.review.create({
        data: {
          productId: review.productId,
          userId: customer.id,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
        },
      });
    }
  }
  console.log(`✅ Created ${sampleReviews.length} sample reviews`);

  // Sample order
  if (customer) {
    await db.order.create({
      data: {
        userId: customer.id,
        status: 'delivered',
        total: 21000,
        subtotal: 19500,
        tax: 1500,
        shipping: 0,
        address: '12 Rue Didouche Mourad',
        city: 'Alger',
        country: 'Algérie',
        zipCode: '16000',
        paymentMethod: 'credit_card',
        items: {
          create: [
            { productId: createdProducts[0].id, quantity: 1, price: 8500 },
            { productId: createdProducts[4].id, quantity: 2, price: 4200 },
          ],
        },
      },
    });
    console.log('✅ Created sample order');
  }

  console.log('\n🎉 Seed complete — Darna is ready!');
  console.log(`   📦 ${products.length} products`);
  console.log(`   📂 ${categories.length} categories`);
  console.log(`   👤 2 users (admin + customer) — passwords are hashed`);
  console.log(`   🏅 ${badges.length} badges`);
  console.log(`   🔐 Demo credentials:`);
  console.log(`      Admin:  admin@darna.dz / admin123`);
  console.log(`      User:   amina@email.com / amina123`);
}

seed()
  .catch(console.error)
  .finally(() => process.exit(0));
