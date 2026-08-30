import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ProjectRow, Tables } from '../types';

type ProjectWithStats = ProjectRow & {
  member_count: number;
  total_bugs: number;
  open_bugs: number;
  critical_bugs: number;
  resolved_bugs: number;
  health: number;
};

export function useProjects(companyId: string | null) {
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!companyId) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Fetch stats for each project
      const projectsWithStats: ProjectWithStats[] = await Promise.all(
        (data || []).map(async (project) => {
          const [membersRes, bugsRes] = await Promise.all([
            supabase
              .from('project_members')
              .select('profile_id', { count: 'exact', head: true })
              .eq('project_id', project.id),
            supabase
              .from('bugs')
              .select('status, priority')
              .eq('project_id', project.id)
              .eq('is_archived', false),
          ]);

          const bugs = bugsRes.data || [];
          const openBugs = bugs.filter(b => !['resolved', 'closed'].includes(b.status));
          const resolvedBugs = bugs.filter(b => ['resolved', 'closed'].includes(b.status));
          const criticalBugs = openBugs.filter(b => b.priority === 'critical');

          // Simple health score
          const total = bugs.length;
          const health = total === 0 ? 100 : Math.max(0, Math.min(100,
            100 - ((criticalBugs.length * 20 + openBugs.length * 5) / total)
          ));

          return {
            ...project,
            member_count: membersRes.count || 0,
            total_bugs: bugs.length,
            open_bugs: openBugs.length,
            critical_bugs: criticalBugs.length,
            resolved_bugs: resolvedBugs.length,
            health,
          };
        })
      );

      setProjects(projectsWithStats);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (project: Omit<ProjectRow, 'id' | 'created_at' | 'updated_at' | 'is_archived' | 'archived_at'>) => {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();

    if (error) return { error: error.message };
    await fetchProjects();
    return { data, error: null };
  };

  const updateProject = async (id: string, updates: Partial<ProjectRow>) => {
    const { error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id);

    if (error) return { error: error.message };
    await fetchProjects();
    return { error: null };
  };

  const archiveProject = async (id: string) => {
    const { error } = await supabase
      .from('projects')
      .update({ is_archived: true, archived_at: new Date().toISOString() })
      .eq('id', id);

    if (error) return { error: error.message };
    await fetchProjects();
    return { error: null };
  };

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    createProject,
    updateProject,
    archiveProject,
  };
}
