import { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Heading, HStack, Icon, Text, VStack, Image, Box, ScrollView, useToast } from 'native-base';
import { Feather } from '@expo/vector-icons';

import { api } from '@services/api';

import { AppError } from '@utils/AppError';

import { ExerciseDTO } from '@dtos/ExerciseDTO';

import { Button } from '@components/Button';
import { Loading } from '@components/Loading';

import { AppNavigatorRoutesProps } from '@routes/app.routes';

import BodySvg from '@assets/body.svg';
import SeriesSvg from '@assets/series.svg';
import RepetitionsSvg from '@assets/repetitions.svg';

type RoutesParamsProps = {
  exerciseId: string;
}

export function Exercise() {
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [exercise, setExercise] = useState({} as ExerciseDTO);

  const navigation = useNavigation<AppNavigatorRoutesProps>();

  const route = useRoute();

  const { exerciseId } = route.params as RoutesParamsProps;

  async function fetchExerciseDetails() {
    try {
      setIsLoading(true);

      const response = await api.get(`/exercises/${exerciseId}`);
      setExercise(response.data);

    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : 'Houve um erro ao carregar os grupos. Tente novamente mais tarde.';

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500'
      })

    } finally {
      setIsLoading(false);

    }
  }

  function handleGoBack() {
    navigation.goBack();
  }

  useEffect(() => {
    fetchExerciseDetails();
  }, [exerciseId]);

  return (
    <VStack flex={1}>
      <VStack px={8} bg='gray.600' pt={12}>
        <TouchableOpacity>
          <Icon as={Feather} name='arrow-left' color='green.500' size={6} onPress={handleGoBack}/>
        </TouchableOpacity>

        <HStack justifyContent='space-between' mt={4} mb={8} alignItems='center'>
          <Heading color='gray.100' fontSize='lg' flexShrink={1} fontFamily='heading'>
            {exercise.name}
          </Heading>

          <HStack alignItems='center'>
            <BodySvg />

            <Text color='gray.200' ml={1} textTransform='capitalize'>
              {exercise.group}
            </Text>
          </HStack>
        </HStack>
      </VStack>

      { isLoading ? <Loading /> :
        <ScrollView>
          <VStack p={8}>
            <Box rounded='lg' mb={3} overflow='hidden'>
              <Image 
                w='full'
                h='80'
                source={{ uri: `${api.defaults.baseURL}/exercise/demo/${exercise.demo}` }}
                alt={`Imagem do exercício ${exercise.name}`}
                resizeMode='cover'
                rounded='lg'
              />
            </Box>

            <Box bg='gray.600' rounded='md' pb={4} px={4}>
              <HStack justifyContent='space-around' alignItems='center' mb={6} mt={5}>
                <HStack>
                  <SeriesSvg />
                  <Text color='gray.200' ml={2}>
                    {exercise.series} séries
                  </Text>
                </HStack>
                
                <HStack>
                  <RepetitionsSvg />
                  <Text color='gray.200' ml={2}>
                    {exercise.repetitions} repetições
                  </Text>
                </HStack>
              </HStack>

              <Button title='Marcar como realizado' />
            </Box>
          </VStack>
        </ScrollView>
      }
    </VStack>
  );
}