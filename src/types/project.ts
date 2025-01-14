import { Prisma } from '@prisma/client';

export type Project = Prisma.ProjectGetPayload<{
  include: { 
    details: true,
    polygon: {
      include: {
        style: true
      }
    }
    style: true
  }
}>


export interface Projects {
  projects: Project[];
}
export interface HoveredFeature {
  name: string;
  x: number;
  y: number;
  properties: {
    name: string;
    description?: string;
    [key: string]: any;
  };
}
