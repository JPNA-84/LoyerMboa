require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('../config/db');
const User = require('../models/User');
const Property = require('../models/Property');
const { Review } = require('../models/other');

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  // Clear existing
  await User.deleteMany({});
  await Property.deleteMany({});
  await Review.deleteMany({});

  // Create users
  const salt = await bcrypt.genSalt(12);
  const hash = (pw) => bcrypt.hash(pw, salt);

  const [admin, l1, l2, l3, t1, t2] = await User.insertMany([
    { fullname: 'Admin LoyerMboa', email: 'admin@loyermboa.cm', phone: '+237699000001', passwordHash: await hash('Admin@2024'), role: 'admin', isVerified: true },
    { fullname: 'Jean-Pierre Nkomo', email: 'jeanpierre@demo.cm', phone: '+237699123456', passwordHash: await hash('Pass@1234'), role: 'landlord', isVerified: true },
    { fullname: 'Marie Atangana', email: 'marie@demo.cm', phone: '+237677654321', passwordHash: await hash('Pass@1234'), role: 'landlord', isVerified: true },
    { fullname: 'Paul Essono', email: 'paul@demo.cm', phone: '+237655987654', passwordHash: await hash('Pass@1234'), role: 'landlord', isVerified: true },
    { fullname: 'Alice Mvogo', email: 'tenant@demo.cm', phone: '+237677000001', passwordHash: await hash('Pass@1234'), role: 'tenant', isVerified: true },
    { fullname: 'Robert Tchamba', email: 'robert@demo.cm', phone: '+237699000002', passwordHash: await hash('Pass@1234'), role: 'tenant', isVerified: true },
  ]);

  const properties = await Property.insertMany([
    { title: 'Appartement moderne 2 chambres', description: 'Bel appartement moderne au cœur de Bastos. Entièrement meublé, sécurisé, avec parking privé et groupe électrogène. Idéal pour professionnels.', propertyType: 'Appartement', rentPrice: 150000, quarter: 'Bastos', city: 'Yaoundé', bedrooms: 2, bathrooms: 1, furnished: true, amenities: ['Parking', 'Générateur', 'Sécurité 24h', 'WiFi'], latitude: 3.8664, longitude: 11.5134, landlord: l1._id, status: 'verified' },
    { title: 'Studio économique tout équipé', description: 'Studio fonctionnel et bien situé à Melen. Eau et électricité disponibles. Proche des universités et des transports.', propertyType: 'Studio', rentPrice: 80000, quarter: 'Melen', city: 'Yaoundé', bedrooms: 1, bathrooms: 1, furnished: true, amenities: ['WiFi', 'Eau chaude'], latitude: 3.8720, longitude: 11.5200, landlord: l2._id, status: 'verified' },
    { title: 'Villa 4 chambres avec jardin', description: 'Magnifique villa dans la résidence Santa Barbara. Grand jardin, parking pour 3 voitures, cuisine américaine, terrasse panoramique.', propertyType: 'Villa', rentPrice: 380000, quarter: 'Santa Barbara', city: 'Yaoundé', bedrooms: 4, bathrooms: 3, furnished: false, amenities: ['Jardin', 'Parking', 'Terrasse', 'Cuisine équipée'], latitude: 3.8600, longitude: 11.5080, landlord: l1._id, status: 'verified' },
    { title: 'Appartement 3 chambres climatisé', description: 'Grand appartement climatisé proche du stade Omnisport. Meublé avec goût, gardien 24h/24, eau chaude, salle de bain moderne.', propertyType: 'Appartement', rentPrice: 220000, quarter: 'Omnisport', city: 'Yaoundé', bedrooms: 3, bathrooms: 2, furnished: true, amenities: ['Climatisation', 'Gardien', 'Eau chaude', 'Parking'], latitude: 3.8580, longitude: 11.5230, landlord: l3._id, status: 'verified' },
    { title: 'Chambre meublée à partager', description: 'Chambre propre dans appartement partagé. Cuisine équipée commune, WiFi inclus, accès facile au marché de Mvog-Mbi.', propertyType: 'Chambre', rentPrice: 35000, quarter: 'Mvog-Mbi', city: 'Yaoundé', bedrooms: 1, bathrooms: 1, furnished: true, amenities: ['WiFi', 'Cuisine commune'], latitude: 3.8760, longitude: 11.5150, landlord: l2._id, status: 'verified' },
    { title: 'Duplex 5 pièces résidence fermée', description: 'Somptueux duplex en résidence sécurisée. Standing élevé, groupe électrogène, eau permanente, piscine commune, parking souterrain.', propertyType: 'Duplex', rentPrice: 450000, quarter: 'Bastos', city: 'Yaoundé', bedrooms: 5, bathrooms: 3, furnished: true, amenities: ['Piscine', 'Générateur', 'Parking souterrain', 'Sécurité 24h'], latitude: 3.8630, longitude: 11.5110, landlord: l3._id, status: 'verified' },
    { title: 'Appartement 2 chambres Nlongkak', description: 'Bel appartement non meublé dans le quartier calme de Nlongkak. Proche des marchés, bon accès routier, eau et électricité stables.', propertyType: 'Appartement', rentPrice: 130000, quarter: 'Nlongkak', city: 'Yaoundé', bedrooms: 2, bathrooms: 1, furnished: false, amenities: ['Eau stable', 'Lumière stable'], latitude: 3.8690, longitude: 11.5170, landlord: l1._id, status: 'verified' },
    { title: 'Studio neuf Biyem-Assi', description: 'Studio tout neuf dans immeuble récent à Biyem-Assi. Finitions modernes, ascenseur, interphone. Idéal pour étudiant.', propertyType: 'Studio', rentPrice: 65000, quarter: 'Biyem-Assi', city: 'Yaoundé', bedrooms: 1, bathrooms: 1, furnished: true, amenities: ['Ascenseur', 'Interphone', 'WiFi'], latitude: 3.8540, longitude: 11.5090, landlord: l2._id, status: 'pending' },
    { title: 'Appartement de luxe Akwa', description: 'Appartement haut standing au centre d\'Akwa, Douala. Vue sur le Wouri, sécurité maximale, tous services inclus.', propertyType: 'Appartement', rentPrice: 300000, quarter: 'Akwa', city: 'Douala', bedrooms: 3, bathrooms: 2, furnished: true, amenities: ['Vue fleuve', 'Sécurité', 'Climatisation', 'Parking'], latitude: 4.0500, longitude: 9.7000, landlord: l3._id, status: 'verified' },
  ]);

  await Review.insertMany([
    { property: properties[0]._id, tenant: t1._id, rating: 5, comment: 'Très bon appartement, propriétaire réactif. Je recommande vivement!' },
    { property: properties[0]._id, tenant: t2._id, rating: 4, comment: 'Logement conforme aux photos. Quartier calme et bien desservi.' },
    { property: properties[2]._id, tenant: t1._id, rating: 5, comment: 'Villa de rêve! Tout est parfait, le jardin est magnifique.' },
    { property: properties[1]._id, tenant: t2._id, rating: 4, comment: 'Bon rapport qualité-prix pour Yaoundé. Studio propre et bien situé.' },
    { property: properties[5]._id, tenant: t1._id, rating: 5, comment: 'Le meilleur duplex que j\'aie jamais loué. Standing exceptionnel!' },
  ]);

  console.log('✅ Database seeded successfully!');
  console.log('\n📧 Demo accounts:');
  console.log('   Tenant  → tenant@demo.cm  / Pass@1234');
  console.log('   Landlord→ jeanpierre@demo.cm / Pass@1234');
  console.log('   Admin   → admin@loyermboa.cm / Admin@2024\n');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
