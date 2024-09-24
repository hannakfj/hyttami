import React from 'react';
import { Box, Text, Badge, Stack, Image, Link } from '@chakra-ui/react';

function TripCard({ trip }) {
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      mb={4}
      boxShadow="md"
      bg="white"
      width='300px'

    >
      <Stack spacing={3}>
        {/* If trip.link exists, wrap the title with a Link */}
        {trip.link ? (
          <Link href={trip.link} isExternal fontWeight="bold" fontSize="lg" color="teal.500">
            {trip.name}
          </Link>
        ) : (
          <Text fontWeight="bold" fontSize="lg">
            {trip.name}
          </Text>
        )}
        <Text fontSize="sm" color="gray.500">
          Dato: {new Date(trip.date).toLocaleDateString()}
        </Text>
        <Badge colorScheme="teal" fontSize="0.8em">
          {trip.category}
        </Badge>
        <Text>Rating: {trip.rating} / 5</Text>
        <Text>{trip.description}</Text>
        {trip.image && (
          <Image src={trip.image} alt={trip.name} />
        )}
      </Stack>
    </Box>
  );
}

export default TripCard;
