import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { PLAN_TYPES, SUPER_ADMIN_EMAILS } from '../lib/subscriptionPlans';

export const SubscriptionContext = createContext(null);

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();

  const [userPlans, setUserPlans] = useState([]);
  const [currentProjectPlan, setCurrentProjectPlan] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const isSuperAdmin = useMemo(
    () => !!user?.email && SUPER_ADMIN_EMAILS.includes(user.email),
    [user?.email],
  );

  // ─── 사용자의 전체 플랜 목록 조회 ───
  const fetchUserPlans = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase.rpc('get_user_plans', {
      p_user_id: user.id,
    }).then(
      (res) => res,
      () => ({ data: null }),
    );
    setUserPlans(data || []);
    setLoaded(true);
  }, [user?.id]);

  // ─── 프로젝트별 플랜 조회 ───
  const fetchProjectPlan = useCallback(async (projectId) => {
    if (!projectId) {
      setCurrentProjectPlan(null);
      return null;
    }
    const { data } = await supabase.rpc('get_project_plan', {
      p_project_id: projectId,
    }).then(
      (res) => res,
      () => ({ data: null }),
    );
    setCurrentProjectPlan(data || null);
    return data || null;
  }, []);

  // ─── 이용권 할당 ───
  const assignPlan = useCallback(async (planId, projectId) => {
    const { error } = await supabase.rpc('assign_plan_to_project', {
      p_plan_id: planId,
      p_project_id: projectId,
    }).then(
      (res) => res,
      (err) => ({ error: err }),
    );
    if (error) throw error;
    await fetchUserPlans();
    await fetchProjectPlan(projectId);
  }, [fetchUserPlans, fetchProjectPlan]);

  // ─── 평가자 추가 가능 여부 ───
  const canAddEvaluator = useCallback(
    (currentCount, projectPlan) => {
      if (isSuperAdmin) return true;
      const plan = projectPlan || currentProjectPlan;
      if (!plan) return false;
      return currentCount < plan.max_evaluators;
    },
    [currentProjectPlan, isSuperAdmin],
  );

  // ─── 미할당 이용권 목록 ───
  const getUnassignedPlans = useCallback(() => {
    return userPlans.filter(p => p.status === 'unassigned');
  }, [userPlans]);

  // ─── 무료 플랜 부여 ───
  const grantFreePlan = useCallback(async () => {
    if (!user?.id) return;
    await supabase.rpc('grant_free_plan', {
      p_user_id: user.id,
    }).then(null, () => {});
    await fetchUserPlans();
  }, [user?.id, fetchUserPlans]);

  // ─── 재조회 ───
  const refreshPlans = useCallback(async () => {
    await fetchUserPlans();
  }, [fetchUserPlans]);

  // 로그인 시 플랜 조회 + 무료 플랜 자동 부여
  useEffect(() => {
    if (user?.id) {
      fetchUserPlans().then(() => {
        // 무료 플랜 자동 부여는 fetchUserPlans 완료 후
        if (!isSuperAdmin) {
          supabase.rpc('grant_free_plan', {
            p_user_id: user.id,
          }).then(null, () => {});
        }
      });
    } else {
      setUserPlans([]);
      setCurrentProjectPlan(null);
      setLoaded(false);
    }
  }, [user?.id, fetchUserPlans, isSuperAdmin]);

  const value = useMemo(
    () => ({
      userPlans,
      currentProjectPlan,
      isSuperAdmin,
      loaded,
      fetchUserPlans,
      fetchProjectPlan,
      assignPlan,
      canAddEvaluator,
      getUnassignedPlans,
      grantFreePlan,
      refreshPlans,
    }),
    [userPlans, currentProjectPlan, isSuperAdmin, loaded, fetchUserPlans, fetchProjectPlan, assignPlan, canAddEvaluator, getUnassignedPlans, grantFreePlan, refreshPlans],
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}
