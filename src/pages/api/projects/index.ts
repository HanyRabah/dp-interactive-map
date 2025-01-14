// api/projects/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { APIError } from '@/lib/api-utils';
 
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'POST':
        return await handleCreate(req, res);
      case 'GET':
        return await handleList(req, res);
      default:
        throw new APIError(405, `Method ${req.method} not allowed`);
    }
  } catch (error) {
    console.error('Error in /api/projects:', error);
    if (error instanceof APIError) {
      return res.status(error.statusCode).json({
        error: error.message,
        details: error.details
      });
    }
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function handleCreate(req: NextApiRequest, res: NextApiResponse) {
  if (!req.body) {
    return res.status(400).json({ 
      error: 'Request body is missing' 
    });
  }
  console.log('===================req.body=======================' + JSON.stringify(req.body));
  try {
    const { polygons } = req.body;
    console.log("🚀 ~ handleCreate ~ polygons:", polygons)
    const result = await prisma.$transaction(async (prisma) => {
      // First create the project
      const project = await prisma.project.create({
        data: {
          id: req.body.id,
          name: req.body.name,
          description: req.body.description,
          lat: req.body.lat,
          lng: req.body.lng,
          zoom: req.body.zoom,
          hideMarker: req.body.hideMarker
        }
      });

      console.log('==================project========================' + JSON.stringify(project));
      // Then create polygons with their styles
      if (polygons && polygons.length > 0) {
        for (const polygonData of polygons) {
          // Create the polygon first
          const polygon = await prisma.projectPolygon.create({
            data: {
              id: polygonData.id,
              name: polygonData.name,
              type: polygonData.type,
              coordinates: polygonData.coordinates,
              description: polygonData.description || '',
              projectId: project.id,
            }
          });

          console.log('=======================polygon===================' + JSON.stringify(polygon));
          // Handle popup details (if provided)
          if (polygonData.popupDetails) {
            const popupDetail = await prisma.popupDetails.create({
              data: {
                title: polygonData.popupDetails.title || '',
                image: polygonData.popupDetails.image || '',
                description: polygonData.popupDetails.description || '',
                link: polygonData.popupDetails.link || '',
                type: polygonData.popupDetails.type || 'details',
                ProjectPolygon: {
                  connect: { id: polygon.id }
                }
              }
            });
            console.log('=================popupDetail=========================' + popupDetail);

            // Connect popup details to polygon
            await prisma.projectPolygon.update({
              where: { id: polygon.id },
              data: {
                popupDetailsId: popupDetail.id
              }
            });
          }

          // Handle style (if provided)
          if (polygonData.style) {
            await prisma.polygonStyle.create({
              data: {
                fillColor: polygonData.style.fillColor,
                hoverFillColor: polygonData.style.hoverFillColor,
                fillOpacity: polygonData.style.fillOpacity,
                hoverFillOpacity: polygonData.style.hoverFillOpacity,
                lineColor: polygonData.style.lineColor,
                lineWidth: polygonData.style.lineWidth || 1,
                lineOpacity: polygonData.style.lineOpacity || 1,
                lineDashArray: polygonData.style.lineDashArray,
                polygonId: polygon.id,
              }
            });
          }
        }
      }

      // Fetch the complete project with all relations
      const completeProject = await prisma.project.findUnique({
        where: { id: project.id },
        include: {
          polygons: {
            include: {
              style: true,
              popupDetails: true
            }
          }
        }
      });

      return completeProject;
    });

    return res.status(201).json({
      message: 'Project created successfully',
      project: result
    });

  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({
      error: 'Failed to create project',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// async function handleCreate(req: NextApiRequest, res: NextApiResponse) {
//   if (!req.body) {
//     return res.status(400).json({ 
//       error: 'Request body is missing' 
//     });
//   }

//   try {
//     // First create the project
//     const project = await prisma.project.create({
//       data: {
//         id: req.body.id,
//         name: req.body.name,
//         description: req.body.description,
//         lat: req.body.lat,
//         lng: req.body.lng,
//         zoom: req.body.zoom,
//         hideMarker: req.body.hideMarker
//       }
//     });

//     // Then create polygons with their styles
//     if (req.body.polygons && req.body.polygons.length > 0) {
//       for (const polygonData of req.body.polygons) {
//         // Create the polygon first
//         const polygon = await prisma.projectPolygon.create({
//           data: {
//             id: polygonData.id,
//             name: polygonData.name,
//             type: polygonData.type,
//             coordinates: polygonData.coordinates,
//             description: polygonData.description,
//             projectId: project.id,
//             popupDetailsId: null,
//           }
//         });

//         // Handle popup details
//         if(polygonData.popupDetails) {
//           const popupDetail = await prisma.popupDetails.create({
//             data: {
//               title: polygonData.popupDetails.title || '',
//               image: polygonData.popupDetails.image || '',
//               description: polygonData.popupDetails.description || '',
//               link: polygonData.popupDetails.link || '',
//               type: polygonData.popupDetails.type || 'details',
//               ProjectPolygon: {
//                 connect: { id: polygon.id }
//               }
//             }
//           });

//           // Connect popup details to polygon
//           await prisma.projectPolygon.update({
//             where: { id: polygon.id },
//             data: {
//               popupDetailsId: popupDetail.id
//             }
//           });
//         }

//         // Handle style
//         if (polygonData.style) {
//           await prisma.polygonStyle.create({
//             data: {
//               fillColor: polygonData.style.fillColor,
//               hoverFillColor: polygonData.style.hoverFillColor,
//               fillOpacity: polygonData.style.fillOpacity,
//               hoverFillOpacity: polygonData.style.hoverFillOpacity,
//               lineColor: polygonData.style.lineColor,
//               lineWidth: polygonData.style.lineWidth || 1,
//               lineOpacity: polygonData.style.lineOpacity || 1,
//               lineDashArray: polygonData.style.lineDashArray,
//               polygonId: polygon.id,
//             }
//           });
//         }
//       }
//     }

//     // Fetch the complete project with all relations
//     const completeProject = await prisma.project.findUnique({
//       where: { id: project.id },
//       include: {
//         polygons: {
//           include: {
//             style: true,
//             popupDetails: true
//           }
//         }
//       }
//     });

//     return res.status(201).json({
//       message: 'Project created successfully',
//       project: completeProject
//     });

//   } catch (error) {
//     console.error('Error creating project:', error);
//     return res.status(500).json({
//       error: 'Failed to create project',
//       details: error instanceof Error ? error.message : 'Unknown error'
//     });
//   }
// }

async function handleList(req: NextApiRequest, res: NextApiResponse) {
  const projects = await prisma.project.findMany({
    include: {
      details: true,
      polygons: {
        include: {
          style: true,
          popupDetails: true,
        }
      }
    }
  });

  return res.status(200).json(projects);
}