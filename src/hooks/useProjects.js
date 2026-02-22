import { useEffect } from 'react';
import { useProjects as useProjectContext } from '../contexts/ProjectContext';

export function useProjectList() {
  const ctx = useProjectContext();

  useEffect(() => {
    ctx.fetchProjects();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return ctx;
}

export function useProject(id) {
  const ctx = useProjectContext();

  useEffect(() => {
    if (id) ctx.fetchProject(id);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  return ctx;
}
