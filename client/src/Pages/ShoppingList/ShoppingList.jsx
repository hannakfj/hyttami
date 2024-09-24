import React, { useState, useEffect } from 'react';
import { Box, Button, Input, Stack, Text, Heading, List, ListItem, IconButton, useColorModeValue } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import backgroundImage from '../../assets/background.jpg';
import { useNavigate } from 'react-router-dom';


const API_URL = 'http://localhost:3001'; 

function ShoppingList() {
  const [items, setItems] = useState([]); // State for shopping list items
  const [newItem, setNewItem] = useState(''); // State for new item input


  useEffect(() => {
    const storedUser = localStorage.getItem('user'); 

    if (!storedUser) {
      navigate('/login'); 
    }
  }, [navigate]);

  
  // Fetch shopping list items from the server when component mounts
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`${API_URL}/shopping-items`);
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error('Error fetching shopping items:', error);
      }
    };

    fetchItems();
  }, []);

  // Function to add new item to the list (sends a POST request)
  const handleAddItem = async () => {
    if (newItem.trim() !== '') {
      try {
        const response = await fetch(`${API_URL}/add-shopping-item`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newItem}), 
        });
        
        const data = await response.json();
        setItems([...items, data.item]); // Update list with new item
        setNewItem(''); // Reset input field
      } catch (error) {
        console.error('Error adding item:', error);
      }
    }
  };

  // Function to remove an item from the list (sends a DELETE request)
  const handleRemoveItem = async (id) => {
    try {
      await fetch(`${API_URL}/shopping-items/${id}`, { method: 'DELETE' });
      setItems(items.filter(item => item._id !== id)); // Update list with item removed
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  // Colors for dark and light mode
  const boxColor = useColorModeValue('white', 'gray.700');
  const inputBg = useColorModeValue('white', 'gray.800');
  const headingColor = useColorModeValue('orange.400');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const buttonGradient = 'linear(to-r, red.400, orange.300, yellow.200)';
  const buttonGradientHover = 'linear(to-r, red.500, orange.400, yellow.300)';
  const navigate = useNavigate()

  return (
    <Box 
      height="100vh" 
      bg="white" 
      backgroundImage={`url(${backgroundImage})`} 
      backgroundSize="cover" 
      backgroundPosition="bottom" 
      backgroundRepeat="no-repeat"
      textAlign="center"
      p={8}
      display="flex" 
      flexDirection="column" 
      justifyContent="center"
      alignItems="center"
    >
        <Box position="absolute" top={4} right={4}>
            <Button color='white' mb={6} bgColor="orange.400" onClick={() => navigate('/')}>
            Tilbake
        </Button>
        </Box>
      <Box
        width={{ base: "90%", md: "500px" }} // Responsive width
        bg={boxColor}
        borderRadius="lg"
        boxShadow="xl"
        p={6}
        textAlign="center"
      >
        <Heading color={headingColor} mb={6}>
          Handleliste
        </Heading>

        <Stack spacing={4} mb={6}>
          {/* Input field to add new item */}
          <Input
            placeholder="Legg til et nytt element"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            bg={inputBg}
            borderColor="orange.300"
            color={textColor}
            focusBorderColor="orange.400"
          />
          <Button 
            color='white'
            bgGradient={buttonGradient}
            onClick={handleAddItem}
            _hover={{ transform:'scale(1.01)', bgGradient: buttonGradientHover}}
          >
            Legg til
          </Button>
        </Stack>

        {/* Display the shopping list items */}
        {items.length > 0 ? (
          <List spacing={3}>
            {items.map((item) => (
              <ListItem key={item._id}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  p={3}
                  borderWidth={1}
                  borderRadius="lg"
                  boxShadow="md"
                  bg={inputBg}
                >
                  <Text color={textColor}>{item.name}</Text>
                  {/* Remove button for each item */}
                  <IconButton
                    aria-label="Fjern"
                    icon={<DeleteIcon />}
                    onClick={() => handleRemoveItem(item._id)}
                    colorScheme="red"
                    _hover={{ bg: 'red.300', transform: 'scale(1.05)' }}
                  />
                </Box>
              </ListItem>
            ))}
          </List>
        ) : (
          <Text color={textColor}>Ingen elementer i handlelisten</Text>
        )}
      </Box>
    </Box>
  );
}

export default ShoppingList;
