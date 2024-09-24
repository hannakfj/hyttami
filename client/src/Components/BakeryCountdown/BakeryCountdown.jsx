import React, { useState, useEffect } from 'react';
import { Text, Heading, Circle, Stack } from '@chakra-ui/react';
import cinnamonbun from '../../assets/cinnamonbun.jpg';

const BakeryCountdown = () => {
  // State variables to store time remaining and bakery status (open or closed)
  const [timeRemaining, setTimeRemaining] = useState('');
  const [bakeryStatus, setBakeryStatus] = useState('');

  useEffect(() => {
    const checkBakeryStatus = () => {
      const now = new Date();
      const day = now.getDay();
      const openingTime = new Date();
      const closingTime = new Date();

      // Define opening and closing hours (10:00 AM to 3:00 PM)
      openingTime.setHours(10, 0, 0, 0);
      closingTime.setHours(15, 0, 0, 0);

      // If it's Sunday, the bakery is closed and opens on Monday
      if (day === 0) {
        openingTime.setDate(openingTime.getDate() + 1); 
      }

      // Determine if bakery is open or closed, and calculate time remaining
      if (now < openingTime) {
        setBakeryStatus('Bakeri Nansen er stengt');
        setTimeRemaining(formatTime(openingTime - now));
      } else if (now >= openingTime && now <= closingTime) {
        setBakeryStatus('Bakeri Nansen er åpent');
        setTimeRemaining(formatTime(closingTime - now));
      } else {
        // If after closing hours, set countdown to the next opening time
        if (day >= 6) {
          openingTime.setDate(openingTime.getDate() + (day === 6 ? 2 : 1)); 
        } else {
          openingTime.setDate(openingTime.getDate() + 1); 
        }
        setBakeryStatus('Bakeri Nansen er stengt');
        setTimeRemaining(formatTime(openingTime - now));
      }
    };

    // Convert milliseconds to a more readable format (hours and minutes)
    const formatTime = (milliseconds) => {
      const totalSeconds = Math.floor(milliseconds / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      return `${hours}t ${minutes}m`;
    };

    // Run the status check every second
    const interval = setInterval(checkBakeryStatus, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Handle click event to open dnt website to Nansen Bakeri
  const handleClick = () => {
    window.open('https://www.dnt.no/hytter/betjente/haukeliseter/apningstider/', '_blank');
  };

  return (
    <Circle 
      onClick={handleClick} // Make the circle clickable
      cursor="pointer"
      backgroundImage={`url(${cinnamonbun})`} // Use a background image
      backgroundSize="cover" 
      backgroundPosition="center" 
      size="160px" 
      color="white" 
      boxShadow="lg" 
      opacity= '0.8'
      p={6} 
      textAlign="center"
      transition="transform 0.3s ease, opacity 0.3s ease"
      _hover={{
        transform: 'scale(1.1)', // Enlarge the circle slightly on hover
      }}
    >
      <Stack>
        <Heading color='black' as="h3" size="md">
          {bakeryStatus} {/* Display bakery status */}
        </Heading>
        <Text color='black'>
             {bakeryStatus === 'Bakeri Nansen er åpent' ? 'Stenger om' : 'Åpner om'}: {timeRemaining}
          {/* Show remaining time until closing or opening */}
        </Text>
      </Stack>
    </Circle>
  );
};

export default BakeryCountdown;
