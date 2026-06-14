import { Refine, Authenticated, CanAccess } from "@refinedev/core";
import { RefineThemes, ThemedLayoutV2, useNotificationProvider } from "@refinedev/antd";
import { dataProvider, liveProvider } from "@refinedev/supabase";
import routerBindings, {
  CatchAllNavigate,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router-v6";
import { BrowserRouter, Outlet, Route, Routes, Navigate } from "react-router-dom";
import { App as AntdApp, ConfigProvider } from "antd";
import heIL from "antd/locale/he_IL";
import "@refinedev/antd/dist/reset.css";

import { supabaseClient } from "./supabaseClient";
import { authProvider } from "./authProvider";
import { accessControlProvider } from "./accessControlProvider";
import { LoginPage } from "./pages/login";
import { ForgotPasswordPage } from "./pages/forgot-password";
import { ResetPasswordPage } from "./pages/reset-password";
import { SignupPage } from "./pages/signup";
import { DashboardPage } from "./pages/dashboard";
import { AdminUsersPage } from "./pages/admin/users";
import "./styles/index.css";

const App = () => (
  <BrowserRouter>
    <ConfigProvider direction="rtl" locale={heIL} theme={RefineThemes.Blue}>
      <AntdApp>
        <Refine
          dataProvider={dataProvider(supabaseClient)}
          liveProvider={liveProvider(supabaseClient)}
          authProvider={authProvider}
          accessControlProvider={accessControlProvider}
          routerProvider={routerBindings}
          notificationProvider={useNotificationProvider}
          resources={[
            {
              name: "dashboard",
              list: "/",
              meta: { label: "לוח בקרה" },
            },
            {
              name: "admin/users",
              list: "/admin/users",
              meta: { label: "ניהול משתמשים" },
            },
          ]}
          options={{ syncWithLocation: true, warnWhenUnsavedChanges: true, liveMode: "auto" }}
        >
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route
              element={
                <Authenticated key="authenticated" fallback={<CatchAllNavigate to="/login" />}>
                  <ThemedLayoutV2>
                    <Outlet />
                  </ThemedLayoutV2>
                </Authenticated>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route
                path="/admin/users"
                element={
                  <CanAccess resource="admin/users" action="list" fallback={<Navigate to="/" />}>
                    <AdminUsersPage />
                  </CanAccess>
                }
              />
            </Route>
          </Routes>
          <UnsavedChangesNotifier />
          <DocumentTitleHandler />
        </Refine>
      </AntdApp>
    </ConfigProvider>
  </BrowserRouter>
);

export default App;
