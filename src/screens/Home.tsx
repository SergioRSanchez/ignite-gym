import { useState } from 'react';
import { HStack, VStack } from 'native-base';

import { HomeHeader } from '@components/HomeHeader';
import { Group } from '@components/Group';

export function Home() {
  const [groupSelected, setGroupSelected] = useState('costa');

  return (
    <VStack flex={1}>
      <HomeHeader />

      <HStack>
        <Group 
          name='costa'
          isActive={groupSelected === 'costa'}
          onPress={() => setGroupSelected('costa')}
        />
        <Group 
          name='ombro'
          isActive={groupSelected === 'ombro'}
          onPress={() => setGroupSelected('ombro')}
        />
      </HStack>
    </VStack>
  );
}