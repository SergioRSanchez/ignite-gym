import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Center, ScrollView, VStack, Skeleton, Text, Heading, useToast } from 'native-base';
import { Controller, useForm } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

import { useAuth } from '@hooks/useAuth';

import { ScreenHeader } from '@components/ScreenHeader';
import { UserPhoto } from '@components/UserPhoto';
import { Input } from '@components/Input';
import { Button } from '@components/Button';

const PHOTO_SIZE = 33;

type FormDataProps = {
  name: string;
  email: string;
  password: string;
  old_password: string;
  password_confirm: string;
}

export function Profile() {
  const [photoIsLoading, setPhotoIsLoading] = useState(false);
  const [userPhoto, setUserPhoto] = useState('https://github.com/SergioRSanchez.png');

  const toast = useToast();

  const { user } = useAuth();
  
  const { control } = useForm<FormDataProps>({
    defaultValues: {
      name: user.name,
      email: user.email,
    }
  });

  async function handleUserPhotoSelect() {
    setPhotoIsLoading(true);

    try {
      const photoSelected = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 1,
      });
  
      if (photoSelected.canceled) {
        return;
      }

      if (photoSelected.assets[0].uri) {
        const photoInfo = await FileSystem.getInfoAsync(photoSelected.assets[0].uri, { size: true });
        
        if(photoInfo.exists && (photoInfo.size / 1024 / 1024) > 5) {
          return toast.show({
            title: 'Escolha uma imagem de no máximo 5MB',
            placement: 'top',
            bgColor: 'red.500'
          })
        };

        setUserPhoto(photoSelected.assets[0].uri);
      }
  
    } catch (error) {
      console.log(error);

    } finally {
      setPhotoIsLoading(false);
    }
  };

  return (
    <VStack flex={1}>
      <ScreenHeader title='Perfil' />

      <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
        <Center mt={6} px={10}>
          {
            photoIsLoading
            ?
            <Skeleton 
              w={PHOTO_SIZE}
              h={PHOTO_SIZE}
              rounded='full'
              startColor='gray.500'
              endColor='gray.400'
            />
            :
            <UserPhoto 
              source={{ uri: userPhoto }}
              alt='Imagem do usuário'
              size={PHOTO_SIZE}
            />
          }

          <TouchableOpacity onPress={handleUserPhotoSelect}>
            <Text color='green.500' fontWeight='bold' fontSize='md' mt={2} mb={8}>
              Alterar Foto
            </Text>
          </TouchableOpacity>

          <Controller 
            control={control}
            name='name'
            render={({ field: { value, onChange } }) => (
              <Input 
                placeholder='Nome'
                bg='gray.600'
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          
          <Controller 
            control={control}
            name='email'
            render={({ field: { value, onChange } }) => (
              <Input 
                placeholder='Email'
                bg='gray.600'
                color='gray.200'
                isDisabled
                editable={false}
                _disabled={{ bg: 'gray.600', opacity: 0.5 }}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          
          <Heading color='gray.200' fontSize='md' mb={2} alignSelf='flex-start' mt={12} fontFamily='heading'>
            Alterar senha
          </Heading>

          <Input 
            bg='gray.600'
            placeholder='Senha antiga'
            secureTextEntry
          />
          
          <Input 
            bg='gray.600'
            placeholder='Nova antiga'
            secureTextEntry
          />
          
          <Input 
            bg='gray.600'
            placeholder='Confirme a nova antiga'
            secureTextEntry
          />

          <Button 
            title='Atualizar'
            mt={4}
          />
        </Center>

        
      </ScrollView>
    </VStack>
  );
}