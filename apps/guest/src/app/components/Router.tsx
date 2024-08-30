import { lazy, Suspense, useContext } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Grid } from '@mui/material';
import { AuthContext, AuthPage } from '@base-frontend';
import FindPage from './pages/search/FindPage'; // Adjusted to use FindPage as the default route
import { UserType } from '@offisito-shared';
import {
  backgroundOffice,
  dayLogoTextOnly,
  nightLogoTextOnly,
  TopBar,
  Btn,
  CloseButton,
  PrimaryText,
} from '@offisito-frontend';

// Lazy load the ChatsPage component
const ChatsPage = lazy(
  () =>
    import(
      '../../../../../libs/base-frontend/src/components/pages/chats/ChatsPage'
    ),
);

const Router = () => {
  const { user } = useContext(AuthContext);

  return (
    <BrowserRouter>
      {user ? (
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
            bgcolor={(theme) => theme.palette.background.paper}
            wrap="nowrap"
            overflow="hidden"
          >
            <TopBar tenum={UserType} />
            <Grid item height="100%" overflow="scroll">
              <Routes>
                <Route path="/*" element={<FindPage />} /> {/* Default Route */}
                <Route
                  path="/chats"
                  element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <ChatsPage
                        tenum={{
                          guest: UserType.guest,
                          host: UserType.host,
                          admin: UserType.admin,
                        }} // Assuming guest is the user type
                        domain="server.offisito.com" // Replace with the actual domain or variable
                        customComponents={{ Btn, CloseButton, PrimaryText }} // Replace with actual components if needed
                      />
                    </Suspense>
                  }
                />
                {/* Other routes */}
              </Routes>
            </Grid>
          </Grid>
        </Grid>
      ) : (
        <AuthPage
          backgroundPicture={backgroundOffice}
          dayLogoTextOnly={dayLogoTextOnly}
          nightLogoTextOnly={nightLogoTextOnly}
          tenum={UserType}
          client={UserType.guest}
        />
      )}
    </BrowserRouter>
  );
};

export default Router;
