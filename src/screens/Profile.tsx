import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Center, ScrollView, VStack, Skeleton, Text, Heading, useToast } from 'native-base';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as yup from 'yup';

import { api } from '@services/api';

import { useAuth } from '@hooks/useAuth';

import { AppError } from '@utils/AppError';

import { ScreenHeader } from '@components/ScreenHeader';
import { UserPhoto } from '@components/UserPhoto';
import { Input } from '@components/Input';
import { Button } from '@components/Button';

import ProfileImage from '@assets/userPhotoDefault.png';

const PHOTO_SIZE = 33;

type FormDataProps = {
  name: string;
  email: string;
  password: string;
  old_password: string;
  confirm_password: string;
}

const profileSchema = yup.object({
  name: yup.string().required('Nome obrigatório'),
  password: yup.string().min(6, 'No mínimo 6 caracteres').nullable().transform((value) => (!!value ? value : null)),
  confirm_password: yup
    .string()
    .nullable()
    .transform((value) => (!!value ? value : null))
    .oneOf([yup.ref('password'), ''], 'As senhas precisam ser iguais')
    .when('password', {
      is: (Field: any) => Field,
      then: (schema) => schema.nullable().required('Confirmação de senha obrigatória').transform((value) => (!!value ? value : null)),
  }),
  // old_password: yup.string(),
})

export function Profile() {
  const [isUpdating, setIsUpdating] = useState(false);

  const [photoIsLoading, setPhotoIsLoading] = useState(false);

  const toast = useToast();

  const { user, updateUserProfile } = useAuth();

  const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
    defaultValues: {
      name: user.name,
      email: user.email,
    },
    resolver: yupResolver(profileSchema),
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

        // setUserPhoto(photoSelected.assets[0].uri);
        const fileExtension = photoSelected.assets[0].uri.split('.').pop();

        const userName = user.name.split(' ').join('-');
        
        const photoFile = {
          name: `${userName}.${fileExtension}`.toLowerCase(),
          uri: photoSelected.assets[0].uri,
          type: `${photoSelected.assets[0].type}/${fileExtension}`,
        } as any;

        const userPhotoUploadForm = new FormData();

        userPhotoUploadForm.append('avatar', photoFile);

        const avatarUpdatedResponse =  await api.patch('/users/avatar', userPhotoUploadForm, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });

        const userUpdated = user;
        userUpdated.avatar = avatarUpdatedResponse.data.avatar;

        updateUserProfile(userUpdated);

        toast.show({
          title: 'Foto atualizada com sucesso',
          placement: 'top',
          bgColor: 'green.700'
        });

      }
  
    } catch (error) {
      console.log(error);

    } finally {
      setPhotoIsLoading(false);
    }
  };

  async function handleProfileUpdate(data: FormDataProps) {
    try {
      setIsUpdating(true);

      const userUpdated = user;
      userUpdated.name = data.name;

      await api.put('/users', data);

      await updateUserProfile(userUpdated);

      toast.show({
        title: 'Perfil atualizado com sucesso',
        placement: 'top',
        bgColor: 'green.700'
      })

    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : 'Houve um erro ao atualizar o perfil. Tente novamente mais tarde.';

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500'
      })

    } finally {
      setIsUpdating(false);

    }
  }

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
              source={
                user.avatar 
                ? { uri: `${api.defaults.baseURL}/avatar/${user.avatar}` } 
                : ProfileImage
              }
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
                errorMessage={errors.name?.message}
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

          <Controller 
            control={control}
            name='old_password'
            render={({ field: { onChange } }) => (
              <Input 
                bg='gray.600'
                placeholder='Senha antiga'
                secureTextEntry
                onChangeText={onChange}
              />
            )}
          />
          
          <Controller 
            control={control}
            name='password'
            render={({ field: { onChange } }) => (
              <Input 
                bg='gray.600'
                placeholder='Nova senha'
                secureTextEntry
                onChangeText={onChange}
                errorMessage={errors.password?.message}
              />
            )}
          />
          
          <Controller 
            control={control}
            name='confirm_password'
            render={({ field: { onChange } }) => (
              <Input 
                bg='gray.600'
                placeholder='Confirme a nova antiga'
                secureTextEntry
                onChangeText={onChange}
                errorMessage={errors.confirm_password?.message}
              />
            )}
          />

          <Button 
            title='Atualizar'
            mt={4}
            onPress={handleSubmit(handleProfileUpdate)}
            isLoading={isUpdating}
          />
        </Center>

        
      </ScrollView>
    </VStack>
  );
}