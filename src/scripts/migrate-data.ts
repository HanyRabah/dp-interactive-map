import { prisma } from '../src/lib/prisma';
import { ProjectsData, MAP_DATA } from '../src/data/ProjectsData';

async function migrateData() {
  try {
    // Migrate projects
    for (const feature of ProjectsData.features) {
      await prisma.project.create({
        data: {
          id: feature.properties.id,
          name: feature.properties.name,
          lat: feature.properties.lat,
          lng: feature.properties.lng,
          type: feature.geometry.type.toLowerCase(),
          description: feature.properties.description,
          hiddenAnchor: feature.properties.hiddenAnchor || false,
          noHover: feature.properties.noHover || false,
          image: feature.properties.image,
          url: feature.properties.url,
          details: feature.properties.details || {},
          style: feature.properties.style || {},
          coordinates: feature.geometry.coordinates
        }
      });
    }

    // Migrate map points
    for (const point of MAP_DATA) {
      await prisma.mapPoint.create({
        data: {
          id: point.id,
          name: point.name,
          lat: point.lat,
          lng: point.lng,
          zoom: point.zoom,
          showInList: point.showInList ?? true
        }
      });
    }

    console.log('Data migration completed successfully');
  } catch (error) {
    console.error('Error migrating data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateData();