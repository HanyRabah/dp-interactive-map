import { Project, ProjectDetails, ProjectPolygon, PolygonStyle } from '@prisma/client';

export type ProjectWithRelations = Project & {
  details?: ProjectDetails;
  polygons: (ProjectPolygon & {
    style?: PolygonStyle;
  })[];
};