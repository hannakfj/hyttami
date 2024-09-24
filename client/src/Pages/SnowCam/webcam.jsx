import React from 'react'
import {Box, Button, Text} from '@chakra-ui/react'
import backgroundImage from '../../assets/background.jpg';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';



const Webcam = () => {
    const navigate = useNavigate()

    useEffect(() => {
      const storedUser = localStorage.getItem('user'); 
    
      if (!storedUser) {
        navigate('/login'); 
      }
    }, [navigate]);

  return (

    <Box 
    height="100vh" 
    bg="white" 
    backgroundImage={`url(${backgroundImage})`} 
    backgroundSize="cover" 
    backgroundPosition="bottom" 
    backgroundRepeat="no-repeat"
    textAlign="center"
    p={8}>
      <Box position="center" top={4} right={4}>
        <Button mb={6} color='white' bgColor="orange.400" onClick={() => navigate('/')}>
        Tilbake
      </Button>
        <div>Webkamera for snøovervåkning er ikke implementert enda</div>
      </Box>
      </Box>
  )
}

export default Webcam