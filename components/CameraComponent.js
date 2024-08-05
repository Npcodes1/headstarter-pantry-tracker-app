import React, { useState, useRef } from "react";
import { Camera } from "react-camera-pro";
import { Box, Button } from "@mui/material";
import { ref, uploadString } from "firebase/storage";
// import { storage } from "./firebaseConfig";
import { v4 as uuidv4 } from "uuid"; // For unique image names

const CameraComponent = () => {
  const camera = useRef(null);
  const [numberOfCameras, setNumberOfCameras] = useState(0);
  const [image, setImage] = useState(null);
  const [isCameraVisible, setIsCameraVisible] = useState(false);

  const handleShowCamera = () => {
    setIsCameraVisible(true); // Show camera if not visible
  };

  const handleTakePhoto = async () => {
    if (camera.current) {
      const photo = camera.current.takePhoto();
      setImage(photo);
      setIsCameraVisible(false); // Hide camera after taking photo
      await uploadToFirebase(photo); // Upload photo to Firebase
    }
  };

  const uploadToFirebase = async (photo) => {
    const imageName = `${uuidv4()}.jpeg`; // Generate a unique name for the image
    const storageRef = ref(storage, `images/${imageName}`);

    try {
      await uploadString(storageRef, photo, "data_url");
      console.log("Uploaded a base64 string to Firebase!");
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <Box
      width="100%"
      height="150px"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      padding={2}
      sx={{ backgroundColor: "#ECDEC9", color: "#008080" }}
    >
      <Button
        sx={{
          width: "90%",
          backgroundColor: "#008080",
          color: "#ECDEC9",
          "&:hover": {
            backgroundColor: "#ECDEC9",
            color: "#008080",
          },
        }}
        variant="contained"
        onClick={handleShowCamera}
      >
        Show Camera
      </Button>
      {isCameraVisible && (
        <>
          <Camera
            ref={camera}
            numberOfCamerasCallback={setNumberOfCameras}
            sx={{
              width: "90%",
              marginTop: 2,
              backgroundColor: "#008080",
              color: "#ECDEC9",
              "&:hover": {
                backgroundColor: "#ECDEC9",
                color: "#008080",
              },
            }}
          />
          <Button
            sx={{
              width: "90%",
              backgroundColor: "#008080",
              color: "#ECDEC9",
              marginTop: 2,
              "&:hover": {
                backgroundColor: "#ECDEC9",
                color: "#008080",
              },
            }}
            variant="contained"
            onClick={handleTakePhoto}
          >
            Take Picture
          </Button>
        </>
      )}

      <button
        hidden={numberOfCameras <= 1}
        onClick={() => {
          camera.current.switchCamera();
        }}
      >
        Switch Camera
      </button>
    </Box>
  );
};

export default CameraComponent;
