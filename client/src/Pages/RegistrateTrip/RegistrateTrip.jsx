import React, { useState, useEffect } from 'react';
import { Box, Button, Input, Stack, Text, Heading, Select, Textarea } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../../assets/background.jpg';


const API_URL = 'https://hyttami.vercel.app/'; 
const userId = JSON.parse(localStorage.getItem('user'))?.userId; // Get userId from localStorage



function RegisterTrip() {

  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem('user'); 
  
    if (!storedUser) {
      navigate('/login'); 
    }
  }, [navigate]);

  
  const [trip, setTrip] = useState({
    name: '',
    date: '',
    category: '',
    rating: '',
    description: '',
    link:'',
  });
  const [image, setImage] = useState(null); // State to store the selected image
  // Handle changes in input fields for trip details
  const handleChange = (e) => {
    setTrip({
      ...trip,
      [e.target.name]: e.target.value,
    });
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result); // Convert the image file to a base64 string
    };

    if (file) {
      reader.readAsDataURL(file); // Read the file as a base64 string
    }
  };

  // Function to register a trip with an image
  const handleRegister = async () => {

    if (trip.name && trip.date && trip.category && trip.rating && trip.description && userId) {
      const data = {
        userId,
        name: trip.name,
        date: trip.date,
        category: trip.category,
        rating: trip.rating,
        description: trip.description,
        link: trip.link,
        image,

      };
  
      try {
        const response = await fetch(`${API_URL}/add-trip`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
  
        const result = await response.json();
        if (response.ok) {
          alert('Trip registered successfully!');
        } else {
          console.error('Error:', result.error);
        }
      } catch (error) {
        console.error('Error registering trip:', error);
      }
    } else {
      alert('Please fill in all fields.');
    }
  };

  return (
    <Box
    height="100vh"
    backgroundImage={`url(${backgroundImage})`} // Set background image
    backgroundSize="cover"
    backgroundPosition="bottom"
    backgroundRepeat="no-repeat"
    textAlign="center" 
    p={8} 
    borderRadius="lg" 
    boxShadow="xl" 
    border="2px solid"
    width="100vw">
    <Box p={8} textAlign="center" maxWidth="500px" margin="0 auto" bgColor='white'>
      <Box position="absolute" top={4} right={4}>
        <Button mb={6} colorScheme="teal" onClick={() => navigate('/')}>
        Tilbake
      </Button>
      </Box>
      <Heading mb={6}>Registrer Tur</Heading>
      <Stack spacing={4}>
        <Input
          placeholder="Navn på tur"
          name="name"
          value={trip.name}
          onChange={handleChange}
          required
        />
        <Input
          type="date"
          name="date"
          value={trip.date}
          onChange={handleChange}
          required
        />
        <Select
          placeholder="Velg kategori"
          name="category"
          value={trip.category}
          onChange={handleChange}
          required
        >
          <option value="Langrenn">Langrenn</option>
          <option value="Rando">Rando</option>
          <option value="Løpetur">Løpetur</option>
          <option value="Fottur">Fottur</option>
        </Select>
        <Input
          type="number"
          placeholder="Rating (1-5)"
          name="rating"
          value={trip.rating}
          onChange={handleChange}
          required
        />
        {/* <Input 
          type="url"
          placeholder="Link til mer informasjon (valgfritt)"
          name="link"
          value={trip.link}
          onChange={handleChange}
        /> */}
        <Textarea
          placeholder="Beskrivelse"
          name="description"
          value={trip.description}
          onChange={handleChange}
          required
        />
        {/* Image input field */}
        <Input 
          type="file" 
          accept="image/*" 
          onChange={handleImageChange} 
        />
        <Button onClick={handleRegister} colorScheme="teal">
          Registrer Tur
        </Button>
      </Stack>
    </Box>
    </Box>
  );
}

export default RegisterTrip;
