// ─── 프로젝트 이용권 타입 ───
export const PLAN_TYPES = {
  FREE: 'free',
  PLAN_30: 'plan_30',
  PLAN_50: 'plan_50',
  PLAN_100: 'plan_100',
};

// ─── 플랜별 제한 ───
export const PLAN_LIMITS = {
  [PLAN_TYPES.FREE]: {
    label: 'Free (학습용)',
    price: 0,
    maxEvaluators: 1,
    smsQuota: 1,
    period: null, // 무제한
  },
  [PLAN_TYPES.PLAN_30]: {
    label: '30명',
    price: 30000,
    maxEvaluators: 30,
    smsQuota: 60,
    period: 30,
  },
  [PLAN_TYPES.PLAN_50]: {
    label: '50명',
    price: 40000,
    maxEvaluators: 50,
    smsQuota: 100,
    period: 30,
  },
  [PLAN_TYPES.PLAN_100]: {
    label: '100명',
    price: 50000,
    maxEvaluators: 100,
    smsQuota: 200,
    period: 30,
  },
};

// ─── 관리자 이메일 목록 ───
export const SUPER_ADMIN_EMAILS = [
  'aebon@kakao.com',
  'aebon@kyonggi.ac.kr',
  'ryuwebpd@gmail.com',
];
