import { lazy, Suspense, useContext } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import {
  AuthContext,
  AuthPage,
  ChatContextProvider,
  NotificationsPage,
  NavBar,
  Img,
} from '@base-frontend';
import SummeryPage from './pages/summery/SummeryPage';
import { Grid } from '@mui/material';
import Dashboard from './pages/dashboard/Dashboard';
import New from './pages/new/New';
import { BookingsContextProvider } from '../context/BookingsContext';
import WizardPage from './pages/wizard/WizaedPage';
import {
  backgroundOffice,
  Btn,
  CloseButton,
  dashboard,
  dayLogoTextOnly,
  ListingsContextProvider,
  MainMessage,
  messages,
  nightLogoTextOnly,
  person,
  PrimaryText,
  SettingPage,
  timeline,
  TopBar,
} from '@offisito-frontend';
import { UserType } from '@offisito-shared';

// Lazy load the ChatsPage component
const ChatsPage = lazy(
  () =>
    import(
      '../../../../../libs/base-frontend/src/components/pages/chats/ChatsPage'
    ),
);

const routes = [
  { name: 'Summery', route: 'summery' },
  { name: 'Wizard', route: 'wizard' },
  { name: 'Dashboard', route: 'dashboard' },
  { name: 'New', route: 'new' },
  {
    name: 'Chats',
    route: 'chats',
  },
  { name: 'Settings', route: 'settings' },
  { name: 'Logout', route: 'logout' },
];

const Router = () => {
  const { user } = useContext(AuthContext);

  return (
    <BrowserRouter>
      {user ? (
        <ChatContextProvider
          domain="server.offisito.com"
          MainMessage={MainMessage}
        >
          <Grid
            width="100%"
            height="100%"
            container
            justifyContent="center"
            bgcolor={(theme) => theme.palette.background.default}
            wrap="nowrap"
          >
            <Grid
              item
              height="100%"
              width="1000px"
              container
              direction="column"
              bgcolor={(theme) => theme.palette.background.default}
              wrap="nowrap"
              overflow="hidden"
            >
              <Grid item>
                <TopBar tenum={UserType} routes={routes} />
              </Grid>
              <Grid item height="calc(100% - 90px)" overflow="scroll">
                <Routes>
                  <Route
                    path="/*"
                    element={
                      <BookingsContextProvider>
                        <SummeryPage />
                      </BookingsContextProvider>
                    }
                  />
                  <Route
                    path="/new"
                    element={
                      <ListingsContextProvider domain="server.offisito.com">
                        <BookingsContextProvider>
                          <New />
                        </BookingsContextProvider>
                      </ListingsContextProvider>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ListingsContextProvider domain="server.offisito.com">
                        <BookingsContextProvider>
                          <Dashboard />
                        </BookingsContextProvider>
                      </ListingsContextProvider>
                    }
                  />
                  <Route
                    path="/wizard"
                    element={
                      <ListingsContextProvider domain="server.offisito.com">
                        <BookingsContextProvider>
                          <WizardPage />
                        </BookingsContextProvider>
                      </ListingsContextProvider>
                    }
                  />
                  <Route
                    path="/chats"
                    element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <ChatsPage
                          tenum={{
                            guest: UserType.guest,
                            host: UserType.host,
                            admin: UserType.admin,
                          }} // Assuming host is the user type
                          domain="server.offisito.com"
                          customComponents={{ Btn, CloseButton, PrimaryText }}
                        />
                      </Suspense>
                    }
                  />
                  <Route path="/settings" element={<SettingPage />} />
                  <Route
                    path="/notifications"
                    element={<NotificationsPage />}
                  />
                </Routes>
              </Grid>
              <NavBar
                buttons={[
                  { navPath: '/summery', iconSrc: dashboard },
                  { navPath: '/dashboard', iconSrc: timeline },
                  {
                    navPath: '/chats',
                    iconSrc: messages,
                  },
                  { navPath: '/settings', iconSrc: person },
                ]}
              />
            </Grid>
          </Grid>
        </ChatContextProvider>
      ) : (
        <AuthPage
          backgroundPicture={backgroundOffice}
          dayLogoTextOnly={dayLogoTextOnly}
          nightLogoTextOnly={nightLogoTextOnly}
          tenum={UserType}
          client={UserType.host}
          customComponents={{
            Btn,
            PrimaryText,
            Img,
          }}
        />
      )}
    </BrowserRouter>
  );
};

export default Router;
