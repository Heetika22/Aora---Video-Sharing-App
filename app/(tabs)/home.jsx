import { FlatList, Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import {images} from '../../constants'
import SearchInput from '../../components/SearchInput'

const Home = () => {
  return (
    <SafeAreaView className="bg-primary">
      <StatusBar backgroundColor='#161622' style="light"></StatusBar>
      <FlatList 
        data={[{id:1}]}
        keyExtractor={(item)=>{item.$id}}
        renderItem={({item}) => (
            <Text className="text-3xl text-white">{item.id}</Text>
        )}
        ListHeaderComponent={() => (
          <View className="my-6 px-4 space-y-6">
            <View className="justify-between flex-row items-start mb-6">
              <View>
                <Text className="font-pmedium text-sm text-gray-100">Welcome Back</Text>
                <Text className="text-2xl font-psemiblod text-white">Heetika</Text>
              </View>

              <View className="mt-1.5">
                <Image source={images.logoSmall} className="w-9 h-10" resizeMode='contain'/>
              </View>
            </View>

            <SearchInput />

            <View className="w-full flex-1 pt-5 pb-8">
              <Text className="text-gary-100 text-white font-pregular">
                Latest Videos
              </Text>
              
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  )
}

export default Home

const styles = StyleSheet.create({})