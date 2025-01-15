// hooks/useProjects.ts
import { ProjectFormData } from "@/components/DrawMap";

// update map data
const useProjects = () => {
  const url = '/api/projects';
    
  const fetchProjects = async () => {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch projects (${response.status})`);
      }
      const data = await response.json();
      return await data;

    } catch (err) {
      console.error('Fetch error:', err);
    }
  }

  const createProject = async (project: ProjectFormData) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(project),
      });

      
      if (!response.ok) {
        throw new Error(`Failed to create project (${response.status})`);
      }
      return await response.json();

    } catch (err) {
      console.error('Create error:', err);
    }
  }

  const updateProject =   async (id: string, updates: ProjectFormData) => {
       try {
        const response = await fetch(`${url}/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });
        return await response.json();
      
      } catch (err) {
        console.error('Update error:', err);
      }
    }

  const deleteProject = async (id: string) => {
    if (!id) {
      throw new Error("No project ID provided");
    }
      try {
        const response = await fetch(`${url}/${id}`, {
          method: 'DELETE',
          headers: {
            "Content-Type": "application/json",
          },
        });
  
        if (!response.ok) {
          throw new Error(`Failed to delete project (${response.status})`);
        }
        return await response.json();
      } catch (err) {
        console.error('Delete error:', err);
      }
    }

    return { fetchProjects ,createProject, updateProject, deleteProject }

}
export default useProjects;