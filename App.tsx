import { StatusBar } from 'react-native';
import { NativeBaseProvider } from 'native-base';
import { useFonts, Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';

import { AuthContext } from '@contexts/AuthContext';

import { Routes } from '@routes/index';

import { Loading } from '@components/Loading';

import { THEME } from './src/theme';

export default function App() {
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_700Bold });

  return (
    <NativeBaseProvider theme={THEME}>
      <StatusBar 
        barStyle='light-content'
        backgroundColor='transparent'
        translucent
      />
      <AuthContext.Provider value={{
        id: '1',
        name: 'Sergio',
        email: 'sergio@email.com',
        avatar: 'sergio.png'
      }}>
        {fontsLoaded ? <Routes /> : <Loading />}
      </AuthContext.Provider>
    </NativeBaseProvider>
  );
}