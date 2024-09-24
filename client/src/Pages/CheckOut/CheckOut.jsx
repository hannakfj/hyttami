import React, { useState, useEffect } from 'react';
import { Box, Text, Heading, List, ListItem, Checkbox, useColorModeValue, Button} from '@chakra-ui/react';
import backgroundImage from '../../assets/background.jpg';
import { useNavigate } from 'react-router-dom';


const API_URL = 'http://localhost:3001'; 

function CheckOut() {
  const [items, setItems] = useState([]); // State for checkout list items
  const [checkedItems, setCheckedItems] = useState({}); // State for managing checkbox states
  const navigate = useNavigate(); 



useEffect(() => {
  const storedUser = localStorage.getItem('user'); 

  if (!storedUser) {
    navigate('/login'); 
  }
}, [navigate]);
  // Fetch list items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`${API_URL}/checkout-items`);
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error('Error fetching checkout items:', error);
      }
    };

    fetchItems();
  }, []);

  const handleCheckboxChange = (itemId) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId], // Toggle the checked state for the item
    }));
  };

  const boxColor = useColorModeValue('white', 'gray.700');
  const inputBg = useColorModeValue('white', 'gray.800');
  const headingColor = useColorModeValue('orange.400');
  const textColor = useColorModeValue('gray.800', 'gray.100');


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
      <Box
        width={{ base: "90%", md: "500px" }}
        bg={boxColor}
        borderRadius="lg"
        boxShadow="xl"
        p={6}
        textAlign="center"
      >
        <Box position="absolute" top={4} right={4}>
            <Button color='white' mb={6} bgColor="orange.400" onClick={() => navigate('/')}>
            Tilbake
        </Button>
        </Box>
        <Heading color={headingColor} mb={6}>
          Huskeliste utsjekk
        </Heading>

        {/* Display the checkout list items */}
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
                  <Checkbox
                    isChecked={checkedItems[item._id] || false} // Bind checkbox to state
                    onChange={() => handleCheckboxChange(item._id)} // Handle checkbox toggle
                  >
                    <Text color={textColor}>{item.name}</Text>
                    {item.description && (
                      <Text color={textColor} fontSize="sm">
                        {item.description}
                      </Text>
                    )}
                  </Checkbox>
                </Box>
              </ListItem>
            ))}
          </List>
        ) : (
          <Text color={textColor}>Ingen elementer i utsjekkslisten</Text>
        )}
      </Box>
    </Box>
  );
}

export default CheckOut;
