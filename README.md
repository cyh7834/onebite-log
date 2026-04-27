# 기능별 동작 흐름도

아래 내용은 이 프로젝트에서 구현된 주요 기능이 실제로 어떻게 동작하는지를, 상태 감지와 리렌더링 관점까지 포함해서 정리한 문서입니다.

## 1. 세션 전역 상태 관리 흐름

핵심은 `SessionProvider`가 Supabase 인증 상태 변화를 감지하고, 그 값을 Zustand store에 넣으면, `useSession()`을 쓰는 컴포넌트가 자동으로 다시 렌더링된다는 점입니다.

```text
앱 시작
→ App에서 SessionProvider가 가장 바깥에서 마운트됨
→ SessionProvider의 useEffect 실행
→ supabase.auth.onAuthStateChange(...) 등록
→ 이제 Supabase Auth 상태 변화를 계속 구독하는 상태가 됨

사용자가 로그인 / 로그아웃 / 세션 복구됨
→ Supabase가 onAuthStateChange 콜백 실행
→ 콜백 인자로 최신 session 전달
→ SessionProvider가 setSession(session) 호출
→ Zustand의 useSessionStore 내부 state.session 값 변경
→ state.isLoaded도 true로 변경

그다음
→ useSession()을 사용하는 모든 컴포넌트는
  useSessionStore((store) => store.session) 형태로 session만 구독 중
→ Zustand가 "session 값이 바뀌었다"고 감지
→ 그 값을 구독한 컴포넌트만 리렌더링
→ MemberOnlyLayout, GuestOnlyLayout, ProfileButton 등이 새 session 기준으로 다시 판단
```

즉, 내부의 `useSessionStore(selector)`가 Zustand store를 구독하고 있어서 자동 반응하는 구조입니다.