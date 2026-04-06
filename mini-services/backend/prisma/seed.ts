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
  await db.coupon.deleteMany();

  // Categories
  const categories = await Promise.all([
    db.category.create({ data: { name: 'Leather & Artisan', slug: 'leather-artisan', description: "Cuirs artisans, babouches, sacs" } }),
    db.category.create({ data: { name: 'Luminaires', slug: 'luminaires', description: "Lanternes, bougies, éclairage traditionnel" } }),
    db.category.create({ data: { name: 'Textiles', slug: 'textiles', description: "Couvertures berbères, tapis, coussins" } }),
    db.category.create({ data: { name: 'Cuisine', slug: 'cuisine', description: "Tagines, huile d'olive, épices" } }),
    db.category.create({ data: { name: 'Bijoux', slug: 'bijoux', description: "Bijoux amazighs, argent, fibule kabyle" } }),
    db.category.create({ data: { name: 'Décoration', slug: 'decoration', description: "Vases, sculptures, objets d'art" } }),
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
      name: 'Sac à Dos "Atlas" en Cuir',
      slug: 'sac-a-dos-cuir-atlas',
      description: "Inspiré par les sacs de voyage des caravanes du Sud, ce sac à dos en cuir de chameau est robuste et intemporel. Les fermoirs en laiton sont forgés à l'ancienne et le cuir développera une patine unique avec le temps.",
      shortDesc: 'Sac à dos en cuir de chameau, tannage naturel',
      price: 24500,
      comparePrice: 32000,
      categoryId: categories[0].id,
      images: '["/images/products/backpack.png"]',
      colors: '["#8B4513","#5D4037"]',
      materials: '["Cuir de chameau","Laiton massif"]',
      dimensions: '45 x 35 x 15 cm',
      weight: 1.8,
      stock: 12,
      isFeatured: true,
      isNew: false,
      rating: 4.9,
      reviewCount: 56,
      tags: '["sac","cuir","voyage","atlas","artisanal"]',
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
      name: 'Lampe de Table "Béjaïa"',
      slug: 'lampe-table-bejaia',
      description: "Une pièce de design contemporain qui utilise les techniques de martelage kabyle. La lumière se diffuse à travers les micro-perforations pour créer une ambiance chaleureuse et feutrée.",
      shortDesc: 'Lampe d\'ambiance en cuivre martelé',
      price: 15800,
      comparePrice: 21000,
      categoryId: categories[1].id,
      images: '["/images/products/lamp.png"]',
      colors: '["#B87333","#C0C0C0"]',
      materials: '["Cuivre","Socle en bois de cèdre"]',
      dimensions: '20 x 20 x 35 cm',
      weight: 1.4,
      stock: 18,
      isFeatured: false,
      isNew: true,
      rating: 4.7,
      reviewCount: 42,
      tags: '["lampe","cuivre","bejaia","design","artisanat"]',
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
      name: 'Casque Audio "Melody de Ghardaïa"',
      slug: 'casque-audio-ghardaia',
      description: "Le mariage parfait de la technologie et de l'artisanat. Ce casque haut de gamme est habillé d'un cuir de chèvre tressé main par les artisanes du M'Zab. Qualité sonore cristalline et confort absolu.",
      shortDesc: 'Casque audio premium avec finitions en cuir tressé',
      price: 32000,
      comparePrice: 45000,
      categoryId: categories[0].id,
      images: '["/images/products/headphones.png"]',
      colors: '["#2d2d2d","#8B4513"]',
      materials: '["Cuir de chèvre","Aluminium brossé","Mousse à mémoire"]',
      dimensions: 'Standard',
      weight: 0.32,
      stock: 8,
      isFeatured: true,
      isNew: true,
      rating: 4.9,
      reviewCount: 24,
      tags: '["audio","casque","cuir","ghardaia","luxe"]',
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
      name: 'Vase "Oasis de Biskra"',
      slug: 'vase-oasis-biskra',
      description: "Un vase en poterie traditionnelle de Biskra, vernissé de façon à rappeler les reflets du soleil sur le sable du Sahara. Parfait pour sublimer vos fleurs séchées ou comme objet décoratif central.",
      shortDesc: 'Vase en poterie de Biskra, reflets sahariens',
      price: 5400,
      comparePrice: 7200,
      categoryId: categories[5].id, // Décoration
      images: '["/images/products/vase.png"]',
      colors: '["#D2B48C","#F4A460"]',
      materials: '["Argile rouge","Vernis naturel"]',
      dimensions: '18 x 18 x 30 cm',
      weight: 1.2,
      stock: 45,
      isFeatured: false,
      isNew: true,
      rating: 4.8,
      reviewCount: 67,
      tags: '["vase","poterie","biskra","decoration","oasis"]',
    },
    {
      name: 'Chaise "Touareg" Design',
      slug: 'chaise-touareg-design',
      description: "Une réinterprétation moderne du trône traditionnel nomade. Structure en bois de cèdre de l'Atlas et assise en cuir tendu surpiqué de motifs tribaux.",
      shortDesc: 'Chaise design en bois de cèdre et cuir Touareg',
      price: 48000,
      comparePrice: 65000,
      categoryId: categories[5].id, // Décoration
      images: '["/images/products/chair.png"]',
      colors: '["#8B4513","#2d2d2d"]',
      materials: '["Bois de cèdre","Cuir de bovin"]',
      dimensions: '55 x 60 x 85 cm',
      weight: 12.5,
      stock: 6,
      isFeatured: true,
      isNew: true,
      rating: 5.0,
      reviewCount: 15,
      tags: '["mobilier","chaise","touareg","luxe","cedre"]',
    },
    {
      name: 'Enceinte Bluetooth Artisanal',
      slug: 'enceinte-bluetooth-artisanal',
      description: "L'acoustique parfaite du bois associée à un design inspiré des tambours bédouins. Cette enceinte offre un son puissant et chaleureux dans un écrin de bois noble gravé.",
      shortDesc: 'Enceinte bluetooth en bois massif gravé',
      price: 19500,
      comparePrice: 28000,
      categoryId: categories[0].id,
      images: '["/images/products/speaker.png"]',
      colors: '["#5D4037","#8B4513"]',
      materials: '["Noyer sculpté","Composants audio HIFI"]',
      dimensions: '15 x 15 x 20 cm',
      weight: 1.1,
      stock: 22,
      isFeatured: false,
      isNew: true,
      rating: 4.8,
      reviewCount: 38,
      tags: '["audio","enceinte","bois","artisanal","musique"]',
    },
    {
      name: 'Montre "Héritage Kabyle"',
      slug: 'montre-heritage-kabyle',
      description: "Une montre de luxe au cadran gravé de symboles Tifinagh. Le bracelet est réalisé en cuir de veau bleu de haute qualité, rappelant les cieux de la Kabylie.",
      shortDesc: 'Montre de prestige, cadran gravé et bracelet cuir',
      price: 36000,
      comparePrice: 49000,
      categoryId: categories[4].id, // Bijoux
      images: '["/images/products/watch.png"]',
      colors: '["#1E3A8A","#C0C0C0"]',
      materials: '["Acier 316L","Mouvement automatique","Cuir premium"]',
      dimensions: '42mm',
      weight: 0.15,
      stock: 5,
      isFeatured: true,
      isNew: true,
      rating: 4.9,
      reviewCount: 12,
      tags: '["montre","luxe","kabyle","bijou","horlogerie"]',
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

  // Demo customers (Algerian names)
  const customerNames = [
    { name: 'Karim Mansouri', email: 'karim@email.com' },
    { name: 'Zohra Dahmane', email: 'zohra@email.com' },
    { name: 'Yacine Brahimi', email: 'yacine@email.com' },
    { name: 'Lina Belkacem', email: 'lina@email.com' },
    { name: 'Omar Khelifi', email: 'omar@email.com' },
  ];

  const createdUsers = [];
  for (const c of customerNames) {
    const u = await db.user.create({
      data: {
        email: c.email,
        name: c.name,
        role: 'customer',
        password: customerPassword,
        points: Math.floor(Math.random() * 5000),
        level: Math.floor(Math.random() * 5) + 1,
      },
    });
    createdUsers.push(u);
  }
  console.log(`✅ Created ${createdUsers.length} Algerian customers`);

  // Coupons
  const coupons = [
    { code: 'DARNA20', discountType: 'percentage', discountValue: 20, description: '20% de remise sur votre commande', minOrderTotal: 5000, isActive: true },
    { code: 'MARHBA', discountType: 'fixed', discountValue: 1000, description: '1000 DA offerts pour votre première commande', minOrderTotal: 3000, isActive: true },
    { code: 'SUMMER25', discountType: 'percentage', discountValue: 15, description: 'Promotion été 2025', minOrderTotal: 8000, isActive: true, endDate: new Date('2025-08-31') },
  ];

  for (const coupon of coupons) {
    await db.coupon.create({ data: coupon });
  }
  console.log(`✅ Created ${coupons.length} coupons`);

  // Sample orders over last 6 months
  const cities = ['Alger', 'Oran', 'Constantine', 'Annaba', 'Tlemcen', 'Sétif', 'Béjaïa'];
  const statuses = ['pending', 'confirmed', 'shipped', 'delivered'];
  let orderCount = 0;

  for (let i = 0; i < 25; i++) {
    const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Random date in last 6 months
    const date = new Date();
    date.setMonth(date.getMonth() - Math.floor(Math.random() * 6));
    date.setDate(Math.floor(Math.random() * 28) + 1);

    const subtotal = Math.floor(Math.random() * 15000) + 5000;
    const tax = subtotal * 0.05;
    const shipping = subtotal > 15000 ? 0 : 800;
    const total = subtotal + tax + shipping;

    await db.order.create({
      data: {
        userId: user.id,
        status,
        total,
        subtotal,
        tax,
        shipping,
        address: `${Math.floor(Math.random() * 50) + 1} Rue de la Liberté`,
        city,
        country: 'Algérie',
        zipCode: '16000',
        paymentMethod: 'cash_on_delivery',
        createdAt: date,
        items: {
          create: [
            { 
              productId: createdProducts[Math.floor(Math.random() * createdProducts.length)].id, 
              quantity: Math.floor(Math.random() * 2) + 1, 
              price: subtotal / 2 
            }
          ],
        },
      },
    });
    orderCount++;
  }
  console.log(`✅ Generated ${orderCount} sample historical orders`);

  console.log('\n🎉 Seed complete — Darna is ready!');
  console.log(`   📦 ${products.length} products`);
  console.log(`   📂 ${categories.length} categories`);
  console.log(`   👤 ${createdUsers.length + 2} users — passwords are hashed`);
  console.log(`   🔐 Demo credentials:`);
  console.log(`      Admin:  admin@darna.dz / admin123`);
  console.log(`      User:   amina@email.com / amina123`);
  console.log(`      Others: [karim, zohra, yacine, lina, omar]@email.com / amina123`);
}

seed()
  .catch(console.error)
  .finally(() => process.exit(0));
