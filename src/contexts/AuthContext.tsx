import { createContext, ReactNode, useEffect, useState } from 'react';

import { storageUserSave, storageUserGet, storageUserRemove } from '@storage/storageUser';
import { storageAuthTokenSave, storageAuthTokenGet } from '@storage/storageAuthToken';

import { api } from '@services/api';

import { UserDTO } from '@dtos/UserDTO';

export type AuthContextDataProps = {
  user: UserDTO;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoadingUserStorageData: boolean;
}

type AuthContextProviderProps = {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps);

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<UserDTO>({} as UserDTO);

  const [isLoadingUserStorageData, setIsLoadingUserStorageData] = useState(true);

  //  Atualiza o token e salva os dados do usuário no estado
  async function userAndTokenUpdate(userData: UserDTO, token: string) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
    setUser(userData);
  }

  //  Função para salvar os dados do usuário e o token no dispositivo
  async function storageUserAndTokenSave(userData: UserDTO, token: string) {
    try {
      setIsLoadingUserStorageData(true);

      await storageUserSave(userData);
      await storageAuthTokenSave(token);

    } catch (error) {
      throw error;

    } finally {
      setIsLoadingUserStorageData(false);
    }
  }

  //  Faz autenticação, chamando a função de armazenar os dados no dispositivo
  //  Atualiza o estado do usuário e o cabeçalho de autenticação
  async function signIn(email: string, password: string) {
    try {
      const { data } = await api.post('/sessions', { email, password });

      if (data.user && data.token) {
        await storageUserAndTokenSave(data.user, data.token);
        
        userAndTokenUpdate(data.user, data.token);
      }

    } catch (error) {
      throw error;

    }
  }

  async function signOut() {
    try {
      setIsLoadingUserStorageData(true);
      
      setUser({} as UserDTO);
      await storageUserRemove();

    } catch (error) {
      throw error;

    } finally {
      setIsLoadingUserStorageData(false);
    }
  }

  //  Busca as informações do usuário
  async function loadUserData() {
    try {
      setIsLoadingUserStorageData(true);

      const userLogged = await storageUserGet();
      const token = await storageAuthTokenGet();

      if (userLogged && token) {
        userAndTokenUpdate(userLogged, token);

      }
    } catch (error) {
      throw error;

    } finally {
      setIsLoadingUserStorageData(false);

    }
  }

  useEffect(() => {
    loadUserData();
  }, []);
  
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        signIn,
        signOut,
        isLoadingUserStorageData
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}