"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import {
  AppBar,
  Box,
  Modal,
  Typography,
  Stack,
  TextField,
  Button,
  Toolbar,
  IconButton,
  InputBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faMinus,
  faPenToSquare,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import SearchIcon from "@mui/icons-material/Search";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  getDoc,
  setDoc,
} from "firebase/firestore";

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
}));

//Search feature
//Search Icon
const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(0),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

export default function Home() {
  //set variable to search for inventory items
  const [findItem, setFindItem] = useState("");

  // set variable for storing inventory
  const [inventory, setInventory] = useState([]);

  //set variable for opening -default value is false
  const [open, setOpen] = useState(false);

  //set variable for the item name- default value is an empty string so it's empty when a item name is captured.
  const [itemName, setItemName] = useState("");

  //set variable for the item quantity- default value is an 0.
  const [itemQuantity, setItemQuantity] = useState();

  //set variable to edit pantry items
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  //set variable for updating inventory from firebase (want to make this async because firebase will block code while fetching
  const updateInventory = async () => {
    //Get the snapshot of the collection by getting a query
    const snapshot = query(collection(firestore, "inventory"));
    //Now get our documents
    const docs = await getDocs(snapshot);
    //Get inventory list
    const inventoryList = [];
    //For every doc, we want to add it to our inventory list and then push a new object (doc)
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });

    // Set inventory to inventory list
    setInventory(inventoryList);
    // console.log(inventoryList);
  };

  //To add new item
  const addNewItem = async (name) => {
    try {
      const docRef = doc(collection(firestore, "inventory"), name);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await setDoc(
          docRef,
          { quantity: quantity + parseInt(itemQuantity, 10) },
          { merge: true }
        );
      } else {
        await setDoc(docRef, { quantity: parseInt(itemQuantity, 10) });
      }
      await updateInventory();
    } catch (error) {
      console.error("There was an error adding the new item: ", error);
    }
  };

  //To add 1 to item
  const addItem = async (name) => {
    const docRef = doc(collection(firestore, "inventory"), name);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  //to edit items
  const editItem = async (name, quantity) => {
    const docRef = doc(collection(firestore, "inventory"), name);

    try {
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Update document with the new fields
        await setDoc(docRef, { quantity }, { merge: true });
        await updateInventory();
        alert("Item updated successfully");
      } else {
        console.error("Item does not exist in inventory");
      }
    } catch (error) {
      console.error("There was an error editing item: ", error);
    }
  };

  //To remove item quantity
  const removeItemQuantity = async (name) => {
    const docRef = doc(collection(firestore, "inventory"), name);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      //if 1st statement true, check if 2nd statement also true
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  //to remove item
  const removeOverallItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);

    try {
      //fetch the current document
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        //delete document
        await deleteDoc(docRef);
        alert("Item successfully deleted.");
      } else {
        alert("Item does not exist.");
      }

      await updateInventory();
    } catch (error) {
      console.error("Error deleting item: ", error);
    }
  };

  //useEffect -run codes and updates whenever something in the dependency array changes. Leave empty to update when the page loads
  useEffect(() => {
    updateInventory();
  }, []);

  //Function to handle opening the model
  const handleOpen = () => setOpen(true);

  //Function to handle closing the model
  const handleClose = () => {
    setItemName("");
    setItemQuantity("");
    setOpen(false);
  };

  const handleEditClick = (itemName, itemQuantity) => {
    setItemName(itemName);
    setItemQuantity(parseInt(itemQuantity));
    setEditDialogOpen(true);
  };

  const handleEditSave = () => {
    editItem(itemName, itemQuantity);
    setEditDialogOpen(false);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed" sx={{ backgroundColor: "#008080" }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2 }}
          />
          <Typography
            variant="h5"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              display: { xs: "none", sm: "block" },
              color: "#ECDEC9",
            }}
          >
            StockSnap
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap={2}
        sx={{
          backgroundColor: "#008080",
          padding: { xs: 2, sm: 4 },
        }}
      >
        <Box
          sx={{
            width: "100vw",
            height: "100vh",
            backgroundImage: `url(https://cdn.pixabay.com/photo/2023/10/05/11/20/jar-8295653_1280.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: { xs: 1, sm: 2 },
          }}
        >
          <Box
            sx={{
              backgroundColor: "#ECDEC9",
              textAlign: "center",
              color: "#008080",
              maxWidth: { xs: "90%", sm: "80%", md: "60%" },
              padding: { xs: 1, sm: 2 },
            }}
          >
            <Typography
              variant="h3"
              paddingTop={3}
              fontSize={{ xs: "2rem", sm: "3rem" }}
              sx={{ width: "100%", textAlign: "center" }}
            >
              StockSnap
            </Typography>
            <Typography
              variant="body1"
              width="100%"
              padding={2}
              textAlign="center"
              fontSize={{ xs: "0.9rem", sm: "1rem" }}
            >
              An Inventory Management System designed to help efficiently
              capture and track pantry items
            </Typography>

            <Modal open={open} onClose={handleClose}>
              {/* center box on screen */}
              <Box
                position="absolute"
                top="50%"
                left="50%"
                width={{ xs: "90%", sm: 400 }}
                bgcolor="#fff"
                border="2px solid #000"
                boxShadow={24}
                p={3}
                display="flex"
                flexDirection="column"
                gap={2}
                sx={{
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Typography
                  variant="h6"
                  fontSize={{ xs: "1rem", sm: "1.25rem" }}
                >
                  Add Item
                </Typography>

                {/* To display the box in stacking form */}
                <Stack width="100%" direction="row" spacing={2}>
                  <TextField
                    variant="outlined"
                    placeholder="Item Name..."
                    fullWidth
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    size="small"
                  />

                  <TextField
                    variant="outlined"
                    placeholder="Quantity..."
                    fullWidth
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(e.target.value)}
                    size="small"
                  />

                  <Button
                    variant="outlined"
                    sx={{
                      backgroundColor: "#008080",
                      color: "#ECDEC9",
                      "&:hover": {
                        backgroundColor: "#ECDEC9",
                        color: "#008080",
                      },
                    }}
                    onClick={() => {
                      addNewItem(itemName, itemQuantity);
                      setItemName("");
                      setItemQuantity("");
                      handleClose();
                    }}
                  >
                    Add
                  </Button>
                </Stack>
              </Box>
            </Modal>
          </Box>
        </Box>

        <Box
          border="1px solid #333"
          sx={{
            width: "100%",
            maxWidth: 800,
            margin: "auto",
            borderRadius: 1,
          }}
        >
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
            <Typography
              variant="h5"
              color="#008080"
              paddingBottom={2}
              fontSize={{ xs: "1.5rem", sm: "2rem" }}
              textAlign={"center"}
            >
              Inventory Items
            </Typography>
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
              onClick={() => handleOpen()}
            >
              Add New Item
            </Button>
          </Box>
          <Box width="100%" sx={{ padding: 0, margin: 0 }}>
            <Search
              sx={{
                backgroundColor: "#f0f0f0",
                borderTop: "2px solid #000",
                borderBottom: "2px solid #000",
                color: "#008080",
                padding: 1,
                width: "100%",
                "&:hover": {
                  backgroundColor: "008080",
                  color: "#ECDEC9",
                },
              }}
            >
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ "aria-label": "search" }}
                value={findItem}
                onChange={(e) => setFindItem(e.target.value)}
              />
            </Search>
          </Box>

          <Stack
            width="100%"
            maxWidth="800px"
            height="300px"
            overflow="auto"
            spacing={2}
          >
            {inventory
              .filter((item) =>
                item.name.toLowerCase().includes(findItem.toLowerCase())
              )
              .map(({ name, quantity }) => (
                <Box
                  key={name}
                  width="100%"
                  minHeight="150px"
                  display="flex"
                  flexDirection={{ xs: "column", sm: "row" }}
                  alignItems="center"
                  justifyContent="space-between"
                  bgcolor="#f0f0f0"
                  padding={2}
                  borderRadius={1}
                >
                  <Box flexBasis="50%" textAlign="center">
                    <Typography
                      variant="h6"
                      color="#333"
                      fontSize={{ xs: "1.25rem", sm: "1.5rem" }}
                    >
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Typography>
                  </Box>
                  <Box flexBasis="50%">
                    <Typography
                      variant="h6"
                      color="#333"
                      fontSize={{ xs: "1.25rem", sm: "1.5rem" }}
                    >
                      {quantity}
                    </Typography>
                  </Box>

                  <Box display="flex" flexDirection="row" gap={1} mt={1}>
                    <Box paddingRight={3}>
                      <Button
                        sx={{
                          backgroundColor: "#008080",
                          color: "#ECDEC9",
                          "&:hover": {
                            backgroundColor: "#ECDEC9",
                            color: "#008080",
                          },
                        }}
                        variant="contained"
                        onClick={() => addItem(name)}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </Button>
                    </Box>
                    <Box paddingRight={3}>
                      <Button
                        sx={{
                          backgroundColor: "#008080",
                          color: "#ECDEC9",
                          "&:hover": {
                            backgroundColor: "#ECDEC9",
                            color: "#008080",
                          },
                        }}
                        variant="contained"
                        onClick={() => {
                          handleEditClick(name, quantity);
                        }}
                      >
                        <FontAwesomeIcon icon={faPenToSquare} />
                      </Button>
                    </Box>
                    <Box paddingRight={3}>
                      <Button
                        sx={{
                          backgroundColor: "#008080",
                          color: "#ECDEC9",
                          "&:hover": {
                            backgroundColor: "#ECDEC9",
                            color: "#008080",
                          },
                        }}
                        variant="contained"
                        onClick={() => {
                          removeItemQuantity(name);
                        }}
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </Button>
                    </Box>
                    <Box>
                      <Button
                        sx={{
                          backgroundColor: "#008080",
                          color: "#ECDEC9",
                          "&:hover": {
                            backgroundColor: "#ECDEC9",
                            color: "#008080",
                          },
                        }}
                        variant="contained"
                        onClick={() => {
                          removeOverallItem(name);
                        }}
                      >
                        <FontAwesomeIcon icon={faTrashCan} />
                      </Button>
                    </Box>
                    <Dialog
                      open={editDialogOpen}
                      onClose={() => setEditDialogOpen(false)}
                    >
                      <DialogTitle>Edit Item</DialogTitle>
                      <DialogContent>
                        <TextField
                          margin="dense"
                          label="Item Name"
                          type="text"
                          fullWidth
                          value={itemName}
                          onChange={(e) => setItemName(e.target.value)}
                        />
                        <TextField
                          margin="dense"
                          label="Item Quantity"
                          type="number"
                          fullWidth
                          value={itemQuantity}
                          onChange={(e) => setItemQuantity(e.target.value)}
                        />
                      </DialogContent>
                      <DialogActions>
                        <Button
                          onClick={() => setEditDialogOpen(false)}
                          color="primary"
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleEditSave} color="primary">
                          Save
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </Box>
                </Box>
              ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
