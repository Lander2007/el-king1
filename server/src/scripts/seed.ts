import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB } from '../lib/mongodb';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { Settings } from '../models/Settings';
import { User } from '../models/User';

dotenv.config();

const CASE_IMG = 'https://images.unsplash.com/photo-1593830566460-2464575a9a24?w=600';
const CHARGER_IMG = 'https://images.unsplash.com/photo-1557767382-97b28f5488e7?w=600';
const CABLE_IMG = 'https://images.unsplash.com/photo-1492107376256-4026437926cd?w=600';

async function seed() {
  try {
    await connectDB();
    console.log('Seeding database...');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Settings.deleteMany({});

    // 1. Seed Categories
    const appleCat = await Category.create({
      name: { en: 'Apple Accessories', ar: 'إكسسوارات آبل' },
      slug: 'apple',
      parentCategory: null,
      image: CASE_IMG,
      isActive: true,
      sortOrder: 1,
    });

    const samsungCat = await Category.create({
      name: { en: 'Samsung Accessories', ar: 'إكسسوارات سامسونج' },
      slug: 'samsung',
      parentCategory: null,
      image: CHARGER_IMG,
      isActive: true,
      sortOrder: 2,
    });

    const accessoriesCat = await Category.create({
      name: { en: 'General Accessories', ar: 'إكسسوارات عامة' },
      slug: 'accessories',
      parentCategory: null,
      image: CABLE_IMG,
      isActive: true,
      sortOrder: 3,
    });

    console.log('Categories seeded.');

    // 2. Seed Settings (Singleton)
    const settings = await Settings.create({
      siteName: { en: 'King-Store', ar: 'كينج ستور' },
      logo: 'K',
      contactEmail: 'support@kingstore.com',
      contactPhone: '+201012345678',
      address: {
        en: '123 Tech Street, Cairo, Egypt',
        ar: '١٢٣ شارع التكنولوجيا، القاهرة، مصر',
      },
      socialLinks: {
        facebook: 'https://facebook.com/kingstore',
        instagram: 'https://instagram.com/kingstore',
        twitter: 'https://twitter.com/kingstore',
        whatsapp: 'https://wa.me/201012345678',
      },
      paymentMethods: {
        cod: true,
        instapay: true,
        vodafoneCash: true,
        orangeCash: true,
        etisalatCash: true,
      },
      shippingRates: new Map([
        ['EG', 50],  // 50 EGP
        ['SA', 20],  // 20 SAR
        ['AE', 15],  // 15 AED
        ['US', 10],  // 10 USD
      ]),
      maintenanceMode: false,
    });

    console.log('Settings seeded.');

    // 3. Seed Users (Admin)
    const passwordHash = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@kingstore.com',
      phone: '+201000000000',
      passwordHash,
      role: 'admin',
      preferredLanguage: 'en',
      preferredTheme: 'dark',
      country: 'EG',
      isVerified: true,
    });

    console.log('Admin user seeded (admin@kingstore.com / admin123).');

    // 4. Seed Products
    const iphoneModels = [
      'iPhone 6', 'iPhone 6 Plus', 'iPhone 6s', 'iPhone 6s Plus', 'iPhone 7', 'iPhone 7 Plus',
      'iPhone 8', 'iPhone 8 Plus', 'iPhone X', 'iPhone XR', 'iPhone XS', 'iPhone XS Max',
      'iPhone 11', 'iPhone 11 Pro', 'iPhone 11 Pro Max', 'iPhone 12', 'iPhone 12 Mini',
      'iPhone 12 Pro', 'iPhone 12 Pro Max', 'iPhone 13', 'iPhone 13 Mini', 'iPhone 13 Pro',
      'iPhone 13 Pro Max', 'iPhone 14', 'iPhone 14 Plus', 'iPhone 14 Pro', 'iPhone 14 Pro Max',
      'iPhone 15', 'iPhone 15 Plus', 'iPhone 15 Pro', 'iPhone 15 Pro Max', 'iPhone 16',
      'iPhone 16 Plus', 'iPhone 16 Pro', 'iPhone 16 Pro Max', 'iPhone 17', 'iPhone 17 Plus',
      'iPhone 17 Pro', 'iPhone 17 Pro Max'
    ];

    const samsungModels = [
      'Samsung Galaxy S23', 'Samsung Galaxy S23+', 'Samsung Galaxy S23 FE', 'Samsung Galaxy S23 Ultra',
      'Samsung Galaxy S24', 'Samsung Galaxy S24+', 'Samsung Galaxy S24 FE', 'Samsung Galaxy S24 Ultra',
      'Samsung Galaxy S25', 'Samsung Galaxy S25+', 'Samsung Galaxy S25 Edge', 'Samsung Galaxy S25 Ultra',
      'Samsung Galaxy S26', 'Samsung Galaxy S26+', 'Samsung Galaxy S26 Edge', 'Samsung Galaxy S26 Ultra'
    ];

    const productsToSeed: any[] = [];

    // Helper to generate a slug
    const toSlug = (text: string) =>
      text
        .toLowerCase()
        .replace(/\+/g, '-plus')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    // iPhone Cases
    iphoneModels.forEach((model, index) => {
      const slug = toSlug(`${model} premium crystal case`);
      productsToSeed.push({
        name: {
          en: `${model} Premium Crystal Case`,
          ar: `كفر كريستال فاخر لـ ${model.replace('iPhone', 'آيفون')}`,
        },
        slug,
        description: {
          en: `Protect your ${model} with this premium crystal clear hybrid protective case. Features military grade drop protection, scratch resistance, and tactile buttons.`,
          ar: `احمِ جهازك ${model.replace('iPhone', 'آيفون')} مع هذا الكفر الشفاف الكريستالي الفاخر والمقاوم للصدمات والخدوش.`,
        },
        category: 'apple',
        brand: 'Spigen',
        model,
        images: [
          {
            url: CASE_IMG,
            alt: {
              en: `${model} case clear front`,
              ar: `كفر ${model.replace('iPhone', 'آيفون')} شفاف من الأمام`,
            },
          },
        ],
        pricing: {
          EG: 450 + (index * 20),
          SA: 45 + index,
          AE: 40 + index,
          US: 15 + (index * 0.5),
          default: 15 + (index * 0.5),
        },
        stock: 50 + (index * 2),
        isActive: true,
        isFeatured: index % 5 === 0,
        specs: new Map([
          ['Material', 'TPU + Polycarbonate'],
          ['Warranty', '1 Year'],
          ['Color', 'Clear'],
        ]),
        seo: {
          metaTitle: {
            en: `Buy ${model} Premium Crystal Case Online | King-Store`,
            ar: `اشتري كفر كريستال فاخر لـ ${model.replace('iPhone', 'آيفون')} | كينج ستور`,
          },
          metaDescription: {
            en: `Get the best protective crystal case for your ${model}. Shop high quality mobile cases at King-Store.`,
            ar: `احصل على أفضل كفر حماية كريستال لجهازك ${model.replace('iPhone', 'آيفون')}. تسوق الآن من كينج ستور.`,
          },
          keywords: [model, 'Case', 'Spigen', 'Crystal Case', 'Protective Case'],
        },
      });
    });

    // Samsung Cases
    samsungModels.forEach((model, index) => {
      const slug = toSlug(`${model} tough armor case`);
      productsToSeed.push({
        name: {
          en: `${model} Tough Armor Case`,
          ar: `كفر درع متين لـ ${model.replace('Samsung Galaxy', 'سامسونج جالكسي')}`,
        },
        slug,
        description: {
          en: `Heavy duty protection case for ${model}. Built with dual layer PC and TPU for shock absorption and drop protection. Includes built-in kickstand.`,
          ar: `كفر حماية فائق المتانة لـ ${model.replace('Samsung Galaxy', 'سامسونج جالكسي')}. مصمم من طبقتين لامتصاص الصدمات مع مسند مدمج.`,
        },
        category: 'samsung',
        brand: 'ESR',
        model,
        images: [
          {
            url: CASE_IMG,
            alt: {
              en: `${model} tough case`,
              ar: `كفر حماية متين لـ ${model.replace('Samsung Galaxy', 'سامسونج جالكسي')}`,
            },
          },
        ],
        pricing: {
          EG: 500 + (index * 20),
          SA: 50 + index,
          AE: 45 + index,
          US: 18 + (index * 0.5),
          default: 18 + (index * 0.5),
        },
        stock: 40 + (index * 3),
        isActive: true,
        isFeatured: index % 4 === 0,
        specs: new Map([
          ['Material', 'TPU + PC + Zinc Kickstand'],
          ['Warranty', '1 Year'],
          ['Color', 'Matte Black'],
        ]),
        seo: {
          metaTitle: {
            en: `Buy ${model} Tough Armor Case | King-Store`,
            ar: `اشتري كفر درع متين لـ ${model.replace('Samsung Galaxy', 'سامسونج جالكسي')} | كينج ستور`,
          },
          metaDescription: {
            en: `Tough and heavy duty protective armor case with kickstand for ${model}. Buy now at King-Store.`,
            ar: `كفر درع متين فائق الحماية مع مسند لجهاز ${model.replace('Samsung Galaxy', 'سامسونج جالكسي')}. اشترِ الآن من كينج ستور.`,
          },
          keywords: [model, 'Tough Case', 'Kickstand Case', 'Armor Case', 'ESR'],
        },
      });
    });

    // Seed generic accessories
    productsToSeed.push({
      name: {
        en: 'Anker 65W GaN Fast Charger',
        ar: 'شاحن أنكر 65 واط GaN سريع',
      },
      slug: 'anker-65w-gan-fast-charger',
      description: {
        en: 'Compact 3-port fast wall charger with PowerIQ 3.0 technology. Perfect for charging laptops, iPhones, and Galaxy devices at full speed.',
        ar: 'شاحن حائط سريع مدمج بـ ٣ منافذ مع تقنية PowerIQ 3.0. مثالي لشحن اللابتوب والآيفون وأجهزة الجالكسي بالسرعة القصوى.',
      },
      category: 'accessories',
      brand: 'Anker',
      model: 'Universal',
      images: [
        {
          url: CHARGER_IMG,
          alt: {
            en: 'Anker 65W GaN Charger Black',
            ar: 'شاحن أنكر 65 واط أسود',
          },
        },
      ],
      pricing: {
        EG: 999,
        SA: 99,
        AE: 89,
        US: 29.99,
        default: 29.99,
      },
      stock: 150,
      isActive: true,
      isFeatured: true,
      specs: new Map([
        ['Wattage', '65W'],
        ['Ports', '2x USB-C, 1x USB-A'],
        ['Warranty', '2 Years'],
      ]),
      seo: {
        metaTitle: {
          en: 'Anker 65W GaN Fast Charger | King-Store',
          ar: 'شاحن أنكر 65 واط سريع | كينج ستور',
        },
        metaDescription: {
          en: 'Charge all your devices faster with the Anker 65W GaN charger. Shop at King-Store.',
          ar: 'اشحن جميع أجهزتك بسرعة فائقة مع شاحن أنكر بقوة 65 واط. متوفر لدى كينج ستور.',
        },
        keywords: ['Charger', 'Anker', 'GaN', '65W', 'Fast Charger'],
      },
    });

    await Product.insertMany(productsToSeed);
    console.log(`Seeded ${productsToSeed.length} products.`);

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
