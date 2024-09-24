import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Heading, Text, Stack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../../assets/background.jpg';


function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        onLogin(data); // Pass the complete user object to App.js
        navigate('/'); // Navigate to the main page after successful login
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Error: Unable to login');
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
    <Box
      bg='white'
      maxW="md"
      mx="auto"
      mt={8}
      p={6}
      borderWidth={1}
      borderRadius="lg"
      boxShadow="lg"
    >
      <Heading as="h2" mb={6} textAlign="center">
        Logg inn
      </Heading>

      {error && (
        <Text color="red.500" mb={4}>
          {error}
        </Text>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Brukernavn</FormLabel>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Skriv inn brukernavn"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Passord</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Skriv inn passord"
            />
          </FormControl>
          <Button type="submit" colorScheme="pink" bgGradient="linear(to-t, pink.300, blue.200)" width="full" mt={4}>
            Logg inn
          </Button>
        </Stack>
      </form>
    </Box>
    </Box>
  );
}

export default Login;