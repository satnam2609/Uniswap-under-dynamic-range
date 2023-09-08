import * as React from "react";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import LiquidityForm from "./LiquidityForm";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",

  bgcolor: "background.paper",
  border: "1px solid #008080",
  boxShadow: 24,
  p: 4,
  borderRadius: "14px",
  width: "45vw",
  height: "70vh",
  backgroundColor: "rgb(24 24 27)",
};

export default function ModalForm({ pair, toggle, open, setOpen }) {
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <button className="text-xl text-white" onClick={handleOpen}>
        Add Liqudiity
      </button>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={open}>
          <Box sx={style}>
            <LiquidityForm pair={pair} toggle={toggle} />
          </Box>
        </Fade>
      </Modal>
    </div>
  );
}
