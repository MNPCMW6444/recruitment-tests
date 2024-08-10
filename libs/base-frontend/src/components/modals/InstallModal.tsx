import { Modal, Box, Typography, Button } from '@mui/material';
import { TODO } from '@base-shared';

interface InstallModalProps {
  onInstallClicked: TODO;
  dismiss: () => void;
  PrimaryText?: TODO;
  Btn?: TODO;
}

export const InstallModal = ({
  onInstallClicked,
  dismiss,
  PrimaryText = Typography,
  Btn = Button,
}: InstallModalProps) => {
  return (
    <Modal open={true}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 300,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <PrimaryText variant="h6" sx={{ mb: 2 }}>
          Install App
        </PrimaryText>
        <PrimaryText sx={{ mb: 2 }} textAlign="center">
          Add this application to your home screen for a better experience.
        </PrimaryText>
        <Btn onClick={onInstallClicked} sx={{ fontSize: '115%' }}>
          Install
        </Btn>
        <br />
        <Btn onClick={dismiss} sx={{ fontSize: '50%' }} color="error">
          I'll do this later
        </Btn>
      </Box>
    </Modal>
  );
};
