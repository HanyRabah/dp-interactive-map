import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default POI types
  const poiTypes = [
    {
      name: 'hospital',
      icon: 'hospital',
      color: '#FF4136'
    },
    {
      name: 'school',
      icon: 'school',
      color: '#4B9CD3'
    },
    {
      name: 'mosque',
      icon: 'mosque',
      color: '#2ECC40'
    },
    {
      name: 'store',
      icon: 'store',
      color: '#FF851B'
    },
    {
      name: 'park',
      icon: 'park',
      color: '#3D9970'
    },
    { 
      name: 'beach',
      icon: 'beach',
      color: '#FFDC00'
    },
    {
      name: 'landmark',
      icon: 'landmark',
      color: '#85144b'
    }
  ];

  for (const type of poiTypes) {
    await prisma.pOIType.upsert({
      where: { name: type.name },
      update: {},
      create: type
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });