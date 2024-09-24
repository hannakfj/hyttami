import React, { useEffect } from 'react';
import { Box, Heading, Button, Circle, SimpleGrid, useColorModeValue } from '@chakra-ui/react';
import { SunIcon } from '@chakra-ui/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSnowflake } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../../assets/background.jpg';
import BakeryCountdown from '../../Components/BakeryCountdown/BakeryCountdown';

function Main({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();

  // Define button gradient and text color based on color mode
  const buttonGradient = 'linear(to-r, red.400, orange.300, yellow.200)';
  const textColor = useColorModeValue('brown', 'pink.100');

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  return (
    <Box 
      minH='100vh'
      bg="white" 
      backgroundAttachment="fixed"
      backgroundImage={`url(${backgroundImage})`} 
      backgroundSize="cover" 
      backgroundPosition="bottom" 
      backgroundRepeat="no-repeat"
      textAlign="center"
      p={8}
    >
      <Box position="absolute" top={4} right={4}>
        <Button onClick={onLogout} colorScheme="red">
          Logg ut
        </Button>
      </Box>
      <Heading color={textColor} fontFamily="'Cormorant Garamond', serif" my={6}>
        Raudbergvegen 47
      </Heading>
      {/* Create a grid with three columns */}
      <SimpleGrid width='40%' columns={[1, null, 3]} spacing={10} mt={2} justifyItems="center" gap={3} mx="auto">
        <Circle
          size="160px" 
          color="white" 
          boxShadow="lg" 
          p={6} 
          textAlign="center"
          transition="transform 0.3s ease, opacity 0.3s ease"
          _hover={{
            transform: 'scale(1.1)',
            opacity: '0.8',
          }}
          bgGradient={buttonGradient}
          onClick={() => navigate('/weather')}
        >
          <SunIcon boxSize={6} />
          <Box mt={2}>Værmelding</Box>
        </Circle>

        <Circle
          size="160px" 
          color="white" 
          boxShadow="lg" 
          p={6} 
          textAlign="center"
          transition="transform 0.3s ease, opacity 0.3s ease"
          _hover={{
            transform: 'scale(1.1)',
            opacity: '0.8',
          }}
          bgGradient={buttonGradient}
          onClick={() => navigate('/snowcam')}
        >
          <FontAwesomeIcon icon={faSnowflake} size="lg" />
          <Box mt={2}>Snøovervåkning</Box>
        </Circle>
        <Circle
          size="160px" 
          color="white" 
          boxShadow="lg" 
          p={6} 
          textAlign="center"
          transition="transform 0.3s ease, opacity 0.3s ease"
          _hover={{
            transform: 'scale(1.1)',
            opacity: '0.8',
          }}
          bgGradient={buttonGradient}
          onClick={() => navigate('/trips')}
        >
          <Box mt={2}>Mine turer</Box>
        </Circle>

        <Circle
          size="160px" 
          color="white" 
          boxShadow="lg" 
          p={6} 
          textAlign="center"
          transition="transform 0.3s ease, opacity 0.3s ease"
          _hover={{
            transform: 'scale(1.1)',
            opacity: '0.8',
          }}
          bgGradient={buttonGradient}
          onClick={() => navigate('/checkout')}
        >
          Utsjekk
        </Circle>

        <Circle
          size="160px" 
          color="white" 
          boxShadow="lg" 
          p={6} 
          textAlign="center"
          transition="transform 0.3s ease, opacity 0.3s ease"
          _hover={{
            transform: 'scale(1.1)',
            opacity: '0.8',
          }}
          bgGradient={buttonGradient}
          onClick={() => navigate('/shoppinglist')}
        >
          Handleliste
        </Circle>
        <BakeryCountdown />
      </SimpleGrid>

    </Box>
  );
}

export default Main;
