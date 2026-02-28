import { Navigate, Route, Routes } from "react-router";
import SignInPage from "./pages/sign-in-page";
import SignUpPage from "./pages/sign-up-page";
import ForgetPasswordPage from "./pages/forget-password-page";
import IndexPage from "./pages/index-page";
import PostDetailPage from "./pages/post-detail-page";
import ProfileDetailPage from "./pages/profile-detail-page";
import ResetPasswordPage from "./pages/reset-password-page";
import GlobalLayout from "./components/layout/global-layout";

export default function RootRoute() {
  return (
    <Routes>
      <Route element={<GlobalLayout></GlobalLayout>}>
        <Route path="/sign-in" element={<SignInPage />}></Route>
        <Route path="/sign-up" element={<SignUpPage />}></Route>
        <Route path="/forget-password" element={<ForgetPasswordPage />}></Route>
        <Route path="/" element={<IndexPage />}></Route>
        <Route path="/post/:postId" element={<PostDetailPage />}></Route>
        <Route path="/profile/:userId" element={<ProfileDetailPage />}></Route>
        <Route path="/reset-password" element={<ResetPasswordPage />}></Route>
        <Route path="*" element={<Navigate to={"/"}></Navigate>}></Route>
      </Route>
    </Routes>
  );
}
