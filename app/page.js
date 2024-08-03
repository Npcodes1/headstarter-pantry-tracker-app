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
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faMinus,
  faPenToSquare,
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
    marginLeft: theme.spacing(1),
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

  //set variable for updating the name or price field.
  const [editQuantity, setEditQuantity] = useState("");

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

  //To add items
  const addItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
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
  const editItem = async (item, newQuantity) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      //update document with the new fields
      const { quantity } = docSnap.data();
      await setDoc(docRef, { item, quantity: editQuantity }, { merge: true });
      alert("Iteme updated succesfully");
      setDoc(docRef, { item, quantity: editQuantity });
    } else {
      await setDoc(docRef, { quantity });
    }
    await updateInventory();
  };

  //To remove items
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
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

  //useEffect -run codes and updates whenever something in the dependency array changes. Leave empty to update when the page loads
  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2 }}
          ></IconButton>
          <Typography
            variant="h5"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
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
      >
        <Typography variant="h1" paddingTop={5}>
          StockSnap
        </Typography>
        <Typography variant="h6" width="40vw" padding={5} textAlign="center">
          An Inventory Management System designed to help efficiently track and
          manage food/pantry inventories
        </Typography>

        <Modal open={open} onClose={handleClose}>
          {/* center box on screen */}
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={400}
            bgcolor="white"
            border="2px solid #000"
            boxShadow={24}
            p={4}
            display="flex"
            flexDirection="column"
            gap={3}
            sx={{
              transform: "translate(-50%, -50%)",
            }}
          >
            <Typography variant="h6">Add Item</Typography>

            {/* To display the box in stacking form */}
            <Stack width="100%" direction="row" spacing={2}>
              <TextField
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => {
                  setItemName(e.target.value);
                }}
              />

              <Button
                variant="outlined"
                onClick={() => {
                  addItem(itemName);
                  setItemName("");
                  handleClose();
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>

        <Box border="1px solid #333">
          <Box
            width="800px"
            height="150px"
            bgcolor="#ADD8E6"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            padding={10}
          >
            <Typography variant="h2" color="#333" paddingBottom={3}>
              Inventory Items{" "}
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                handleOpen();
              }}
            >
              Add New Item
            </Button>
          </Box>
          <Box>
            <Search>
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
          <Stack width="800px" height="300px" spacing={2} overflow="auto">
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
                  alignItems="center"
                  justifyContent="space-between"
                  bgcolor="#f0f0f0"
                  padding={5}
                >
                  <Typography variant="h3" color="#333" textAlign="center">
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Typography variant="h3" color="#333" textAlign="center">
                    {quantity}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => {
                      addItem(name);
                    }}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      editItem(name);
                    }}
                  >
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      removeItem(name);
                    }}
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </Button>
                </Box>
              ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
