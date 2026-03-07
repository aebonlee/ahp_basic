# 세션 34 개발일지 — AI 분석도구 메뉴 확장 (4개 서브 도구)

**날짜:** 2026-03-07

---

## 변경 사항

### 1. aiPromptTemplates.js 확장
- **파일:** `src/lib/aiPromptTemplates.js`
- `AI_TOOL_TEMPLATES` 추가 — 4개 도구별 템플릿 배열 맵
  - chatbot: 기존 6개 템플릿 그대로 참조
  - paperDraft: 서론/연구방법/결과/결론 초안 4개 템플릿
  - reference: AHP 문헌 추천/APA 변환/선행연구 검토/인용 문장 4개 템플릿
  - researchEval: 논문 검토/문체 개선/연구방법 적절성/종합 조언 4개 템플릿
- `AI_SYSTEM_PROMPTS` 추가 — 도구별 시스템 프롬프트
- 기존 `AI_PROMPT_TEMPLATES`/`SYSTEM_PROMPT_BASE`는 하위 호환 유지

### 2. useAiChat.js 커스텀 훅 (신규)
- **파일:** `src/hooks/useAiChat.js`
- 기존 AiAnalysisPage의 채팅 로직을 재사용 가능한 훅으로 추출
- state: provider, showKeyModal, messages, input, streaming, error
- handlers: handleSend (스트리밍), handleKeyDown, handleTemplateClick

### 3. AiChatLayout.jsx 공유 컴포넌트 (신규)
- **파일:** `src/components/ai/tools/AiChatLayout.jsx`
- 4개 도구가 공유하는 채팅 UI 컴포넌트
- Props: projectId, toolTitle, onBack, templates, systemPromptBase, placeholder, requireData
- 내부에서 useAhpContext + useAiChat 사용
- requireData=false인 도구는 AHP 데이터 없이도 사용 가능

### 4. 4개 도구 래퍼 컴포넌트 (신규)
- `src/components/ai/tools/AiChatbotTool.jsx` — 기존 AI 분석 챗봇
- `src/components/ai/tools/AiPaperDraftTool.jsx` — 논문 초안 생성
- `src/components/ai/tools/AiReferenceTool.jsx` — 참고문헌 관리 (requireData=false)
- `src/components/ai/tools/AiResearchEvalTool.jsx` — 연구 평가/조언 (requireData=false)

### 5. AiAnalysisPage.jsx 재작성
- **파일:** `src/pages/AiAnalysisPage.jsx`
- 단일 챗봇 → 카드 그리드 선택 + ?type 기반 서브도구 라우팅
- AI_TOOL_CARDS 4개 카드 정의
- ?type 없으면 카드 그리드, 있으면 해당 도구 렌더링

### 6. AiAnalysisPage.module.css 스타일 추가
- **파일:** `src/pages/AiAnalysisPage.module.css`
- toolGrid: 2열 카드 그리드 (모바일 1열)
- toolCard: 호버 효과, 그림자
- toolHeader/backBtn/toolTitle: 도구 헤더 + 뒤로가기 버튼

### 7. ProjectSidebar.jsx AI 서브메뉴 추가
- **파일:** `src/components/layout/ProjectSidebar.jsx`
- AI_SUBS 배열 추가 (4개 서브메뉴 항목)
- aiOpen/isOnAi 상태 관리
- STAT_SUBS 패턴과 동일한 확장/접힘 서브메뉴 렌더링

---

## 아키텍처

```
AiAnalysisPage.jsx (컨테이너)
  ├─ ?type 없음 → 카드 그리드 (4개 도구 선택)
  ├─ ?type=chatbot      → AiChatbotTool → AiChatLayout
  ├─ ?type=paperDraft   → AiPaperDraftTool → AiChatLayout
  ├─ ?type=reference    → AiReferenceTool → AiChatLayout
  └─ ?type=researchEval → AiResearchEvalTool → AiChatLayout
```

---

## 목적
- 11번 통계 메뉴 패턴을 따라 AI 분석도구를 4개 서브도구로 확장
- 공통 채팅 로직(useAiChat)과 UI(AiChatLayout)를 추출하여 중복 제거
- 논문 작성 지원 기능 추가 (초안 생성, 참고문헌, 연구 평가)
