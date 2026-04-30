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

## 2. 로그인 기능 흐름

로그인은 `버튼 클릭 → mutation 실행 → Supabase 로그인 → auth 상태 변경 → SessionProvider 감지 → 전역 session 갱신 → 보호 라우트 통과` 흐름입니다.

```text
사용자가 SignInPage에서 이메일/비밀번호 입력
→ 로그인 버튼 클릭
→ handleSignInWithPasswordClick 실행
→ useSignInWithPassword의 mutate 호출
→ TanStack Query mutationFn으로 signInWithPassword 실행
→ src/api/auth.ts의 supabase.auth.signInWithPassword(...) 호출

로그인 성공
→ Supabase 내부 세션 생성
→ Supabase Auth 상태가 바뀜
→ onAuthStateChange 구독 중이던 SessionProvider가 이 변화를 감지
→ setSession(session) 호출
→ Zustand store의 session 값이 null에서 실제 세션 객체로 바뀜
→ useSession()을 쓰는 MemberOnlyLayout 리렌더링
→ 이제 if (!session) 조건이 false가 됨
→ Navigate가 아니라 Outlet 렌더링
→ 회원 전용 페이지 접근 가능
```

실패 시:

```text
로그인 실패
→ mutation onError 실행
→ toast로 에러 출력
→ password 초기화
→ session 값은 그대로 null
→ MemberOnlyLayout은 계속 접근 차단
```

## 3. 회원가입 기능 흐름

회원가입도 mutation 기반이지만, 핵심은 `Auth 계정 생성`과 `앱 내부 profile row 생성`이 분리되어 있다는 점입니다.

```text
사용자가 SignUpPage에서 이메일/비밀번호 입력
→ 회원가입 버튼 클릭
→ useSignUp의 mutate 호출
→ supabase.auth.signUp(...) 실행
→ Supabase Auth 계정 생성

그 직후
→ 인증 상태가 유효해지면 SessionProvider가 감지
→ session store 갱신

하지만
→ profile 테이블 row는 회원가입 시점에 바로 만들지 않음
→ 나중에 useProfileData(session.user.id)가 호출될 때 profile 조회
→ 내 프로필인데 row가 없어서 PGRST116 에러 발생
→ useProfileData 내부에서 createProfile(userId) 자동 호출
→ 랜덤 닉네임으로 profile row 생성
→ 이후부터 프로필 정보 정상 사용 가능
```

즉 이 프로젝트는:

- `Auth 계정 생성`은 Supabase Auth
- `앱 사용자 프로필 생성`은 profile 테이블 첫 조회 시 보정

으로 나뉘어 있습니다.

## 4. 라우트 보호 흐름

이 부분은 세션 구독의 결과가 가장 눈에 띄게 보이는 곳입니다.

```text
사용자가 어떤 URL로 이동
→ root-route.tsx가 현재 경로에 맞는 Route 선택
→ 회원 전용 페이지면 MemberOnlyLayout 먼저 렌더링
→ MemberOnlyLayout 안에서 useSession() 호출
→ Zustand store의 session 값 구독

session이 null이면
→ if (!session) return <Navigate to="/sign-in" />
→ 로그인 페이지로 강제 이동

session이 있으면
→ return <Outlet />
→ 실제 페이지(IndexPage, PostDetailPage, ProfileDetailPage) 렌더링
```

비회원 전용 라우트는 반대로 동작합니다.

```text
GuestOnlyLayout 렌더링
→ useSession() 호출
→ session이 있으면 이미 로그인된 상태
→ / 로 리다이렉트
→ session이 없으면 sign-in, sign-up 페이지 허용
```