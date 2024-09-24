import React, { useState, useEffect } from 'react';
import { Button, Box, Heading, SimpleGrid, Text} from '@chakra-ui/react';
import TripCard from '../../Components/TripCard/TripCard';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../../assets/background.jpg';

const API_URL = 'http://localhost:3001'; // URL til din backend-server

function UserTrips() {
  const user = JSON.parse(localStorage.getItem('user')); // Ensure this is correct
  const userId = user?.userId; // Safely access userId in case user is null
  const [trips, setTrips] = useState([]); // State for alle turene
  const [isLoading, setIsLoading] = useState(true); // For å vise lastestatus
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem('user'); 
  
    if (!storedUser) {
      navigate('/login'); 
    }
  }, [navigate]);

  // Funksjon som henter alle turene til brukeren
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        if (userId) {
          // Correct URL with userId properly embedded
          const response = await fetch(`${API_URL}/user-trips?userId=${userId}`);
          const data = await response.json();
          
          if (response.ok) {
            setTrips(data); // Only update trips if the response is OK
          } else {
            console.error('Error fetching trips:', data.error);
          }
        } else {
          console.error('userId is not available.');
        }
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, [userId]); // Add userId as a dependency to ensure correct fetching

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
    p={8}>
      <Box position="absolute" top={4} right={4}>
        <Button mb={6} colorScheme="teal" onClick={() => navigate('/')}>
        Tilbake
      </Button>
      </Box>
      <Heading color='white' mb={6}>Mine Turer</Heading>
      <Button  mb={6} colorScheme="teal" onClick={()=> navigate('/registratetrip')}>
        Registrer ny tur
      </Button>
      {isLoading ? (
        <Text>Laster inn turer...</Text>
      ) : trips.length > 0 ? (
        <SimpleGrid width='1000px' columns={[1, null, 3]} spacing={5} mt={3} justifyItems="center" mx="auto">
          {trips.map((trip) => (
            <TripCard key={trip._id} trip={trip} />
          ))}
        </SimpleGrid>
      ) : (
        <Text>Du har ingen registrerte turer.</Text>
      )}
    </Box>
  );
}

export default UserTrips;
